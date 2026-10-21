"""Import the owner-supplied Kutchi elicitation into the existing dictionary.

Dry run by default. Requires psycopg 3 for database access:
    python -m pip install "psycopg[binary]"
    python scripts/import_kutchi_linguistic_evidence.py
    python scripts/import_kutchi_linguistic_evidence.py --backup-only --backup-dir PATH_OUTSIDE_REPO
    python scripts/import_kutchi_linguistic_evidence.py --rehearse
    python scripts/import_kutchi_linguistic_evidence.py --apply --backup-dir PATH_OUTSIDE_REPO

The production operation uses one serializable transaction and restores the
publication state of every touched entry before commit. It never guesses an
unattested inflection or merges a near-spelling collision.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kutchi-linguistic-evidence-20261021.json"
PRESENT_CONTEXTS = (
    ("first", "singular", "masculine"),
    ("first", "singular", "feminine"),
    ("second", "singular", "masculine"),
    ("second", "singular", "feminine"),
    ("third", "singular", "masculine"),
    ("third", "singular", "feminine"),
    ("first", "plural", None),
    ("third", "plural", None),
)
FORM_FIELDS = (
    "lexeme_id", "written_form", "grammatical_person", "grammatical_number",
    "gender", "tense", "aspect", "mood", "politeness",
)
BACKUP_TABLES = (
    "lexemes", "word_forms", "senses", "examples", "example_lexemes",
    "inflected_forms", "sources", "lexeme_sources", "related_lexemes",
)
HELD_DRAFT_HEADWORDS = {"khaa", "i(n)ya", "i(n)ye", "i(n)yo", "ai"}


def evidence():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    assert len(payload["verbs"]) == 8
    assert len(payload["vocabulary"]) == 24
    assert len(payload["examples"]) == 25
    assert len({v["lemma"] for v in payload["verbs"]}) == 8
    assert len({e["kutchi"].casefold() for e in payload["examples"]}) == 25
    return payload


def forms(payload):
    """Expand literal supplied cells into records; no forms are generated."""
    result = []
    originals = payload["explicit_original_transcriptions"]
    for verb in payload["verbs"]:
        assert len(verb["present"]) == len(PRESENT_CONTEXTS)
        for written, (person, number, gender) in zip(
            verb["present"], PRESENT_CONTEXTS, strict=True
        ):
            result.append({
                "lemma": verb["lemma"], "written_form": written,
                "grammatical_person": person, "grammatical_number": number,
                "gender": gender, "tense": "present", "aspect": None,
                "mood": None, "politeness": None,
                "original_transcription": originals.get(written),
                "note": (
                    "Elicited with they/everyone; collective agreement unresolved."
                    if person == "third" and number == "plural" else
                    "Aspect unassigned; elicited present set permits ongoing and habitual readings."
                ),
            })
        for past in verb["past"]:
            person = past.get("person", "first" if "context" not in past else None)
            number = past.get("number", "singular" if person == "first" else None)
            result.append({
                "lemma": verb["lemma"], "written_form": past["form"],
                "grammatical_person": person, "grammatical_number": number,
                "gender": past.get("gender"), "tense": "past", "aspect": None,
                "mood": None, "politeness": None,
                "original_transcription": None, "note": past.get("context"),
            })
        result.append({
            "lemma": verb["lemma"], "written_form": verb["future"],
            "grammatical_person": "first", "grammatical_number": "singular",
            "gender": None, "tense": "future", "aspect": None,
            "mood": None, "politeness": None,
            "original_transcription": None,
            "note": "Only first-person future context attested.",
        })
        result.append({
            "lemma": verb["lemma"], "written_form": verb["imperative"],
            "grammatical_person": "second", "grammatical_number": "singular",
            "gender": None, "tense": None, "aspect": None,
            "mood": "imperative", "politeness": None,
            "original_transcription": None, "note": "Attested singular command.",
        })
    result.append({
        "lemma": "khaa", "written_form": "khaa",
        "grammatical_person": "second", "grammatical_number": "singular",
        "gender": None, "tense": None, "aspect": None,
        "mood": "imperative", "politeness": None,
        "original_transcription": None,
        "note": "Attested command; citation lemma unresolved.",
    })
    assert len(result) == 95
    assert len({(x["lemma"], x["written_form"]) for x in result}) == 95
    return result


def desired_lexemes(payload):
    wanted = {}
    for verb in payload["verbs"]:
        wanted[verb["lemma"]] = {
            "headword": verb["lemma"], "meaning": verb["meaning"],
            "part_of_speech": "verb", "note": verb.get("note"),
        }
    for item in payload["vocabulary"]:
        assert item["headword"] not in wanted
        wanted[item["headword"]] = item
    wanted["khaa"] = {
        "headword": "khaa", "meaning": "eat",
        "part_of_speech": "verb",
        "note": "Only the singular imperative is attested. Citation lemma unknown.",
    }
    for item in payload["copula_forms"]:
        assert item["form"] not in wanted
        wanted[item["form"]] = {
            "headword": item["form"], "meaning": "be (provisional analysis)",
            "part_of_speech": None,
            "note": "Attested form; membership in a shared copula paradigm is provisional.",
        }
    return wanted


def env_values():
    values = dict(os.environ)
    path = ROOT / ".env.local"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                name, value = line.split("=", 1)
                values.setdefault(name, value.strip().strip('"').strip("'"))
    return values


def connection_url():
    values = env_values()
    url = values.get("madhaaf_db_POSTGRES_URL_NON_POOLING")
    if not url:
        raise RuntimeError("Direct database URL is unavailable")
    return url


def scalar(cursor):
    return next(iter(cursor.fetchone().values()))


def snapshot(cursor):
    result = {"tables": {}}
    for table in BACKUP_TABLES:
        cursor.execute("select to_regclass(%s)", (f"public.{table}",))
        if scalar(cursor) is None:
            continue
        cursor.execute(f"select * from public.{table}")
        result["tables"][table] = cursor.fetchall()
    cursor.execute(
        "select pg_get_functiondef("
        "to_regprocedure('public.search_dictionary(text,integer,integer)'))"
    )
    result["search_dictionary_function"] = scalar(cursor)
    cursor.execute(
        "select pg_get_viewdef(to_regclass('public.published_sources'), true)"
    )
    result["published_sources_view"] = scalar(cursor)
    return result


def read_existing(cursor):
    cursor.execute(
        "select id,headword,part_of_speech,usage_note,status from public.lexemes"
    )
    lexemes = cursor.fetchall()
    cursor.execute("select lexeme_id,spelling from public.word_forms")
    spellings = cursor.fetchall()
    cursor.execute("select id,lexeme_id,gloss_en,display_order from public.senses")
    senses = cursor.fetchall()
    cursor.execute(
        "select e.id,e.sense_id,e.kutchi_text,e.english_translation,e.source_id,"
        "s.lexeme_id from public.examples e "
        "join public.senses s on s.id=e.sense_id"
    )
    examples = cursor.fetchall()
    cursor.execute("select * from public.inflected_forms")
    inflections = cursor.fetchall()
    cursor.execute("select example_id,lexeme_id from public.example_lexemes")
    example_links = cursor.fetchall()
    cursor.execute("select id,title from public.sources")
    sources = cursor.fetchall()
    cursor.execute("select lexeme_id,source_id from public.lexeme_sources")
    source_links = cursor.fetchall()
    cursor.execute("select lexeme_id,related_lexeme_id from public.related_lexemes")
    relations = cursor.fetchall()
    return locals()


def build_plan(payload, existing):
    wanted = desired_lexemes(payload)
    by_headword = defaultdict(list)
    by_spelling = defaultdict(set)
    senses_by_entry = defaultdict(list)
    for item in existing["lexemes"]:
        by_headword[item["headword"].casefold()].append(item)
    for item in existing["spellings"]:
        by_spelling[item["spelling"].casefold()].add(item["lexeme_id"])
    for item in existing["senses"]:
        senses_by_entry[item["lexeme_id"]].append(item)
    resolved, conflicts, semantic_holds, new = {}, [], [], []
    for headword, item in wanted.items():
        exact = by_headword[headword.casefold()]
        near = item.get("near_existing")
        if len(exact) > 1:
            conflicts.append(f"{headword}: multiple existing headwords")
            continue
        if not exact and near:
            near_names = [name.strip().casefold() for name in near.split(",")]
            if any(by_headword[name] or by_spelling[name] for name in near_names):
                conflicts.append(
                    f"{headword}: possible existing spelling {near}; speaker review required"
                )
                continue
        if not exact and by_spelling[headword.casefold()]:
            conflicts.append(f"{headword}: matches an existing spelling variant")
            continue
        if not exact:
            new.append(item)
            continue
        current = exact[0]
        if (
            item.get("part_of_speech") and current["part_of_speech"]
            and item["part_of_speech"].casefold() != current["part_of_speech"].casefold()
        ):
            conflicts.append(
                f"{headword}: existing part of speech {current['part_of_speech']} "
                f"differs from supplied {item['part_of_speech']}"
            )
            continue
        meanings = [s["gloss_en"].casefold() for s in senses_by_entry[current["id"]]]
        if item["meaning"].casefold() not in meanings:
            semantic_holds.append(
                f"{headword}: supplied meaning {item['meaning']!r} differs from "
                f"existing {', '.join(meanings)!r}; homograph review required"
            )
            continue
        resolved[headword] = current["id"]
    return {
        "wanted": wanted, "resolved": resolved, "new": new,
        "semantic_holds": semantic_holds, "conflicts": conflicts,
    }


def ensure_draft(cursor, entry_id, statuses, changed):
    if entry_id in changed:
        return
    if statuses[entry_id] == "published":
        cursor.execute(
            "update public.lexemes set status='draft' where id=%s", (entry_id,)
        )
        changed.add(entry_id)


def next_order(cursor, table, owner_field, owner_id):
    cursor.execute(
        f"select coalesce(max(display_order),-1)+1 from public.{table} "
        f"where {owner_field}=%s",
        (owner_id,),
    )
    return scalar(cursor)


def execute_import(cursor, payload, existing, plan):
    counts = Counter()
    source_title = payload["source"]["title"]
    sources = [s for s in existing["sources"] if s["title"] == source_title]
    if len(sources) > 1:
        raise RuntimeError("Multiple source records share the supplied source title")
    if sources:
        source_id = sources[0]["id"]
    else:
        cursor.execute(
            "insert into public.sources(title,citation,notes) "
            "values (%s,%s,%s) returning id",
            (source_title, payload["source"]["citation"], payload["source"]["notes"]),
        )
        source_id = scalar(cursor)
        counts["new_sources"] += 1
    ids = dict(plan["resolved"])
    statuses = {x["id"]: x["status"] for x in existing["lexemes"]}
    existing_ids = set(statuses)
    changed = set()
    touched_existing = set()
    for item in plan["new"]:
        cursor.execute(
            "insert into public.lexemes(headword,part_of_speech,usage_note,status) "
            "values (%s,%s,%s,'draft') returning id",
            (item["headword"], item.get("part_of_speech"), item.get("note")),
        )
        entry_id = scalar(cursor)
        ids[item["headword"]] = entry_id
        statuses[entry_id] = "draft"
        counts["new_lexemes"] += 1
        cursor.execute(
            "insert into public.senses(lexeme_id,gloss_en,display_order) "
            "values (%s,%s,0)",
            (entry_id, item["meaning"]),
        )
        counts["new_senses"] += 1
    source_links = {(x["lexeme_id"], x["source_id"]) for x in existing["source_links"]}
    for headword, entry_id in ids.items():
        if (entry_id, source_id) in source_links:
            counts["skipped_source_links"] += 1
            continue
        ensure_draft(cursor, entry_id, statuses, changed)
        cursor.execute(
            "insert into public.lexeme_sources(lexeme_id,source_id) "
            "values (%s,%s) on conflict do nothing",
            (entry_id, source_id),
        )
        counts["new_source_links"] += cursor.rowcount
        if cursor.rowcount and entry_id in existing_ids:
            touched_existing.add(entry_id)
    existing_forms = {
        tuple(row[field] for field in FORM_FIELDS): row
        for row in existing["inflections"]
    }
    for item in forms(payload):
        entry_id = ids.get(item["lemma"])
        if not entry_id:
            counts["skipped_forms_unresolved_lemma"] += 1
            continue
        key = (entry_id,) + tuple(item[field] for field in FORM_FIELDS[1:])
        if key in existing_forms:
            old = existing_forms[key]
            expected = (
                item["original_transcription"], "attested", source_id, item["note"]
            )
            actual = (
                old["original_transcription"], old["evidence_status"],
                old["source_id"], old["note"]
            )
            counts["skipped_forms" if actual == expected else "conflicting_forms"] += 1
            continue
        ensure_draft(cursor, entry_id, statuses, changed)
        cursor.execute(
            "insert into public.inflected_forms("
            "lexeme_id,written_form,grammatical_person,grammatical_number,"
            "gender,tense,aspect,mood,politeness,original_transcription,"
            "evidence_status,source_id,note) "
            "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'attested',%s,%s) "
            "on conflict do nothing",
            (*key, item["original_transcription"], source_id, item["note"]),
        )
        counts["new_forms"] += cursor.rowcount
        if cursor.rowcount and entry_id in existing_ids:
            touched_existing.add(entry_id)
        existing_forms[key] = {
            "original_transcription": item["original_transcription"],
            "evidence_status": "attested", "source_id": source_id,
            "note": item["note"],
        }
    existing_examples = defaultdict(list)
    for item in existing["examples"]:
        existing_examples[item["kutchi_text"].casefold()].append(item)
    links = {(x["example_id"], x["lexeme_id"]) for x in existing["example_links"]}
    verb_heads = {item["lemma"] for item in payload["verbs"]} | {"khaa"}
    for item in payload["examples"]:
        linked = [ids[h] for h in item["lemmas"] if h in ids]
        unresolved = [h for h in item["lemmas"] if h not in ids]
        if unresolved:
            counts["examples_with_unresolved_links"] += 1
        if not linked:
            counts["skipped_examples_without_lemma"] += 1
            continue
        matches = existing_examples[item["kutchi"].casefold()]
        if len(matches) > 1 or (
            matches and (matches[0]["english_translation"] or "").casefold()
            != item["english"].casefold()
        ) or (
            matches and matches[0]["source_id"] != source_id
        ):
            counts["conflicting_examples"] += 1
            continue
        if matches:
            example_id = matches[0]["id"]
            primary_id = matches[0]["lexeme_id"]
            counts["skipped_examples"] += 1
        else:
            primary_name = next(
                (h for h in item["lemmas"] if h in verb_heads and h in ids),
                next(h for h in item["lemmas"] if h in ids),
            )
            primary_id = ids[primary_name]
            ensure_draft(cursor, primary_id, statuses, changed)
            cursor.execute(
                "select id from public.senses where lexeme_id=%s "
                "order by display_order,id limit 1",
                (primary_id,),
            )
            sense_id = scalar(cursor)
            cursor.execute(
                "insert into public.examples("
                "sense_id,kutchi_text,english_translation,source_id,note,display_order) "
                "values (%s,%s,%s,%s,%s,%s) returning id",
                (
                    sense_id, item["kutchi"], item["english"], source_id, item.get("note"),
                    next_order(cursor, "examples", "sense_id", sense_id),
                ),
            )
            example_id = scalar(cursor)
            counts["new_examples"] += 1
            if primary_id in existing_ids:
                touched_existing.add(primary_id)
        for entry_id in linked:
            if entry_id == primary_id or (example_id, entry_id) in links:
                continue
            ensure_draft(cursor, entry_id, statuses, changed)
            ensure_draft(cursor, primary_id, statuses, changed)
            cursor.execute(
                "insert into public.example_lexemes(example_id,lexeme_id) "
                "values (%s,%s) on conflict do nothing",
                (example_id, entry_id),
            )
            counts["new_example_links"] += cursor.rowcount
            links.add((example_id, entry_id))
            if cursor.rowcount:
                if entry_id in existing_ids:
                    touched_existing.add(entry_id)
                if primary_id in existing_ids:
                    touched_existing.add(primary_id)
    relations = {
        (x["lexeme_id"], x["related_lexeme_id"]) for x in existing["relations"]
    }
    copula = [x["form"] for x in payload["copula_forms"] if x["form"] in ids]
    for i, left in enumerate(copula):
        for right in copula[i + 1:]:
            pair = (ids[left], ids[right])
            if pair in relations:
                continue
            ensure_draft(cursor, pair[0], statuses, changed)
            ensure_draft(cursor, pair[1], statuses, changed)
            cursor.execute(
                "insert into public.related_lexemes("
                "lexeme_id,related_lexeme_id,note) values (%s,%s,%s)",
                (*pair, "Possible shared copula analysis; unconfirmed."),
            )
            counts["new_provisional_links"] += 1
            for entry_id in pair:
                if entry_id in existing_ids:
                    touched_existing.add(entry_id)
    for entry_id in changed:
        cursor.execute(
            "update public.lexemes set status='published' where id=%s", (entry_id,)
        )
    for item in plan["new"]:
        if item["headword"] in HELD_DRAFT_HEADWORDS:
            continue
        cursor.execute(
            "update public.lexemes set status='published' where id=%s",
            (ids[item["headword"]],),
        )
    counts["updated_lexemes"] = len(touched_existing)
    return counts


def rehearse(cursor, payload, existing, plan):
    """Exercise the full transaction twice, verify the result, then roll back."""
    before_status = {row["id"]: row["status"] for row in existing["lexemes"]}
    first = execute_import(cursor, payload, existing, plan)
    cursor.execute("select id,status from public.lexemes")
    after_status = {row["id"]: row["status"] for row in cursor.fetchall()}
    if any(after_status[entry_id] != status for entry_id, status in before_status.items()):
        raise RuntimeError("Rehearsal changed an existing publication status")
    cursor.execute(
        "select headword,status from public.lexemes "
        "where id <> all(%s::uuid[])",
        (list(before_status),),
    )
    for row in cursor.fetchall():
        expected = "draft" if row["headword"] in HELD_DRAFT_HEADWORDS else "published"
        if row["status"] != expected:
            raise RuntimeError(f"Wrong publication state for {row['headword']}")
    cursor.execute(
        "select l.id from public.search_dictionary(%s,24,0) result "
        "join public.lexemes l on l.id=result.lexeme_id where l.headword=%s",
        ("kardhose", "kar"),
    )
    if cursor.fetchone() is None:
        raise RuntimeError("Inflected-form search did not resolve kardhose to kar")
    for held in HELD_DRAFT_HEADWORDS:
        cursor.execute(
            "select l.id from public.search_dictionary(%s,24,0) result "
            "join public.lexemes l on l.id=result.lexeme_id where l.headword=%s",
            (held, held),
        )
        if cursor.fetchone() is not None:
            raise RuntimeError(f"Draft entry {held} was exposed through public search")
    again_existing = read_existing(cursor)
    again_plan = build_plan(payload, again_existing)
    if again_plan["new"]:
        raise RuntimeError("Second import still plans lexemes or senses")
    second = execute_import(cursor, payload, again_existing, again_plan)
    changed_again = {
        key: value for key, value in second.items()
        if (key.startswith("new_") or key == "updated_lexemes") and value
    }
    if changed_again:
        raise RuntimeError(f"Second import was not idempotent: {changed_again}")
    if first["conflicting_examples"] or second["conflicting_examples"]:
        raise RuntimeError("Example text conflicts require manual review")
    if first["conflicting_forms"] or second["conflicting_forms"]:
        raise RuntimeError("Inflection evidence conflicts require manual review")
    return {
        "first_run": dict(first), "second_run": dict(second),
        "status_restored": True, "inflected_search_verified": True,
        "held_drafts_hidden_from_search": True,
        "rolled_back": True,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-only", action="store_true")
    parser.add_argument("--rehearse", action="store_true")
    parser.add_argument("--backup-dir", type=Path)
    args = parser.parse_args()
    if sum((args.apply, args.backup_only, args.rehearse)) > 1:
        parser.error("--apply, --backup-only, and --rehearse are mutually exclusive")
    if (args.apply or args.backup_only) and not args.backup_dir:
        parser.error("--backup-dir is required with --apply or --backup-only")
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
                "has_table_privilege(current_user,'public.lexemes','INSERT,UPDATE') "
                "as can_edit"
            )
            target = cursor.fetchone()
            if args.backup_only:
                backup_dir.mkdir(parents=True, exist_ok=True)
                backup_path = backup_dir / (
                    f"madhaaf-dictionary-before-elicitation-"
                    f"{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
                )
                if backup_path.exists():
                    raise RuntimeError("Backup file already exists")
                backup_path.write_text(
                    json.dumps(snapshot(cursor), ensure_ascii=False, default=str, indent=2),
                    encoding="utf-8",
                )
                print(json.dumps({
                    "mode": "backup-only", "database": target["database"],
                    "database_role": target["role"], "backup": str(backup_path),
                }))
                connection.rollback()
                return
            if not target["forms_table"] or not target["links_table"]:
                raise RuntimeError("Linguistic-data migration has not been applied")
            if not target["can_edit"]:
                raise RuntimeError("Database role lacks dictionary write privileges")
            existing = read_existing(cursor)
            plan = build_plan(payload, existing)
            expected_holds = {
                f"{item['headword']}: possible existing spelling "
                f"{item['near_existing']}; speaker review required"
                for item in payload["vocabulary"] if item.get("near_existing")
            }
            unexpected_conflicts = [
                conflict for conflict in plan["conflicts"]
                if conflict not in expected_holds
            ]
            digest = hashlib.sha256(DATA.read_bytes()).hexdigest()
            summary = {
                "mode": "apply" if args.apply else "rehearse" if args.rehearse else "dry-run",
                "database": target["database"], "database_role": target["role"],
                "evidence_sha256": digest, "existing_lexemes": len(existing["lexemes"]),
                "planned_new_lexemes": len(plan["new"]),
                "planned_new_senses": len(plan["new"]),
                "attested_forms": len(forms(payload)),
                "supplied_examples": len(payload["examples"]),
                "new_entries_held_as_drafts": sorted(HELD_DRAFT_HEADWORDS),
                "conflicts": plan["conflicts"],
                "held_semantic_conflicts": plan["semantic_holds"],
            }
            print(json.dumps(summary, ensure_ascii=False, default=str, indent=2))
            if args.apply and unexpected_conflicts:
                raise RuntimeError(
                    "Unexpected dictionary conflicts prevent apply: "
                    + "; ".join(unexpected_conflicts)
                )
            if args.rehearse:
                try:
                    result = rehearse(cursor, payload, existing, plan)
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                finally:
                    connection.rollback()
                return
            if not args.apply:
                connection.rollback()
                return
            backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = backup_dir / (
                f"madhaaf-dictionary-before-elicitation-"
                f"{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
            )
            if backup_path.exists():
                raise RuntimeError("Backup file already exists")
            backup_path.write_text(
                json.dumps(snapshot(cursor), ensure_ascii=False, default=str, indent=2),
                encoding="utf-8",
            )
            counts = execute_import(cursor, payload, existing, plan)
            if counts["conflicting_forms"] or counts["conflicting_examples"]:
                raise RuntimeError("Existing inflection or example evidence conflicts")
            print(json.dumps(
                {"backup": str(backup_path), "created_updated_skipped": dict(counts)},
                ensure_ascii=False, indent=2,
            ))
        connection.commit()


if __name__ == "__main__":
    main()
