"""Reconcile the owner's appended word list with the live dictionary.

Dry run by default. --rehearse applies the plan twice and rolls back.
--apply requires a backup directory outside the repository. No meanings on
existing entries are replaced, and uncertain near spellings stay distinct.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from import_kutchi_linguistic_evidence import connection_url, snapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kutchi-word-list-additions-20261021.json"
EXPECTED_SOURCE_SHA256 = "7facce931b8be6d384b6b62b53805e1c86fcebfa9e4fa325a57f3d1a345b6aee"
EXPECTED_ACTIONS = {
    "new_entry": 69,
    "homograph": 1,
    "spelling_variant": 3,
    "recorded_form": 4,
    "add_sense": 1,
    "existing": 9,
}


def evidence():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    if payload["source"]["sha256"] != EXPECTED_SOURCE_SHA256:
        raise RuntimeError("Owner attachment provenance changed")
    rows = payload["rows"]
    if len(rows) != 87 or [row["source_row"] for row in rows] != list(range(368, 455)):
        raise RuntimeError("The appended source rows are incomplete")
    if Counter(row["action"] for row in rows) != EXPECTED_ACTIONS:
        raise RuntimeError("The reviewed action counts changed")
    if len({row["word"].casefold() for row in rows}) != len(rows):
        raise RuntimeError("Duplicate appended word")
    if any(not row["word"].strip() or not row["english_definition"].strip() for row in rows):
        raise RuntimeError("Blank word or English gloss")
    return payload


def read_state(cursor):
    cursor.execute("select id,headword,part_of_speech,status from public.lexemes")
    lexemes = cursor.fetchall()
    cursor.execute("select lexeme_id,gloss_en,display_order from public.senses")
    senses = cursor.fetchall()
    cursor.execute("select lexeme_id,spelling from public.word_forms")
    spellings = cursor.fetchall()
    cursor.execute("select lexeme_id,written_form,gender from public.inflected_forms")
    forms = cursor.fetchall()
    cursor.execute("select id,title,citation,notes from public.sources")
    sources = cursor.fetchall()
    cursor.execute("select lexeme_id,source_id from public.lexeme_sources")
    source_links = cursor.fetchall()
    return locals()


def plan_import(payload, state):
    heads = defaultdict(list)
    spellings = defaultdict(set)
    forms = defaultdict(list)
    meanings = defaultdict(set)
    for lexeme in state["lexemes"]:
        heads[lexeme["headword"].casefold()].append(lexeme)
    for spelling in state["spellings"]:
        spellings[spelling["spelling"].casefold()].add(spelling["lexeme_id"])
    for form in state["forms"]:
        forms[form["written_form"].casefold()].append(form)
    for sense in state["senses"]:
        meanings[sense["lexeme_id"]].add(sense["gloss_en"].casefold())

    proposed = {row["word"].casefold() for row in payload["rows"]
                if row["action"] in ("new_entry", "homograph")}
    operations, conflicts = [], []
    for row in payload["rows"]:
        name = row["word"].casefold()
        action = row["action"]
        exact = heads[name]
        if action == "existing":
            if len(exact) != 1:
                conflicts.append(f"{row['word']}: expected one preexisting entry")
            continue
        if action == "new_entry":
            if not exact:
                if spellings[name] or forms[name]:
                    conflicts.append(f"{row['word']}: existing spelling or recorded form")
                else:
                    operations.append(row)
            elif len(exact) != 1 or row["english_definition"].casefold() not in meanings[exact[0]["id"]]:
                conflicts.append(f"{row['word']}: existing meaning differs")
            elif row["part_of_speech"] and exact[0]["part_of_speech"] != row["part_of_speech"]:
                conflicts.append(f"{row['word']}: existing part of speech differs")
        elif action == "homograph":
            if not any(row["existing_gloss"].casefold() in meanings[item["id"]] for item in exact):
                conflicts.append(f"{row['word']}: original homograph was not found")
            candidates = [item for item in exact if row["english_definition"].casefold() in meanings[item["id"]]]
            if len(candidates) > 1:
                conflicts.append(f"{row['word']}: duplicate new homographs")
            elif not candidates:
                operations.append(row)
            elif candidates[0]["part_of_speech"] != row["part_of_speech"]:
                conflicts.append(f"{row['word']}: new homograph part of speech differs")
        elif action == "add_sense":
            if len(heads[row["lemma"].casefold()]) != 1:
                conflicts.append(f"{row['lemma']}: sense owner is ambiguous")
            else:
                lemma = heads[row["lemma"].casefold()][0]
                if row["existing_gloss"].casefold() not in meanings[lemma["id"]]:
                    conflicts.append(f"{row['lemma']}: original meaning changed")
                elif row["gloss"].casefold() not in meanings[lemma["id"]]:
                    operations.append(row)
        elif action in ("spelling_variant", "recorded_form"):
            lemma_name = row["lemma"].casefold()
            if lemma_name not in proposed and len(heads[lemma_name]) != 1:
                conflicts.append(f"{row['lemma']}: form owner is ambiguous")
                continue
            if action == "spelling_variant":
                lemma = heads[lemma_name][0]
                if row["existing_gloss"].casefold() not in meanings[lemma["id"]]:
                    conflicts.append(f"{row['lemma']}: variant meaning differs")
                elif exact or (spellings[name] and spellings[name] != {lemma["id"]}) or forms[name]:
                    conflicts.append(f"{row['word']}: spelling belongs to another entry or form")
                elif not spellings[name]:
                    operations.append(row)
            else:
                if exact or spellings[name]:
                    conflicts.append(f"{row['word']}: recorded form is an independent entry or spelling")
                    continue
                lemma_ids = {item["id"] for item in heads[lemma_name]}
                matching = [form for form in forms[name]
                            if form["lexeme_id"] in lemma_ids and form["gender"] == row["gender"]]
                if forms[name] and not matching:
                    conflicts.append(f"{row['word']}: form owner or gender differs")
                elif not matching:
                    operations.append(row)
        else:
            conflicts.append(f"{row['word']}: unsupported action {action}")
    return operations, conflicts


def apply_import(cursor, payload, state, operations):
    counts = Counter()
    if not operations:
        return counts
    source = payload["source"]
    title = source["title"]
    matches = [item for item in state["sources"] if item["title"] == title]
    if len(matches) > 1:
        raise RuntimeError("Multiple sources share the additions title")
    notes = f"Appended TSV rows 368–454; full attachment SHA-256 {source['sha256']}."
    if matches:
        if matches[0]["citation"] != source["citation"] or matches[0]["notes"] != notes:
            raise RuntimeError("Existing source provenance differs")
        source_id = matches[0]["id"]
    else:
        cursor.execute("insert into public.sources(title,citation,notes) values (%s,%s,%s) returning id",
                       (title, source["citation"], notes))
        source_id = cursor.fetchone()["id"]
        counts["new_sources"] += 1

    by_name = defaultdict(list)
    statuses = {}
    for item in state["lexemes"]:
        by_name[item["headword"].casefold()].append(item["id"])
        statuses[item["id"]] = item["status"]
    links = {(item["lexeme_id"], item["source_id"]) for item in state["source_links"]}
    changed = set()

    def draft(entry_id):
        if entry_id in changed or statuses[entry_id] != "published":
            return
        cursor.execute("update public.lexemes set status='draft' where id=%s", (entry_id,))
        changed.add(entry_id)

    def link(entry_id, row):
        if (entry_id, source_id) in links:
            return
        draft(entry_id)
        cursor.execute("insert into public.lexeme_sources(lexeme_id,source_id,note) values (%s,%s,%s)",
                       (entry_id, source_id, f"Owner list row {row['source_row']}; English gloss supplied by owner."))
        links.add((entry_id, source_id))
        counts["new_source_links"] += 1

    for row in operations:
        if row["action"] not in ("new_entry", "homograph"):
            continue
        cursor.execute(
            "insert into public.lexemes(headword,part_of_speech,linguistic_tags,usage_note,status) "
            "values (%s,%s,%s,%s,'draft') returning id",
            (row["word"], row["part_of_speech"], ["Provisional analysis"], row.get("note")),
        )
        entry_id = cursor.fetchone()["id"]
        by_name[row["word"].casefold()].append(entry_id)
        statuses[entry_id] = "draft"
        cursor.execute("insert into public.senses(lexeme_id,gloss_en) values (%s,%s)",
                       (entry_id, row["english_definition"]))
        link(entry_id, row)
        counts["new_lexemes"] += 1
        counts["new_senses"] += 1

    for row in operations:
        action = row["action"]
        if action in ("new_entry", "homograph"):
            continue
        lemma_ids = by_name[row["lemma"].casefold()]
        if len(lemma_ids) != 1:
            raise RuntimeError(f"{row['lemma']}: unresolved form or sense owner")
        entry_id = lemma_ids[0]
        draft(entry_id)
        if action == "add_sense":
            cursor.execute("select coalesce(max(display_order),-1)+1 as next from public.senses where lexeme_id=%s",
                           (entry_id,))
            order = cursor.fetchone()["next"]
            cursor.execute("insert into public.senses(lexeme_id,gloss_en,display_order) values (%s,%s,%s)",
                           (entry_id, row["gloss"], order))
            counts["new_senses"] += 1
        elif action == "spelling_variant":
            cursor.execute("insert into public.word_forms(lexeme_id,spelling,is_preferred,note) "
                           "values (%s,%s,false,%s)",
                           (entry_id, row["word"], "Owner-supplied spelling; lexical identity inferred from matching gloss."))
            counts["new_spellings"] += 1
        elif action == "recorded_form":
            note = f"Owner gloss: {row['english_definition']}."
            if row.get("note"):
                note += f" {row['note']}"
            cursor.execute("insert into public.inflected_forms(lexeme_id,written_form,gender,source_id,note) "
                           "values (%s,%s,%s,%s,%s)",
                           (entry_id, row["word"], row["gender"], source_id, note))
            counts["new_forms"] += 1
        link(entry_id, row)

    for entry_id in changed:
        cursor.execute("update public.lexemes set status='published' where id=%s", (entry_id,))
    for row in operations:
        if row["action"] in ("new_entry", "homograph"):
            cursor.execute("update public.lexemes set status='published' where id=%s",
                           (by_name[row["word"].casefold()][-1],))
    counts["updated_existing_lexemes"] = sum(entry_id in changed for entry_id in
                                               (item["id"] for item in state["lexemes"]))
    return counts


def verify(cursor, before_statuses, payload):
    cursor.execute("select id,status from public.lexemes")
    after = {item["id"]: item["status"] for item in cursor.fetchall()}
    if any(after[key] != status for key, status in before_statuses.items()):
        raise RuntimeError("An existing publication status changed")
    for row in payload["rows"]:
        if row["action"] not in ("new_entry", "homograph"):
            continue
        cursor.execute("select l.id from public.lexemes l join public.senses s on s.lexeme_id=l.id "
                       "where l.headword=%s and l.status='published' and s.gloss_en=%s",
                       (row["word"], row["english_definition"]))
        if len(cursor.fetchall()) != 1:
            raise RuntimeError(f"{row['word']}: imported meaning is not published exactly once")
    for word, expected in (("chaklee", "chakli"), ("sa(n)gan", "sangan"),
                           ("sonoo", "sono"), ("jorathi", "joratho"),
                           ("ruparee", "ruparo"), ("ugaree", "ugaro"),
                           ("ugaraa", "ugaro")):
        cursor.execute("select l.headword from public.search_dictionary(%s,24,0) result "
                       "join public.lexemes l on l.id=result.lexeme_id where l.headword=%s",
                       (word, expected))
        if cursor.fetchone() is None:
            raise RuntimeError(f"{word} did not resolve to {expected}")
    cursor.execute("select s.gloss_en from public.lexemes l join public.senses s on s.lexeme_id=l.id "
                   "where l.headword='no' and l.status='published'")
    glosses = {item["gloss_en"] for item in cursor.fetchall()}
    if not {"nine", "nail"} <= glosses:
        raise RuntimeError("The no homographs are not both public")
    cursor.execute("select count(*) as count from public.senses s join public.lexemes l "
                   "on l.id=s.lexeme_id where l.headword='poi' and s.gloss_en='next' "
                   "and l.status='published'")
    if cursor.fetchone()["count"] != 1:
        raise RuntimeError("The added poi sense is not public")


def main():
    import psycopg
    from psycopg.rows import dict_row

    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--rehearse", action="store_true")
    mode.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-dir", type=Path)
    args = parser.parse_args()
    if args.apply and args.backup_dir is None:
        parser.error("--apply requires --backup-dir")
    if args.backup_dir:
        backup_dir = args.backup_dir.resolve()
        if backup_dir == ROOT or ROOT in backup_dir.parents:
            parser.error("Backup directory must be outside the repository")
    payload = evidence()
    with psycopg.connect(connection_url(), row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("set transaction isolation level serializable")
            cursor.execute("select pg_advisory_xact_lock(20261021, 87)")
            cursor.execute("select current_database() as db,current_user as role,"
                           "to_regclass('public.inflected_forms') as forms,"
                           "has_table_privilege(current_user,'public.lexemes','INSERT,UPDATE') as can_edit")
            target = cursor.fetchone()
            if not target["forms"] or not target["can_edit"]:
                raise RuntimeError("Dictionary migrations or edit privilege are missing")
            state = read_state(cursor)
            operations, conflicts = plan_import(payload, state)
            summary = {"mode": "apply" if args.apply else "rehearse" if args.rehearse else "dry-run",
                       "database": target["db"], "role": target["role"],
                       "source_sha256": payload["source"]["sha256"],
                       "existing_lexemes": len(state["lexemes"]),
                       "actions": dict(Counter(row["action"] for row in operations)),
                       "conflicts": conflicts}
            print(json.dumps(summary, indent=2))
            if conflicts and (args.rehearse or args.apply):
                raise RuntimeError("Dictionary conflicts require review")
            if not args.rehearse and not args.apply:
                connection.rollback()
                return
            before = {item["id"]: item["status"] for item in state["lexemes"]}
            if args.rehearse:
                try:
                    first = apply_import(cursor, payload, state, operations)
                    verify(cursor, before, payload)
                    second_state = read_state(cursor)
                    second_operations, second_conflicts = plan_import(payload, second_state)
                    if second_operations or second_conflicts:
                        raise RuntimeError("Second pass is not idempotent")
                    second = apply_import(cursor, payload, second_state, second_operations)
                    print(json.dumps({"first": dict(first), "second": dict(second),
                                      "statuses_preserved": True, "rolled_back": True}, indent=2))
                finally:
                    connection.rollback()
                return
            if not operations:
                connection.rollback()
                print("No changes needed")
                return
            backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = backup_dir / f"madhaaf-dictionary-before-list-additions-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
            if backup_path.exists():
                raise RuntimeError("Backup file already exists")
            backup_path.write_text(json.dumps(snapshot(cursor), ensure_ascii=False,
                                              default=str, indent=2), encoding="utf-8")
            counts = apply_import(cursor, payload, state, operations)
            verify(cursor, before, payload)
            print(json.dumps({"backup": str(backup_path), "counts": dict(counts)}, indent=2))
        connection.commit()


if __name__ == "__main__":
    main()
