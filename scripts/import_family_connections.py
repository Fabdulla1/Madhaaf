"""Import a private, owner-supplied TSV of people and direct relationships.

The input and optional name-alias JSON stay outside the public repository.
Dry run is the default. Rehearsal rolls back; apply backs up before writing.
Existing member and relationship rows are never modified.
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from import_kutchi_linguistic_evidence import connection_url

ROOT = Path(__file__).resolve().parents[1]
COLUMNS = ("Person", "Sibling", "Father", "Mother", "Wife", "Husband", "Children")


def normalized(name: str) -> str:
    return " ".join(name.split()).casefold()


def split_names(value: str) -> list[str]:
    return [name.strip() for name in value.split(",") if name.strip()]


def read_sheet(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source, delimiter="\t")
        if not set(COLUMNS).issubset(reader.fieldnames or []):
            raise RuntimeError("The TSV needs Person, Sibling, Father, Mother, Wife, Husband and Children columns")
        rows = [{column: (row.get(column) or "").strip() for column in COLUMNS}
                for row in reader if (row.get("Person") or "").strip()]
    if not rows:
        raise RuntimeError("The TSV has no people")
    if len({normalized(row["Person"]) for row in rows}) != len(rows):
        raise RuntimeError("The TSV repeats a Person row")
    return rows


def read_aliases(path: Path | None) -> dict[str, str]:
    if path is None:
        return {}
    aliases = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(aliases, dict) or any(not isinstance(k, str) or not isinstance(v, str)
                                            for k, v in aliases.items()):
        raise RuntimeError("Alias file must map supplied names to existing preferred names")
    return {normalized(key): value.strip() for key, value in aliases.items()}


def sheet_graph(rows: list[dict[str, str]], aliases: dict[str, str]):
    names: dict[str, str] = {}
    edges: dict[tuple[str, str, str], set[str]] = defaultdict(set)

    def canonical(name: str) -> str:
        chosen = aliases.get(normalized(name), name).strip()
        if not chosen:
            raise RuntimeError("Blank canonical name")
        key = normalized(chosen)
        names.setdefault(key, chosen)
        return key

    def add(kind: str, left: str, right: str, evidence: str):
        a, b = canonical(left), canonical(right)
        if a == b:
            raise RuntimeError(f"Self relationship after name matching: {left} / {right}")
        if kind != "parent":
            a, b = sorted((a, b))
        edges[(kind, a, b)].add(evidence)

    for row in rows:
        person = row["Person"]
        canonical(person)
        for sibling in split_names(row["Sibling"]):
            add("sibling", person, sibling, "sibling")
        for father in split_names(row["Father"]):
            add("parent", father, person, "father")
        for mother in split_names(row["Mother"]):
            add("parent", mother, person, "mother")
        for spouse in split_names(row["Wife"]):
            add("partner", person, spouse, "wife")
        for spouse in split_names(row["Husband"]):
            add("partner", person, spouse, "husband")
        for child in split_names(row["Children"]):
            add("parent", person, child, "child")
    for kind, a, b in edges:
        if kind == "sibling" and (("parent", a, b) in edges or ("parent", b, a) in edges):
            raise RuntimeError(f"The sheet calls {names[a]} and {names[b]} both siblings and parent/child")
    return names, edges


def read_state(cursor):
    cursor.execute("select id,preferred_name,status,visibility from public.family_members")
    people = cursor.fetchall()
    cursor.execute("select id,person_a_id,person_b_id,kind,status from public.family_relationships")
    relationships = cursor.fetchall()
    return people, relationships


def plan_import(names, edges, people, relationships, aliases):
    by_name = defaultdict(list)
    for person in people:
        by_name[normalized(person["preferred_name"])].append(person)
    for source, target in aliases.items():
        if normalized(target) not in by_name or len(by_name[normalized(target)]) != 1:
            raise RuntimeError(f"Alias for {source} does not name exactly one existing profile")
    duplicates = [name for name in names if len(by_name[name]) > 1]
    if duplicates:
        raise RuntimeError(f"Multiple existing profiles have an exact supplied name: {duplicates}")
    existing_ids = {name: by_name[name][0]["id"] for name in names if by_name[name]}
    if any(by_name[name][0]["status"] == "archived" for name in existing_ids):
        raise RuntimeError("A supplied person matches an archived profile; review before importing")
    wanted = []
    present = {(str(edge["person_a_id"]), str(edge["person_b_id"]), edge["kind"])
               for edge in relationships}
    for (kind, a, b), evidence in sorted(edges.items()):
        aid, bid = existing_ids.get(a), existing_ids.get(b)
        if aid and bid:
            if kind != "parent" and aid > bid:
                aid, bid = bid, aid
            if (str(aid), str(bid), kind) in present:
                continue
        wanted.append((kind, a, b, sorted(evidence)))
    return {"new_people": {name: label for name, label in names.items() if name not in existing_ids},
            "new_edges": wanted, "existing_ids": existing_ids,
            "existing_people": len(existing_ids),
            "existing_edges": len(edges) - len(wanted)}


def backup(cursor, directory: Path):
    directory = directory.resolve()
    if directory == ROOT or ROOT in directory.parents:
        raise RuntimeError("Backup directory must be outside the repository")
    directory.mkdir(parents=True, exist_ok=True)
    data = {}
    for table in ("family_members", "member_names", "family_relationships"):
        cursor.execute(f"select * from public.{table}")
        data[table] = cursor.fetchall()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    path = directory / f"madhaaf-family-before-connections-{stamp}.json"
    with path.open("x", encoding="utf-8") as output:
        json.dump(data, output, ensure_ascii=False, default=str, indent=2)
    return path


def apply(cursor, plan):
    ids = dict(plan["existing_ids"])
    for name, label in sorted(plan["new_people"].items()):
        cursor.execute("insert into public.family_members(preferred_name,status,visibility,living_status) "
                       "values (%s,'draft','private','unknown') returning id", (label,))
        ids[name] = cursor.fetchone()["id"]
    for kind, a, b, evidence in plan["new_edges"]:
        aid, bid = ids[a], ids[b]
        if kind != "parent" and aid > bid:
            aid, bid = bid, aid
        note = "Owner-supplied family table. Listed as: " + ", ".join(evidence) + "."
        cursor.execute("insert into public.family_relationships"
                       "(person_a_id,person_b_id,kind,parent_kind,confidence,note,status) "
                       "values (%s,%s,%s,%s,'confirmed',%s,'draft')",
                       (aid, bid, kind, "unknown" if kind == "parent" else None, note))


def main():
    import psycopg
    from psycopg.rows import dict_row

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--aliases", type=Path)
    parser.add_argument("--backup-dir", type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--rehearse", action="store_true")
    mode.add_argument("--backup-only", action="store_true")
    mode.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if (args.backup_only or args.apply) and not args.backup_dir:
        parser.error("--backup-only and --apply need an external --backup-dir")
    rows = read_sheet(args.input)
    aliases = read_aliases(args.aliases)
    names, edges = sheet_graph(rows, aliases)
    with psycopg.connect(connection_url(), row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("set transaction isolation level serializable")
            if args.apply or args.rehearse:
                cursor.execute("select pg_advisory_xact_lock(20261021, 906)")
            else:
                cursor.execute("set transaction read only")
            people, relationships = read_state(cursor)
            plan = plan_import(names, edges, people, relationships, aliases)
            cursor.execute("select exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid "
                           "where t.typname='relationship_kind' and e.enumlabel='sibling')")
            sibling_available = cursor.fetchone()["exists"]
            if (args.apply or args.rehearse) and not sibling_available and any(
                k == "sibling" for k, *_ in plan["new_edges"]
            ):
                raise RuntimeError("Sibling migration is not installed")
            print(json.dumps({"mode": "apply" if args.apply else "rehearse" if args.rehearse else
                              "backup-only" if args.backup_only else "dry-run",
                              "sheet_rows": len(rows), "distinct_people": len(names),
                              "existing_people": plan["existing_people"],
                              "new_people": len(plan["new_people"]),
                              "existing_edges": plan["existing_edges"],
                              "new_edges": len(plan["new_edges"]),
                              "by_kind": {kind: sum(edge[0] == kind for edge in plan["new_edges"])
                                          for kind in ("parent", "partner", "sibling")}}, indent=2))
            if args.backup_only:
                print("Backup:", backup(cursor, args.backup_dir))
                connection.rollback()
                return
            if not args.apply and not args.rehearse:
                connection.rollback()
                return
            if args.apply:
                print("Backup:", backup(cursor, args.backup_dir))
            apply(cursor, plan)
            after_people, after_relationships = read_state(cursor)
            second = plan_import(names, edges, after_people, after_relationships, aliases)
            if second["new_people"] or second["new_edges"]:
                raise RuntimeError("Second pass was not idempotent")
            if args.rehearse:
                connection.rollback()
                print("Rollback rehearsal passed")
                return
        connection.commit()
    print("Import committed")


if __name__ == "__main__":
    main()
