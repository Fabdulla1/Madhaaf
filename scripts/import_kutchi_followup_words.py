"""Add the owner's twelve follow-up words without changing existing entries.

Dry run by default. --rehearse writes twice in a rolled-back transaction.
--apply requires a dictionary backup directory outside the repository.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from import_kutchi_linguistic_evidence import connection_url, snapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kutchi-followup-words-20261021.json"
EXPECTED = {
    "chiknuh": "sticky", "chikaas": "stickiness", "gaato": "thick (liquid)",
    "mare'lo": "dead", "madhath": "help", "mudh": "honey",
    "ful": "flower", "panaa": "pages", "ronak": "liveliness",
    "uno": "deep (water)", "byaa": "others", "byo": "another, what else",
}


def evidence():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    entries = payload["entries"]
    if len(entries) != 12 or {item["headword"]: item["gloss_en"] for item in entries} != EXPECTED:
        raise RuntimeError("Owner-supplied words or glosses changed")
    if not payload["source"]["title"] or not payload["source"]["citation"]:
        raise RuntimeError("Source provenance is incomplete")
    return payload


def read_state(cursor):
    cursor.execute("select id,headword,part_of_speech,status from public.lexemes")
    lexemes = cursor.fetchall()
    cursor.execute("select lexeme_id,gloss_en from public.senses")
    senses = cursor.fetchall()
    cursor.execute("select lexeme_id,spelling from public.word_forms")
    spellings = cursor.fetchall()
    cursor.execute("select lexeme_id,written_form from public.inflected_forms")
    forms = cursor.fetchall()
    cursor.execute("select id,title,citation,notes from public.sources")
    sources = cursor.fetchall()
    return locals()


def plan_import(payload, state):
    by_name = {}
    for item in state["lexemes"]:
        by_name.setdefault(item["headword"].casefold(), []).append(item)
    meanings = {}
    for item in state["senses"]:
        meanings.setdefault(item["lexeme_id"], set()).add(item["gloss_en"].casefold())
    other_spellings = {item["spelling"].casefold() for item in state["spellings"]}
    other_forms = {item["written_form"].casefold() for item in state["forms"]}
    planned, conflicts = [], []
    for entry in payload["entries"]:
        name = entry["headword"].casefold()
        existing = by_name.get(name, [])
        if not existing:
            if name in other_spellings or name in other_forms:
                conflicts.append(f"{entry['headword']}: already recorded as a spelling or form")
            else:
                planned.append(entry)
        elif len(existing) != 1:
            conflicts.append(f"{entry['headword']}: multiple existing homographs")
        elif entry["gloss_en"].casefold() not in meanings.get(existing[0]["id"], set()):
            conflicts.append(f"{entry['headword']}: existing meaning differs")
        elif existing[0]["part_of_speech"] != entry["part_of_speech"]:
            conflicts.append(f"{entry['headword']}: existing part of speech differs")
        elif existing[0]["status"] != "published":
            conflicts.append(f"{entry['headword']}: existing entry is not published")
    return planned, conflicts


def apply_import(cursor, payload, state, planned):
    if not planned:
        return {"new_lexemes": 0, "new_senses": 0, "new_source_links": 0}
    source = payload["source"]
    matches = [item for item in state["sources"] if item["title"] == source["title"]]
    if len(matches) > 1:
        raise RuntimeError("Multiple sources share the follow-up title")
    if matches:
        if (matches[0]["citation"], matches[0]["notes"]) != (source["citation"], source["notes"]):
            raise RuntimeError("Existing source provenance differs")
        source_id = matches[0]["id"]
        new_sources = 0
    else:
        cursor.execute("insert into public.sources(title,citation,notes) values (%s,%s,%s) returning id",
                       (source["title"], source["citation"], source["notes"]))
        source_id = cursor.fetchone()["id"]
        new_sources = 1
    for item in planned:
        cursor.execute(
            "insert into public.lexemes(headword,part_of_speech,usage_note,linguistic_tags,status) "
            "values (%s,%s,%s,%s,'draft') returning id",
            (item["headword"], item["part_of_speech"], item.get("usage_note"),
             ["Provisional analysis"]),
        )
        entry_id = cursor.fetchone()["id"]
        cursor.execute("insert into public.senses(lexeme_id,gloss_en) values (%s,%s)",
                       (entry_id, item["gloss_en"]))
        cursor.execute("insert into public.lexeme_sources(lexeme_id,source_id,note) values (%s,%s,%s)",
                       (entry_id, source_id, "Owner-supplied follow-up word and English gloss."))
        cursor.execute("update public.lexemes set status='published' where id=%s", (entry_id,))
    return {"new_sources": new_sources, "new_lexemes": len(planned),
            "new_senses": len(planned), "new_source_links": len(planned)}


def verify(cursor, payload, before):
    cursor.execute("select id,status from public.lexemes")
    after = {item["id"]: item["status"] for item in cursor.fetchall()}
    if any(after[key] != status for key, status in before.items()):
        raise RuntimeError("An existing publication status changed")
    for item in payload["entries"]:
        cursor.execute("select l.id from public.lexemes l join public.senses s on s.lexeme_id=l.id "
                       "where l.headword=%s and l.status='published' and s.gloss_en=%s",
                       (item["headword"], item["gloss_en"]))
        if len(cursor.fetchall()) != 1:
            raise RuntimeError(f"{item['headword']}: public entry not found exactly once")


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
            cursor.execute("select pg_advisory_xact_lock(20261021, 12)")
            cursor.execute("select current_database() as db,current_user as role,"
                           "to_regclass('public.inflected_forms') as forms,"
                           "has_table_privilege(current_user,'public.lexemes','INSERT,UPDATE') as can_edit")
            target = cursor.fetchone()
            if not target["forms"] or not target["can_edit"]:
                raise RuntimeError("Dictionary migrations or edit privilege missing")
            state = read_state(cursor)
            planned, conflicts = plan_import(payload, state)
            print(json.dumps({"mode": "apply" if args.apply else "rehearse" if args.rehearse else "dry-run",
                              "database": target["db"], "role": target["role"],
                              "existing_lexemes": len(state["lexemes"]),
                              "planned_new_lexemes": len(planned), "conflicts": conflicts}, indent=2))
            if conflicts and (args.apply or args.rehearse):
                raise RuntimeError("Dictionary conflicts require review")
            if not args.apply and not args.rehearse:
                connection.rollback()
                return
            before = {item["id"]: item["status"] for item in state["lexemes"]}
            if args.rehearse:
                try:
                    first = apply_import(cursor, payload, state, planned)
                    verify(cursor, payload, before)
                    second_state = read_state(cursor)
                    second_planned, second_conflicts = plan_import(payload, second_state)
                    if second_planned or second_conflicts:
                        raise RuntimeError("Second pass is not idempotent")
                    second = apply_import(cursor, payload, second_state, second_planned)
                    print(json.dumps({"first": first, "second": second,
                                      "statuses_preserved": True, "rolled_back": True}, indent=2))
                finally:
                    connection.rollback()
                return
            if not planned:
                connection.rollback()
                print("No changes needed")
                return
            backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = backup_dir / f"madhaaf-dictionary-before-followup-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
            if backup_path.exists():
                raise RuntimeError("Backup file already exists")
            backup_path.write_text(json.dumps(snapshot(cursor), ensure_ascii=False,
                                              default=str, indent=2), encoding="utf-8")
            counts = apply_import(cursor, payload, state, planned)
            verify(cursor, payload, before)
            print(json.dumps({"backup": str(backup_path), "counts": counts}, indent=2))
        connection.commit()


if __name__ == "__main__":
    main()
