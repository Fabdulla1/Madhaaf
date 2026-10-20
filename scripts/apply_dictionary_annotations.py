"""Reconcile the owner-supplied glossary and provisional annotations with Supabase.

Dry run by default. Requires psycopg 3 (pip install psycopg[binary]). Run from
the repository root with --apply --backup-dir PATH to change the live database.
The backup is written before the transaction is committed.
"""

import argparse
import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "dictionary-annotations-20261020.csv"
ORIGINAL_SOURCE_TITLE = "Owner-supplied Kutchi word list"
ADDITIONS_SOURCE_TITLE = "Owner-supplied Kutchi word list — additions"
ADDITIONS_SHA256 = "b6478b8a43bc5d3e0004647632b11d4fa5243361a3072b3c5d2466f6ab33298d"


def connection_url():
    path = ROOT / ".env.local"
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            values[key] = value.strip().strip('"').strip("'")
    return values["madhaaf_db_POSTGRES_URL_NON_POOLING"]


def annotations():
    with CSV_PATH.open(encoding="utf-8", newline="") as source:
        entries = list(csv.DictReader(source))
    assert len(entries) == 375, "Expected 374 source entries and one existing seed"
    assert sum(row["source_rows"].isdigit() and int(row["source_rows"]) >= 347 for row in entries) == 21
    for row in entries:
        row["meanings"] = row["english_meanings"].split(" | ")
        row["tags"] = row["linguistic_tags"].split(" | ")
        assert row["headword"] and row["meanings"] and row["tags"]
        assert len(row["tags"]) == len(set(row["tags"])) <= 20
    return entries


def snapshot(cursor):
    tables = ("lexemes", "word_forms", "senses", "examples", "lexeme_sources", "sources")
    result = {}
    for table in tables:
        cursor.execute(f"select * from public.{table}")
        result[table] = cursor.fetchall()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-dir", type=Path)
    args = parser.parse_args()
    if args.apply and not args.backup_dir:
        parser.error("--backup-dir is required with --apply")

    rows = annotations()
    with psycopg.connect(connection_url(), row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("set transaction isolation level serializable")
            cursor.execute("select pg_advisory_xact_lock(20261020, 367)")
            cursor.execute("select id, headword, part_of_speech, linguistic_tags, usage_note, status from public.lexemes")
            existing = cursor.fetchall()
            assert len(existing) in (354, 375), f"Unexpected live lexeme count: {len(existing)}"
            by_headword = {}
            for entry in existing:
                by_headword.setdefault(entry["headword"].casefold(), []).append(entry)
            cursor.execute("select lexeme_id, gloss_en from public.senses order by display_order")
            senses = {}
            for sense in cursor.fetchall():
                senses.setdefault(sense["lexeme_id"], []).append(sense["gloss_en"].casefold())
            cursor.execute("select id, title from public.sources where title in (%s, %s)",
                           (ORIGINAL_SOURCE_TITLE, ADDITIONS_SOURCE_TITLE))
            sources = {record["title"]: record["id"] for record in cursor.fetchall()}
            assert ORIGINAL_SOURCE_TITLE in sources

            plan = []
            matched_ids = set()
            for row in rows:
                candidates = by_headword.get(row["headword"].casefold(), [])
                if row["headword"] == "pun":
                    candidates = [item for item in candidates if row["meanings"][0].casefold() in senses.get(item["id"], [])]
                assert len(candidates) <= 1, f"Ambiguous existing entry: {row['headword']}"
                current = candidates[0] if candidates else None
                if current:
                    assert current["id"] not in matched_ids
                    matched_ids.add(current["id"])
                    if current["headword"] != "kee(n)":
                        assert all(meaning.casefold() in senses.get(current["id"], []) for meaning in row["meanings"]), (
                            f"Meaning changed for {row['headword']}: {row['meanings']}"
                        )
                        assert not current["part_of_speech"] or current["part_of_speech"] == row["part_of_speech"], (
                            f"Editorial POS conflict for {row['headword']}"
                        )
                    else:
                        if senses.get(current["id"]):
                            assert current["status"] == "published" and current["part_of_speech"] == "adverb"
                            assert senses[current["id"]] == ["how"]
                        else:
                            assert current["status"] == "draft" and current["part_of_speech"] == "noun"
                else:
                    assert row["source_rows"].isdigit() and int(row["source_rows"]) >= 347, (
                        f"Missing preexisting entry: {row['headword']}"
                    )
                plan.append((row, current))
            assert len(matched_ids) == len(existing), "Live database has unexpected entries"
            new = [(row, current) for row, current in plan if current is None]
            assert len(new) in (0, 21), "Partial import requires manual reconciliation"
            assert all(item["status"] in ("draft", "published") for item in existing)
            print(json.dumps({"mode": "apply" if args.apply else "dry-run", "existing": len(existing),
                              "new": len(new), "published_before": Counter(item["status"] for item in existing)["published"],
                              "annotated": len(rows), "word_classes": dict(Counter(row["part_of_speech"] or "review" for row in rows))}))
            if not args.apply:
                connection.rollback()
                return

            backup_dir = args.backup_dir.resolve()
            backup_dir.mkdir(parents=True, exist_ok=True)
            assert backup_dir != ROOT and ROOT not in backup_dir.parents, "Backup must be outside the repository"
            backup_path = backup_dir / f"dictionary-before-annotations-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
            assert not backup_path.exists()
            backup_path.write_text(json.dumps(snapshot(cursor), ensure_ascii=False, default=str, indent=2), encoding="utf-8")
            print(f"Backup written: {backup_path}")

            if new and ADDITIONS_SOURCE_TITLE not in sources:
                cursor.execute("insert into public.sources(title, citation, notes) values (%s, %s, %s) returning id",
                               (ADDITIONS_SOURCE_TITLE, "Project owner, additional Kutchi vocabulary, 20 October 2026.",
                                f"Appended TSV rows 347–367; SHA-256 {ADDITIONS_SHA256}. Short English glosses and provisional annotations."))
                sources[ADDITIONS_SOURCE_TITLE] = cursor.fetchone()["id"]
            cursor.execute("select lexeme_id, source_id from public.lexeme_sources")
            links = {(item["lexeme_id"], item["source_id"]) for item in cursor.fetchall()}

            counts = Counter()
            for row, current in plan:
                pos = row["part_of_speech"] or None
                tags = row["tags"]
                if current is None:
                    cursor.execute("insert into public.lexemes(headword, part_of_speech, linguistic_tags, usage_note, status) "
                                   "values (%s, %s, %s, %s, 'draft') returning id",
                                   (row["headword"], pos, tags, row["review_note"] or None))
                    entry_id = cursor.fetchone()["id"]
                    for order, meaning in enumerate(row["meanings"]):
                        cursor.execute("insert into public.senses(lexeme_id, gloss_en, display_order) values (%s, %s, %s)",
                                       (entry_id, meaning, order))
                        counts["new_senses"] += 1
                    counts["new_lexemes"] += 1
                else:
                    entry_id = current["id"]
                    needs_edit = current["part_of_speech"] != pos or current["linguistic_tags"] != tags
                    if needs_edit:
                        if current["status"] == "published":
                            cursor.execute("update public.lexemes set status='draft' where id=%s", (entry_id,))
                        cursor.execute("update public.lexemes set part_of_speech=%s, linguistic_tags=%s where id=%s",
                                       (pos, tags, entry_id))
                        counts["annotated_existing"] += 1
                    if row["headword"] == "kee(n)" and not senses.get(entry_id):
                        cursor.execute("insert into public.senses(lexeme_id, gloss_en) values (%s, %s)",
                                       (entry_id, row["meanings"][0]))
                        counts["resolved_kee_n"] += 1

                if row["source_rows"].isdigit():
                    is_addition = int(row["source_rows"]) >= 347
                    source_id = sources[ADDITIONS_SOURCE_TITLE if is_addition else ORIGINAL_SOURCE_TITLE]
                    if (entry_id, source_id) not in links:
                        cursor.execute("insert into public.lexeme_sources(lexeme_id, source_id, note) values (%s, %s, %s)",
                                       (entry_id, source_id, f"Owner list rows {row['source_rows']}; English glosses supplied by owner."))
                        counts["source_links"] += 1
                cursor.execute("select status from public.lexemes where id=%s", (entry_id,))
                if cursor.fetchone()["status"] != "published":
                    cursor.execute("update public.lexemes set status='published' where id=%s", (entry_id,))
                    counts["published"] += 1

            cursor.execute("select count(*) as total, count(*) filter(where status='published') as published, "
                           "count(*) filter(where cardinality(linguistic_tags)=0) as untagged from public.lexemes")
            final = cursor.fetchone()
            assert final == {"total": 375, "published": 375, "untagged": 0}, final
            cursor.execute("select count(*) as count from public.senses")
            assert cursor.fetchone()["count"] == 401
            print(json.dumps({"changes": counts, "final": final}, default=dict))
        connection.commit()
        print("Committed live dictionary update")


if __name__ == "__main__":
    main()
