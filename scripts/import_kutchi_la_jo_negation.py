"""Import the reviewed la, jo, and negation evidence into Madhaaf.

Dry run is the default. --rehearse writes twice in one rolled-back transaction.
--backup-only and --apply require a backup directory outside the repository.
No published dictionary child is edited without first drafting its owner in the
same serializable transaction; all original publication states are restored.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from import_kutchi_linguistic_evidence import connection_url, snapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "kutchi-la-jo-negation-evidence-20261021.json"
FORM_IDENTITY = (
    "grammatical_person", "grammatical_number", "gender", "tense", "aspect",
    "mood", "politeness",
)
FORM_EVIDENCE_STATUS = {
    "attested_form": "attested",
    "attested_form_provisional_relationship": "provisional",
    # The written forms themselves are speaker-attested. Only their syntactic
    # analysis remains unresolved, as the per-form note states explicitly.
    "elicited_form_unresolved_roles": "attested",
}


def example_key(text):
    # Punctuation belongs to the supplied transcription. Older punctuated
    # examples remain intact and the later unpunctuated attestations get their
    # own source records.
    return text.casefold()


def sense_definition(gloss):
    """Retain manifest status and analysis note in the existing sense schema."""
    status = gloss.get("evidence_status")
    label = "Speaker-attested context." if status == "attested_context" else "Provisional analysis."
    parts = [label, gloss.get("definition_en"), gloss.get("note")]
    return " ".join(part.strip() for part in parts if part)


def example_note(row):
    label = ("Untranslated elicitation; participant roles unresolved."
             if row.get("evidence_status") == "elicitation_unresolved"
             else "Speaker-attested sentence.")
    return " ".join(part.strip() for part in (label, row.get("note")) if part)


def evidence():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    sources = payload["sources"]
    entries = payload["entries"]
    examples = payload["examples"]
    forms = payload.get("forms", [])
    keys = [row["key"] for row in sources]
    if not keys or len(keys) != len(set(keys)):
        raise RuntimeError("Source keys are missing or duplicated")
    if len({row["title"] for row in sources}) != len(sources):
        raise RuntimeError("Manifest repeats a source title")
    if any(not row.get("title") or not row.get("citation") for row in sources):
        raise RuntimeError("Source provenance is incomplete")
    names = [row["headword"].casefold() for row in entries]
    if len(names) != len(set(names)):
        raise RuntimeError("Manifest repeats a headword")
    if len({example_key(row["kutchi_text"]) for row in examples}) != len(examples):
        raise RuntimeError("Manifest repeats an example")
    for row in entries:
        if row.get("action") not in ("new", "existing"):
            raise RuntimeError(f"{row['headword']}: action must be new or existing")
        if row.get("publication", "published") not in ("draft", "published"):
            raise RuntimeError(f"{row['headword']}: invalid publication state")
        if any(not gloss.get("gloss_en") for gloss in row.get("glosses", [])):
            raise RuntimeError(f"{row['headword']}: blank English gloss")
    for row in examples:
        if row["source_key"] not in keys:
            raise RuntimeError(f"{row['kutchi_text']}: unknown source key")
        if row.get("storage", "example") != "example":
            raise RuntimeError(f"{row['kutchi_text']}: evidence would not be stored in dictionary")
        if not row.get("kutchi_text") or not row.get("primary_headword"):
            raise RuntimeError("Example text and primary headword are required")
        if row.get("english_translation") is None and not row.get("note"):
            raise RuntimeError(f"{row['kutchi_text']}: untranslated evidence needs an uncertainty note")
    for row in forms:
        if row["source_key"] not in keys:
            raise RuntimeError(f"{row['written_form']}: unknown source key")
        if row.get("evidence_status") not in FORM_EVIDENCE_STATUS:
            raise RuntimeError(f"{row['written_form']}: unreviewed form evidence status")
    return payload


def read_state(cursor):
    queries = {
        "lexemes": "select id,headword,part_of_speech,usage_note,linguistic_tags,status from public.lexemes",
        "senses": "select id,lexeme_id,gloss_en,definition_en,display_order from public.senses",
        "spellings": "select lexeme_id,spelling from public.word_forms",
        "forms": "select id,lexeme_id,written_form,grammatical_person,grammatical_number,gender,tense,aspect,mood,politeness,original_transcription,evidence_status,source_id,note from public.inflected_forms",
        "examples": "select e.id,e.sense_id,e.kutchi_text,e.english_translation,e.note,e.source_id,s.lexeme_id from public.examples e join public.senses s on s.id=e.sense_id",
        "example_links": "select example_id,lexeme_id from public.example_lexemes",
        "sources": "select id,title,citation,url,notes from public.sources",
        "source_links": "select lexeme_id,source_id from public.lexeme_sources",
    }
    state = {}
    for key, query in queries.items():
        cursor.execute(query)
        state[key] = cursor.fetchall()
    return state


def plan_import(payload, state):
    """Plan from a snapshot; reject ambiguous homographs and conflicting evidence."""
    plan = {key: [] for key in (
        "sources", "entries", "senses", "forms", "examples", "example_links",
        "source_links", "sense_updates", "form_updates", "example_updates",
    )}
    conflicts = []
    sources_by_title = defaultdict(list)
    for row in state["sources"]:
        sources_by_title[row["title"]].append(row)
    source_ids = {}
    for row in payload["sources"]:
        matches = sources_by_title[row["title"]]
        if len(matches) > 1:
            conflicts.append(f"Source {row['title']}: multiple existing records")
        elif matches:
            old = matches[0]
            if any(old.get(field) != row.get(field) for field in ("citation", "url", "notes")):
                conflicts.append(f"Source {row['title']}: provenance differs")
            source_ids[row["key"]] = old["id"]
        else:
            source_ids[row["key"]] = f"NEW_SOURCE:{row['key']}"
            plan["sources"].append(row)

    heads = defaultdict(list)
    for row in state["lexemes"]:
        heads[row["headword"].casefold()].append(row)
    by_id = {row["id"]: row for row in state["lexemes"]}
    spellings = defaultdict(set)
    for row in state["spellings"]:
        spellings[row["spelling"].casefold()].add(row["lexeme_id"])
    written = defaultdict(set)
    for row in state["forms"]:
        written[row["written_form"].casefold()].add(row["lexeme_id"])
    senses = defaultdict(list)
    for row in state["senses"]:
        senses[row["lexeme_id"]].append(row)

    manifest_entries = {row["headword"].casefold(): row for row in payload["entries"]}
    name_ids = {}
    for row in payload["entries"]:
        name = row["headword"].casefold()
        matches = heads[name]
        if len(matches) > 1:
            conflicts.append(f"{row['headword']}: multiple exact-head homographs")
            continue
        if not matches:
            if row["action"] != "new":
                conflicts.append(f"{row['headword']}: reviewed existing headword is absent")
                continue
            if spellings[name] or written[name]:
                conflicts.append(f"{row['headword']}: collision with a spelling or recorded form")
                continue
            name_ids[name] = f"NEW_LEXEME:{name}"
            plan["entries"].append(row)
        else:
            old = matches[0]
            name_ids[name] = old["id"]
            expected = {g.casefold() for g in row.get("expected_existing_glosses", [])}
            actual = {s["gloss_en"].casefold() for s in senses[old["id"]]}
            corrected_expected = {
                gloss["supersedes_gloss_en"].casefold(): gloss["gloss_en"].casefold()
                for gloss in row.get("glosses", []) if gloss.get("supersedes_gloss_en")
            }
            if row["action"] == "existing" and any(
                old_gloss not in actual and corrected_expected.get(old_gloss) not in actual
                for old_gloss in expected
            ):
                conflicts.append(f"{row['headword']}: previously reviewed gloss changed")
            if row["action"] == "new" and not any(
                g["gloss_en"].casefold() in actual or
                (g.get("supersedes_gloss_en") and g["supersedes_gloss_en"].casefold() in actual)
                for g in row.get("glosses", [])
            ):
                conflicts.append(f"{row['headword']}: unexpected pre-existing homograph")
            if row.get("publication", "published") != old["status"] and row["action"] == "new":
                conflicts.append(f"{row['headword']}: publication state changed since reviewed import")
            if row.get("part_of_speech") is not None and row["action"] == "new" and row["part_of_speech"] != old["part_of_speech"]:
                conflicts.append(f"{row['headword']}: part of speech changed")
        owner = name_ids.get(name)
        if owner is None:
            continue
        old_senses = senses[owner] if owner in senses else []
        for gloss in row.get("glosses", []):
            accepted_glosses = {gloss["gloss_en"].casefold()}
            if gloss.get("supersedes_gloss_en"):
                accepted_glosses.add(gloss["supersedes_gloss_en"].casefold())
            same = [s for s in old_senses if s["gloss_en"].casefold() in accepted_glosses]
            if len(same) > 1:
                conflicts.append(f"{row['headword']}: duplicate existing gloss {gloss['gloss_en']}")
            elif same:
                old = same[0]
                desired_definition = sense_definition(gloss)
                if old["gloss_en"].casefold() == gloss["gloss_en"].casefold() and old["definition_en"] == desired_definition:
                    continue
                if gloss.get("supersedes_gloss_en") and old["gloss_en"].casefold() != gloss["supersedes_gloss_en"].casefold():
                    conflicts.append(f"{row['headword']}: gloss correction precondition differs")
                elif not gloss.get("supersedes_gloss_en") and old["gloss_en"].casefold() != gloss["gloss_en"].casefold():
                    conflicts.append(f"{row['headword']}: gloss changed unexpectedly")
                elif not (
                    ("supersedes_definition_en" in gloss and old["definition_en"] == gloss["supersedes_definition_en"])
                    or (gloss.get("supersedes_definition_contains")
                        and gloss["supersedes_definition_contains"] in (old["definition_en"] or ""))
                ):
                    conflicts.append(f"{row['headword']}: definition correction precondition differs for {gloss['gloss_en']}")
                else:
                    plan["sense_updates"].append((old["id"], row["headword"], gloss))
            else:
                plan["senses"].append((row["headword"], gloss))

    def owner_id(name):
        key = name.casefold()
        if key in name_ids:
            return name_ids[key]
        matches = heads[key]
        if len(matches) == 1:
            return matches[0]["id"]
        conflicts.append(f"{name}: example or form owner is absent or ambiguous")
        return None

    old_examples = defaultdict(list)
    for row in state["examples"]:
        old_examples[row["kutchi_text"].casefold()].append(row)
    old_example_links = {(r["example_id"], r["lexeme_id"]) for r in state["example_links"]}
    for row in payload["examples"]:
        primary = owner_id(row["primary_headword"])
        targets = [owner_id(name) for name in row.get("linked_headwords", [])]
        if primary is None or None in targets:
            continue
        if len(targets) != len(set(targets)) or primary in targets:
            conflicts.append(f"{row['kutchi_text']}: duplicate or primary cross-link")
        if row.get("primary_gloss_en"):
            expected_gloss = row["primary_gloss_en"].casefold()
            existing_glosses = {sense["gloss_en"].casefold() for sense in senses.get(primary, [])}
            manifest_glosses = {gloss["gloss_en"].casefold()
                                for gloss in manifest_entries.get(row["primary_headword"].casefold(), {}).get("glosses", [])}
            if expected_gloss not in existing_glosses | manifest_glosses:
                conflicts.append(f"{row['kutchi_text']}: primary sense {row['primary_gloss_en']} is absent")
        matches = old_examples[example_key(row["kutchi_text"])]
        if len(matches) > 1:
            conflicts.append(f"{row['kutchi_text']}: duplicate existing examples")
            continue
        if matches:
            old = matches[0]
            if old["kutchi_text"] != row["kutchi_text"]:
                conflicts.append(f"{row['kutchi_text']}: existing capitalization or transcription differs")
            if old["english_translation"] != row.get("english_translation"):
                if row.get("supersedes_translation") == old["english_translation"]:
                    plan["example_updates"].append((old["id"], row))
                else:
                    conflicts.append(f"{row['kutchi_text']}: existing translation differs")
            elif row.get("supersedes_translation") and old["note"] != example_note(row):
                conflicts.append(f"{row['kutchi_text']}: corrected translation has unexpected note")
            example_id = old["id"]
            if old["lexeme_id"] != primary:
                targets.append(primary)
        else:
            example_id = f"NEW_EXAMPLE:{row['kutchi_text'].casefold()}"
            plan["examples"].append(row)
        for target in set(targets):
            if (example_id, target) not in old_example_links:
                plan["example_links"].append((row["kutchi_text"], target))

    for row in payload.get("forms", []):
        owner = owner_id(row["lemma"])
        if owner is None:
            continue
        same_word = [old for old in state["forms"]
                     if old["written_form"].casefold() == row["written_form"].casefold()]
        if any(old["lexeme_id"] != owner for old in same_word):
            conflicts.append(f"{row['written_form']}: form belongs to another lemma")
            continue
        candidates = [old for old in same_word if old["lexeme_id"] == owner and
                      all(old[field] == row.get(field) for field in FORM_IDENTITY if field != "tense")]
        if len(candidates) > 1:
            conflicts.append(f"{row['written_form']}: multiple forms match reviewed correction")
            continue
        if candidates:
            old = candidates[0]
            if (old["evidence_status"], old["original_transcription"], old["source_id"]) != (
                FORM_EVIDENCE_STATUS[row["evidence_status"]], row.get("original_transcription"),
                source_ids[row["source_key"]]
            ):
                conflicts.append(f"{row['written_form']}: existing form provenance differs")
            elif old["tense"] == row.get("tense") and old["note"] == row.get("note"):
                pass
            elif ("supersedes_tense" in row and old["tense"] == row["supersedes_tense"]
                  and row.get("supersedes_note_contains")
                  and row["supersedes_note_contains"] in (old["note"] or "")):
                plan["form_updates"].append((old["id"], row))
            else:
                conflicts.append(f"{row['written_form']}: form correction precondition differs")
        elif "supersedes_tense" in row and same_word:
            conflicts.append(f"{row['written_form']}: reviewed form context differs")
        elif row["written_form"].casefold() in heads or row["written_form"].casefold() in spellings:
            conflicts.append(f"{row['written_form']}: independent headword or spelling exists")
        else:
            plan["forms"].append(row)

    source_links = {(r["lexeme_id"], r["source_id"]) for r in state["source_links"]}
    required_links = set()
    for row in payload["entries"]:
        for key in row.get("source_keys", []):
            required_links.add((row["headword"], key))
    for row in payload["examples"]:
        for headword in [row["primary_headword"], *row.get("linked_headwords", [])]:
            required_links.add((headword, row["source_key"]))
    for row in payload.get("forms", []):
        required_links.add((row["lemma"], row["source_key"]))
    for headword, key in sorted(required_links):
        owner = owner_id(headword)
        if key not in source_ids:
            conflicts.append(f"{headword}: unknown source key {key}")
        elif owner is not None and (owner, source_ids[key]) not in source_links:
            plan["source_links"].append((headword, key))

    # Publication guards consult both sides of cross-links. Track existing
    # primary owners in addition to the lexeme receiving each new link.
    touched = set()
    for headword, _ in plan["senses"]:
        touched.add(owner_id(headword))
    example_owner = {row["id"]: row["lexeme_id"] for row in state["examples"]}
    example_sense = {row["id"]: row["sense_id"] for row in state["examples"]}
    linked_targets = defaultdict(set)
    for link in state["example_links"]:
        linked_targets[link["example_id"]].add(link["lexeme_id"])
    for sense_id, headword, _ in plan["sense_updates"]:
        touched.add(owner_id(headword))
        for example_id, attached_sense in example_sense.items():
            if attached_sense == sense_id:
                touched.update(linked_targets[example_id])
    for row in plan["forms"]:
        touched.add(owner_id(row["lemma"]))
    for _, row in plan["form_updates"]:
        touched.add(owner_id(row["lemma"]))
    for row in plan["examples"]:
        touched.add(owner_id(row["primary_headword"]))
    for example_id, _ in plan["example_updates"]:
        touched.add(example_owner[example_id])
        touched.update(linked_targets[example_id])
    for text, target in plan["example_links"]:
        touched.add(target)
        matches = old_examples[example_key(text)]
        if matches:
            touched.add(matches[0]["lexeme_id"])
        else:
            entry = next(r for r in payload["examples"] if r["kutchi_text"] == text)
            touched.add(owner_id(entry["primary_headword"]))
    for headword, _ in plan["source_links"]:
        touched.add(owner_id(headword))
    plan["draft_ids"] = sorted((item for item in touched if item in by_id and by_id[item]["status"] == "published"), key=str)
    return plan, conflicts


def record_correction(cursor, table, record_id):
    """Child tables lack the lexeme audit trigger; retain the exact old row."""
    if table not in ("senses", "inflected_forms", "examples"):
        raise RuntimeError("Unexpected correction table")
    cursor.execute(
        f"insert into public.editorial_revisions(table_name,record_id,old_record,changed_by) "
        f"select %s,item.id,to_jsonb(item),auth.uid() from public.{table} item where item.id=%s",
        (table, record_id),
    )
    if cursor.rowcount != 1:
        raise RuntimeError(f"{table}: correction target disappeared")
    cursor.execute("insert into public.audit_events(table_name,record_id,operation,actor_id) "
                   "values (%s,%s,'UPDATE',auth.uid())", (table, record_id))


def apply_import(cursor, payload, state, plan):
    counts = Counter()
    if not any(plan[key] for key in (
        "sources", "entries", "senses", "forms", "examples", "example_links",
        "source_links", "sense_updates", "form_updates", "example_updates",
    )):
        return counts
    original_statuses = {row["id"]: row["status"] for row in state["lexemes"]}
    for entry_id in plan["draft_ids"]:
        cursor.execute("update public.lexemes set status='draft' where id=%s", (entry_id,))
    source_ids = {row["key"]: next((old["id"] for old in state["sources"] if old["title"] == row["title"]), None)
                  for row in payload["sources"]}
    for row in plan["sources"]:
        cursor.execute("insert into public.sources(title,citation,url,notes) values (%s,%s,%s,%s) returning id",
                       (row["title"], row["citation"], row.get("url"), row.get("notes")))
        source_ids[row["key"]] = cursor.fetchone()["id"]
        counts["sources"] += 1
    entry_ids = {row["headword"].casefold(): row["id"] for row in state["lexemes"]}
    for row in plan["entries"]:
        cursor.execute("insert into public.lexemes(headword,part_of_speech,usage_note,linguistic_tags,status) "
                       "values (%s,%s,%s,%s,'draft') returning id",
                       (row["headword"], row.get("part_of_speech"), row.get("usage_note"),
                        row.get("linguistic_tags", [])))
        entry_ids[row["headword"].casefold()] = cursor.fetchone()["id"]
        counts["lexemes"] += 1
    for sense_id, _, gloss in plan["sense_updates"]:
        record_correction(cursor, "senses", sense_id)
        cursor.execute("update public.senses set gloss_en=%s,definition_en=%s where id=%s "
                       "returning gloss_en,definition_en",
                       (gloss["gloss_en"], sense_definition(gloss), sense_id))
        updated = cursor.fetchone()
        if updated is None or (updated["gloss_en"], updated["definition_en"]) != (
            gloss["gloss_en"], sense_definition(gloss)
        ):
            raise RuntimeError("Sense correction was suppressed by a database trigger")
        counts["sense_corrections"] += 1
    for headword, gloss in plan["senses"]:
        entry_id = entry_ids[headword.casefold()]
        cursor.execute("select coalesce(max(display_order),-1)+1 as n from public.senses where lexeme_id=%s", (entry_id,))
        order = cursor.fetchone()["n"]
        cursor.execute("insert into public.senses(lexeme_id,gloss_en,definition_en,display_order) values (%s,%s,%s,%s)",
                       (entry_id, gloss["gloss_en"], sense_definition(gloss), order))
        counts["senses"] += 1
    for form_id, row in plan["form_updates"]:
        record_correction(cursor, "inflected_forms", form_id)
        cursor.execute("update public.inflected_forms set tense=%s,note=%s where id=%s returning tense,note",
                       (row.get("tense"), row.get("note"), form_id))
        updated = cursor.fetchone()
        if updated is None or (updated["tense"], updated["note"]) != (row.get("tense"), row.get("note")):
            raise RuntimeError("Form correction was suppressed by a database trigger")
        counts["form_corrections"] += 1
    for row in plan["forms"]:
        cursor.execute("insert into public.inflected_forms "
                       "(lexeme_id,written_form,grammatical_person,grammatical_number,gender,tense,aspect,mood,politeness,original_transcription,evidence_status,source_id,note) "
                       "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                       (entry_ids[row["lemma"].casefold()], row["written_form"],
                        *(row.get(key) for key in FORM_IDENTITY), row.get("original_transcription"),
                        FORM_EVIDENCE_STATUS[row["evidence_status"]], source_ids[row["source_key"]], row.get("note")))
        counts["forms"] += 1
    example_ids = {row["kutchi_text"].casefold(): row["id"] for row in state["examples"]}
    for example_id, row in plan["example_updates"]:
        record_correction(cursor, "examples", example_id)
        cursor.execute("update public.examples set english_translation=%s,note=%s where id=%s "
                       "returning english_translation,note",
                       (row.get("english_translation"), example_note(row), example_id))
        updated = cursor.fetchone()
        if updated is None or (updated["english_translation"], updated["note"]) != (
            row.get("english_translation"), example_note(row)
        ):
            raise RuntimeError("Example correction was suppressed by a database trigger")
        counts["example_corrections"] += 1
    for row in plan["examples"]:
        entry_id = entry_ids[row["primary_headword"].casefold()]
        cursor.execute("select id,gloss_en from public.senses where lexeme_id=%s order by display_order", (entry_id,))
        possible = cursor.fetchall()
        if row.get("primary_gloss_en"):
            possible = [sense for sense in possible if sense["gloss_en"].casefold() == row["primary_gloss_en"].casefold()]
        if len(possible) != 1:
            raise RuntimeError(f"{row['kutchi_text']}: primary sense is ambiguous")
        sense_id = possible[0]["id"]
        cursor.execute("select coalesce(max(display_order),-1)+1 as n from public.examples where sense_id=%s", (sense_id,))
        order = cursor.fetchone()["n"]
        cursor.execute("insert into public.examples(sense_id,kutchi_text,english_translation,note,source_id,display_order) "
                       "values (%s,%s,%s,%s,%s,%s) returning id",
                       (sense_id, row["kutchi_text"], row.get("english_translation"), example_note(row),
                        source_ids[row["source_key"]], order))
        example_ids[row["kutchi_text"].casefold()] = cursor.fetchone()["id"]
        counts["examples"] += 1
    for text, target in plan["example_links"]:
        # Targets may have been newly inserted; symbolic IDs from planning are
        # intentionally resolved from the reviewed manifest spelling.
        if isinstance(target, str) and target.startswith("NEW_LEXEME:"):
            target = entry_ids[target.split(":", 1)[1]]
        cursor.execute("insert into public.example_lexemes(example_id,lexeme_id) values (%s,%s)",
                       (example_ids[example_key(text)], target))
        counts["example_links"] += 1
    for headword, key in plan["source_links"]:
        cursor.execute("insert into public.lexeme_sources(lexeme_id,source_id,note) values (%s,%s,%s)",
                       (entry_ids[headword.casefold()], source_ids[key],
                        "Farhan Abdulla, October 2026 speaker-attested evidence; see cited source."))
        counts["source_links"] += 1
    for row in plan["entries"]:
        if row.get("publication", "published") == "published":
            cursor.execute("update public.lexemes set status='published' where id=%s",
                           (entry_ids[row["headword"].casefold()],))
    for entry_id in plan["draft_ids"]:
        cursor.execute("update public.lexemes set status=%s where id=%s", (original_statuses[entry_id], entry_id))
    counts["existing_entries_touched"] = len(plan["draft_ids"])
    return counts


def save_backup(cursor, backup_dir, label):
    backup_dir.mkdir(parents=True, exist_ok=True)
    path = backup_dir / f"madhaaf-dictionary-before-la-jo-negation-{label}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
    with path.open("x", encoding="utf-8") as file:
        json.dump(snapshot(cursor), file, ensure_ascii=False, default=str, indent=2)
        file.flush()
    return path


def main():
    import psycopg
    from psycopg.rows import dict_row

    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--rehearse", action="store_true")
    mode.add_argument("--backup-only", action="store_true")
    mode.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-dir", type=Path)
    args = parser.parse_args()
    if (args.apply or args.backup_only) and args.backup_dir is None:
        parser.error("--apply and --backup-only require --backup-dir")
    backup_dir = args.backup_dir.resolve() if args.backup_dir else None
    if backup_dir and (backup_dir == ROOT or ROOT in backup_dir.parents):
        parser.error("Backup directory must be outside the repository")

    payload = evidence()
    with psycopg.connect(connection_url(), row_factory=dict_row) as connection:
        with connection.cursor() as cursor:
            cursor.execute("set transaction isolation level serializable")
            if not args.apply and not args.rehearse:
                cursor.execute("set transaction read only")
            else:
                cursor.execute("select pg_advisory_xact_lock(20261021, 811)")
            cursor.execute("select current_database() as db,current_user as role,"
                           "to_regclass('public.inflected_forms') as forms,"
                           "to_regclass('public.example_lexemes') as links,"
                           "has_table_privilege(current_user,'public.lexemes','INSERT,UPDATE') as can_edit")
            target = cursor.fetchone()
            if not target["forms"] or not target["links"] or not target["can_edit"]:
                raise RuntimeError("Dictionary migrations or edit privilege are missing")
            state = read_state(cursor)
            plan, conflicts = plan_import(payload, state)
            summary = {"mode": "apply" if args.apply else "rehearse" if args.rehearse else
                       "backup-only" if args.backup_only else "dry-run",
                       "database": target["db"], "role": target["role"],
                       "existing_lexemes": len(state["lexemes"]),
                       "existing_examples_reused": sum(
                           example_key(row["kutchi_text"]) in {
                               old["kutchi_text"].casefold() for old in state["examples"]
                           } for row in payload["examples"]
                       ),
                       "planned": {key: len(value) for key, value in plan.items()},
                       "conflicts": conflicts}
            print(json.dumps(summary, ensure_ascii=False, default=str, indent=2))
            if conflicts:
                raise RuntimeError("Dictionary conflicts require review")
            if args.backup_only:
                path = save_backup(cursor, backup_dir, "backup-only")
                print(json.dumps({"backup": str(path)}, indent=2))
                connection.rollback()
                return
            if not args.apply and not args.rehearse:
                connection.rollback()
                return
            before = {row["id"]: row["status"] for row in state["lexemes"]}
            if args.rehearse:
                try:
                    first = apply_import(cursor, payload, state, plan)
                    next_state = read_state(cursor)
                    if any(row["status"] != before[row["id"]] for row in next_state["lexemes"] if row["id"] in before):
                        raise RuntimeError("An original publication state changed")
                    second_plan, second_conflicts = plan_import(payload, next_state)
                    if second_conflicts or any(second_plan[key] for key in plan if key != "draft_ids"):
                        raise RuntimeError(f"Second pass is not idempotent: {second_conflicts}")
                    second = apply_import(cursor, payload, next_state, second_plan)
                    print(json.dumps({"first": dict(first), "second": dict(second),
                                      "rolled_back": True}, indent=2))
                finally:
                    connection.rollback()
                return
            if not any(plan[key] for key in plan if key != "draft_ids"):
                connection.rollback()
                print("No changes needed")
                return
            path = save_backup(cursor, backup_dir, "apply")
            counts = apply_import(cursor, payload, state, plan)
            next_state = read_state(cursor)
            if any(row["status"] != before[row["id"]] for row in next_state["lexemes"] if row["id"] in before):
                raise RuntimeError("An original publication state changed")
            second_plan, second_conflicts = plan_import(payload, next_state)
            if second_conflicts or any(second_plan[key] for key in plan if key != "draft_ids"):
                raise RuntimeError(f"Applied import is not idempotent: {second_conflicts}")
            print(json.dumps({"backup": str(path), "created": dict(counts)}, indent=2))
        connection.commit()


if __name__ == "__main__":
    main()
