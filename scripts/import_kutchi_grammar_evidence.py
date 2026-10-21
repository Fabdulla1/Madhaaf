"""Import the second owner-supplied grammar elicitation without inventing forms.

Dry run by default. Use --rehearse to execute twice inside a rolled-back
transaction. Production --apply requires an external backup directory. This
script needs psycopg 3 and the dictionary attestation migrations.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from import_kutchi_linguistic_evidence import (
    connection_url, ensure_draft, next_order, read_existing, snapshot,
)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kutchi-grammar-evidence-20261021.json"
FORM_FIELDS = (
    "lexeme_id", "written_form", "grammatical_person", "grammatical_number",
    "gender", "tense", "aspect", "mood", "politeness",
)


def evidence():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    sentences = [item["kutchi"].casefold() for item in payload["examples"]]
    if len(sentences) != len(set(sentences)):
        raise RuntimeError("Evidence file contains duplicate sentences")
    headwords = [item["headword"].casefold() for item in payload["new_lexemes"]]
    if len(headwords) != len(set(headwords)):
        raise RuntimeError("Evidence file contains duplicate headwords")
    return payload


def read_state(cursor):
    """Read the shared dictionary state plus provenance fields needed for identity."""
    existing = read_existing(cursor)
    cursor.execute("select id,note,original_transcription from public.examples")
    example_details = {row["id"]: row for row in cursor.fetchall()}
    for row in existing["examples"]:
        row.update(example_details[row["id"]])
    cursor.execute("select id,citation,notes from public.sources")
    source_details = {row["id"]: row for row in cursor.fetchall()}
    for row in existing["sources"]:
        row.update(source_details[row["id"]])
    cursor.execute("select id,lexeme_id,spelling,is_preferred,note from public.word_forms")
    existing["spellings"] = cursor.fetchall()
    return existing


def build_plan(payload, existing):
    """Resolve exact lexical identities only; hold semantic/orthographic conflicts."""
    by_headword = defaultdict(list)
    by_spelling = defaultdict(set)
    meanings = defaultdict(set)
    for item in existing["lexemes"]:
        by_headword[item["headword"].casefold()].append(item)
    for item in existing["spellings"]:
        by_spelling[item["spelling"].casefold()].add(item["lexeme_id"])
    for item in existing["senses"]:
        meanings[item["lexeme_id"]].add(item["gloss_en"].casefold())
    new, existing_ids, conflicts = [], {}, []
    for item in payload["new_lexemes"]:
        name = item["headword"]
        exact = by_headword[name.casefold()]
        if len(exact) > 1:
            conflicts.append(f"{name}: multiple existing homographs")
        elif not exact and by_spelling[name.casefold()]:
            conflicts.append(f"{name}: matches an existing spelling variant")
        elif not exact:
            new.append(item)
        elif item["meaning"].casefold() not in meanings[exact[0]["id"]]:
            conflicts.append(f"{name}: existing meaning differs; review required")
        elif (item.get("part_of_speech") and exact[0]["part_of_speech"]
              and item["part_of_speech"].casefold()
              != exact[0]["part_of_speech"].casefold()):
            conflicts.append(f"{name}: existing part of speech differs")
        else:
            existing_ids[name] = exact[0]["id"]
    return {"new": new, "existing_ids": existing_ids, "conflicts": conflicts}


def resolve_refs(cursor, new_ids):
    cursor.execute("select id,headword,part_of_speech from public.lexemes")
    by_name = defaultdict(list)
    for row in cursor.fetchall():
        by_name[row["headword"].casefold()].append(row)

    def resolve(ref):
        name, sep, pos = ref.partition("|")
        choices = by_name[name.casefold()]
        if sep:
            choices = [x for x in choices if (x["part_of_speech"] or "").casefold() == pos.casefold()]
        if len(choices) != 1:
            raise RuntimeError(f"Dictionary reference {ref!r} has {len(choices)} matches")
        return choices[0]["id"]

    for name, entry_id in new_ids.items():
        if resolve(name) != entry_id:
            raise RuntimeError(f"New entry {name} did not resolve uniquely")
    return resolve


def example_conflicts(matches, item, source_id, primary_id):
    if len(matches) > 1:
        return True
    if not matches:
        return False
    old = matches[0]
    return (
        old["english_translation"] != item["english"]
        or old["source_id"] != source_id
        or old["lexeme_id"] != primary_id
        or old["note"] != item.get("note")
        or old["original_transcription"] != item.get("original_transcription")
    )


def apply_import(cursor, payload, existing, plan):
    counts = Counter()
    source_title = payload["source"]["title"]
    source_matches = [x for x in existing["sources"] if x["title"] == source_title]
    if len(source_matches) > 1:
        raise RuntimeError("Duplicate source title requires review")
    if source_matches:
        if (source_matches[0]["citation"] != payload["source"]["citation"]
                or source_matches[0]["notes"] != payload["source"]["notes"]):
            raise RuntimeError("Existing source title has different provenance")
        source_id = source_matches[0]["id"]
    else:
        cursor.execute(
            "insert into public.sources(title,citation,notes) values (%s,%s,%s) returning id",
            (source_title, payload["source"]["citation"], payload["source"]["notes"]),
        )
        source_id = cursor.fetchone()["id"]
        counts["new_sources"] += 1

    statuses = {x["id"]: x["status"] for x in existing["lexemes"]}
    changed = set()
    new_ids = {}
    for item in plan["new"]:
        cursor.execute(
            "insert into public.lexemes(headword,part_of_speech,usage_note,status) "
            "values (%s,%s,%s,'draft') returning id",
            (item["headword"], item.get("part_of_speech"), item.get("note")),
        )
        entry_id = cursor.fetchone()["id"]
        new_ids[item["headword"]] = entry_id
        statuses[entry_id] = "draft"
        cursor.execute(
            "insert into public.senses(lexeme_id,gloss_en,display_order) values (%s,%s,0)",
            (entry_id, item["meaning"]),
        )
        counts["new_lexemes"] += 1
        counts["new_senses"] += 1

    resolve = resolve_refs(cursor, new_ids)
    old_ids = {x["id"] for x in existing["lexemes"]}
    touched_old = set()
    source_links = {(x["lexeme_id"], x["source_id"]) for x in existing["source_links"]}
    for entry_id in new_ids.values():
        if (entry_id, source_id) not in source_links:
            cursor.execute(
                "insert into public.lexeme_sources(lexeme_id,source_id) "
                "values (%s,%s) on conflict do nothing",
                (entry_id, source_id),
            )
            counts["new_source_links"] += cursor.rowcount

    old_spellings = {
        (row["lexeme_id"], row["spelling"].casefold()): row
        for row in existing["spellings"]
    }
    for variant in payload["spelling_variants"]:
        entry_id = resolve(variant["lemma"])
        key = (entry_id, variant["spelling"].casefold())
        if any(row["id"] != entry_id and row["headword"].casefold() == key[1]
               for row in existing["lexemes"]) or any(
                   row["lexeme_id"] != entry_id
                   and row["spelling"].casefold() == key[1]
                   for row in existing["spellings"]
               ):
            counts["conflicting_spellings"] += 1
            continue
        if key in old_spellings:
            old = old_spellings[key]
            counts["skipped_spellings" if (
                old["note"] == variant["note"] and not old["is_preferred"]
            ) else "conflicting_spellings"] += 1
            continue
        ensure_draft(cursor, entry_id, statuses, changed)
        cursor.execute(
            "insert into public.word_forms(lexeme_id,spelling,is_preferred,note) "
            "values (%s,%s,false,%s)",
            (entry_id, variant["spelling"], variant["note"]),
        )
        counts["new_spellings"] += 1
        if entry_id in old_ids:
            touched_old.add(entry_id)
        old_spellings[key] = {"note": variant["note"], "is_preferred": False}
        if (entry_id, source_id) not in source_links:
            cursor.execute(
                "insert into public.lexeme_sources(lexeme_id,source_id) "
                "values (%s,%s) on conflict do nothing",
                (entry_id, source_id),
            )
            counts["new_source_links"] += cursor.rowcount
            source_links.add((entry_id, source_id))

    old_forms = {tuple(row.get(field) for field in FORM_FIELDS): row
                 for row in existing["inflections"]}
    for form in payload["forms"]:
        entry_id = resolve(form["lemma"])
        key = (entry_id,) + tuple(form.get(field) for field in FORM_FIELDS[1:])
        expected = (form.get("original_transcription"), "attested", source_id, form["note"])
        if key in old_forms:
            old = old_forms[key]
            actual = (old["original_transcription"], old["evidence_status"],
                      old["source_id"], old["note"])
            counts["skipped_forms" if actual == expected else "conflicting_forms"] += 1
            continue
        ensure_draft(cursor, entry_id, statuses, changed)
        cursor.execute(
            "insert into public.inflected_forms(lexeme_id,written_form,grammatical_person,"
            "grammatical_number,gender,tense,aspect,mood,politeness,"
            "original_transcription,evidence_status,source_id,note) "
            "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'attested',%s,%s)",
            (*key, form.get("original_transcription"), source_id, form["note"]),
        )
        counts["new_forms"] += 1
        if entry_id in old_ids:
            touched_old.add(entry_id)
        old_forms[key] = {
            "original_transcription": form.get("original_transcription"),
            "evidence_status": "attested", "source_id": source_id, "note": form["note"],
        }

    old_examples = defaultdict(list)
    for row in existing["examples"]:
        old_examples[row["kutchi_text"].casefold()].append(row)
    links = {(x["example_id"], x["lexeme_id"]) for x in existing["example_links"]}
    for item in payload["examples"]:
        primary_id = resolve(item["primary"])
        linked_ids = {resolve(ref) for ref in item.get("links", [])} - {primary_id}
        matches = old_examples[item["kutchi"].casefold()]
        if example_conflicts(matches, item, source_id, primary_id):
            counts["conflicting_examples"] += 1
            continue
        if matches:
            example_id = matches[0]["id"]
            counts["skipped_examples"] += 1
        else:
            ensure_draft(cursor, primary_id, statuses, changed)
            cursor.execute(
                "select id from public.senses where lexeme_id=%s "
                "order by display_order,id limit 1", (primary_id,),
            )
            sense = cursor.fetchone()
            if not sense:
                raise RuntimeError(f"Primary lexeme {item['primary']} has no sense")
            sense_id = sense["id"]
            cursor.execute(
                "insert into public.examples(sense_id,kutchi_text,english_translation,"
                "source_id,note,original_transcription,display_order) "
                "values (%s,%s,%s,%s,%s,%s,%s) returning id",
                (sense_id, item["kutchi"], item["english"], source_id,
                 item.get("note"), item.get("original_transcription"),
                 next_order(cursor, "examples", "sense_id", sense_id)),
            )
            example_id = cursor.fetchone()["id"]
            counts["new_examples"] += 1
            if primary_id in old_ids:
                touched_old.add(primary_id)
        for entry_id in linked_ids:
            if (example_id, entry_id) in links:
                continue
            ensure_draft(cursor, primary_id, statuses, changed)
            ensure_draft(cursor, entry_id, statuses, changed)
            cursor.execute(
                "insert into public.example_lexemes(example_id,lexeme_id) "
                "values (%s,%s) on conflict do nothing", (example_id, entry_id),
            )
            counts["new_example_links"] += cursor.rowcount
            if entry_id in old_ids:
                touched_old.add(entry_id)
            links.add((example_id, entry_id))

    for entry_id in changed:
        cursor.execute("update public.lexemes set status='published' where id=%s", (entry_id,))
    for item in plan["new"]:
        if item.get("publish", True):
            cursor.execute(
                "update public.lexemes set status='published' where id=%s",
                (new_ids[item["headword"]],),
            )
    counts["updated_existing_lexemes"] = len(touched_old)
    return counts


def rehearse(cursor, payload, existing, plan):
    before = {x["id"]: x["status"] for x in existing["lexemes"]}
    first = apply_import(cursor, payload, existing, plan)
    cursor.execute("select id,status from public.lexemes")
    after = {x["id"]: x["status"] for x in cursor.fetchall()}
    if any(after[key] != value for key, value in before.items()):
        raise RuntimeError("Existing publication status changed")
    cursor.execute(
        "select headword,status from public.lexemes where id <> all(%s::uuid[])",
        (list(before),),
    )
    expected_status = {
        item["headword"]: "published" if item.get("publish", True) else "draft"
        for item in plan["new"]
    }
    for row in cursor.fetchall():
        if row["status"] != expected_status[row["headword"]]:
            raise RuntimeError(f"Wrong publication status for {row['headword']}")
    for spelling, lemma in (("chokre", "chokro"), ("ku’la", "ku'la")):
        cursor.execute(
            "select l.id from public.search_dictionary(%s,24,0) result "
            "join public.lexemes l on l.id=result.lexeme_id where l.headword=%s",
            (spelling, lemma),
        )
        if cursor.fetchone() is None:
            raise RuntimeError(f"Search did not resolve {spelling} to {lemma}")
    cursor.execute(
        "select l.id from public.search_dictionary('thadho',24,0) result "
        "join public.lexemes l on l.id=result.lexeme_id where l.headword='thadho'"
    )
    if cursor.fetchone() is not None:
        raise RuntimeError("Draft thadho was exposed in dictionary search")
    second_existing = read_state(cursor)
    second_plan = build_plan(payload, second_existing)
    if second_plan["new"] or second_plan["conflicts"]:
        raise RuntimeError("Second pass did not resolve lexical identities")
    second = apply_import(cursor, payload, second_existing, second_plan)
    if any(value for key, value in second.items() if key.startswith("new_") or key == "updated_existing_lexemes"):
        raise RuntimeError(f"Second pass was not idempotent: {dict(second)}")
    if any(result[key] for result in (first, second) for key in
           ("conflicting_spellings", "conflicting_forms", "conflicting_examples")):
        raise RuntimeError("Existing evidence conflicts require manual review")
    return {"first": dict(first), "second": dict(second),
            "existing_statuses_preserved": True,
            "form_and_variant_search_verified": True,
            "draft_hidden_from_search": True, "rolled_back": True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--rehearse", action="store_true")
    mode.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-dir", type=Path)
    args = parser.parse_args()
    if args.apply and not args.backup_dir:
        parser.error("--apply requires --backup-dir")
    if args.backup_dir:
        backup_dir = args.backup_dir.resolve()
        if backup_dir == ROOT or ROOT in backup_dir.parents:
            parser.error("Backup directory must be outside the repository")
    payload = evidence()
    import psycopg
    from psycopg.rows import dict_row
    with psycopg.connect(connection_url(), row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("set transaction isolation level serializable")
            cursor.execute("select pg_advisory_xact_lock(20261021, 95)")
            cursor.execute(
                "select current_database() as database,current_user as role,"
                "to_regclass('public.inflected_forms') as forms_table,"
                "to_regclass('public.example_lexemes') as links_table,"
                "has_table_privilege(current_user,'public.lexemes','INSERT,UPDATE') as can_edit"
            )
            target = cursor.fetchone()
            if not target["forms_table"] or not target["links_table"] or not target["can_edit"]:
                raise RuntimeError("Required migration or dictionary edit privilege missing")
            existing = read_state(cursor)
            plan = build_plan(payload, existing)
            summary = {
                "mode": "apply" if args.apply else "rehearse" if args.rehearse else "dry-run",
                "database": target["database"], "database_role": target["role"],
                "evidence_sha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
                "existing_lexemes": len(existing["lexemes"]),
                "planned_new_lexemes": len(plan["new"]),
                "planned_draft_holds": [item["headword"] for item in plan["new"]
                                        if not item.get("publish", True)],
                "supplied_forms": len(payload["forms"]),
                "supplied_spelling_variants": len(payload["spelling_variants"]),
                "supplied_examples": len(payload["examples"]),
                "conflicts": plan["conflicts"],
                "held_analyses": [
                    "chokre/chokro distribution", "hin/hee category and ke distribution",
                    "kapetho and other desire predicates lack a confirmed lemma",
                    "dhinose/dhine and disa(n)tho citation lemmas",
                    "maru/maroo and marue(n); thadho/thadh held draft",
                    "nathi/nathaa parent analysis",
                    "hee/hinee/mere/nah/mujo/jo existing sense differences",
                ],
            }
            print(json.dumps(summary, ensure_ascii=False, indent=2))
            if plan["conflicts"] and (args.rehearse or args.apply):
                raise RuntimeError("Existing lexical conflicts require manual review")
            if args.rehearse:
                try:
                    print(json.dumps(rehearse(cursor, payload, existing, plan),
                                     ensure_ascii=False, indent=2))
                finally:
                    connection.rollback()
                return
            if not args.apply:
                connection.rollback()
                return
            backup_dir.mkdir(parents=True, exist_ok=True)
            path = backup_dir / f"madhaaf-dictionary-before-grammar-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
            if path.exists():
                raise RuntimeError("Backup file already exists")
            path.write_text(json.dumps(snapshot(cursor), ensure_ascii=False, default=str, indent=2),
                            encoding="utf-8")
            counts = apply_import(cursor, payload, existing, plan)
            if any(counts[key] for key in
                   ("conflicting_spellings", "conflicting_forms", "conflicting_examples")):
                raise RuntimeError("Evidence conflict prevents commit")
            print(json.dumps({"backup": str(path), "counts": dict(counts)}, indent=2))
        connection.commit()


if __name__ == "__main__":
    main()
