"""Regression checks for the reviewed la/jo/negation import plan."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from import_kutchi_la_jo_negation import (  # noqa: E402
    FORM_EVIDENCE_STATUS,
    evidence,
    example_key,
    example_note,
    plan_import,
    sense_definition,
)


def empty_state():
    return {key: [] for key in (
        "lexemes", "senses", "spellings", "forms", "examples", "example_links",
        "sources", "source_links",
    )}


def small_payload():
    return {
        "sources": [{"key": "speaker", "title": "Speaker study", "citation": "Native speaker",
                     "url": "/language/articles/test", "notes": "Reviewed."}],
        "entries": [
            {"headword": "la", "action": "new", "publication": "published",
             "part_of_speech": None, "glosses": [{"gloss_en": "for", "definition_en": "Beneficiary."}],
             "source_keys": ["speaker"]},
            {"headword": "jo", "action": "existing", "publication": "published",
             "part_of_speech": None, "expected_existing_glosses": ["for"],
             "glosses": [{"gloss_en": "of; 's", "definition_en": "Possessor.",
                          "evidence_status": "attested_context", "note": "Contextual only."}],
             "source_keys": ["speaker"]},
        ],
        "forms": [],
        "examples": [
            {"kutchi_text": "Hin jo pe(n)sa", "english_translation": "his money",
             "primary_headword": "jo", "primary_gloss_en": "of; 's",
             "linked_headwords": ["la"], "source_key": "speaker",
             "evidence_status": "attested", "note": "Paired study."},
        ],
    }


class LaJoNegationImportTests(unittest.TestCase):
    def test_manifest_preserves_distinctions_and_untranslated_forms(self):
        data = evidence()
        entries = {row["headword"]: row for row in data["entries"]}
        self.assertEqual(entries["jo"]["expected_existing_glosses"], ["for"])
        self.assertEqual(entries["khadho"]["publication"], "draft")
        self.assertEqual(entries["khade"]["publication"], "draft")
        self.assertEqual(entries["raja"]["publication"], "draft")
        self.assertNotIn("hin", entries)
        self.assertEqual({row["lemma"] for row in data["forms"]}, {"de"})
        unresolved = [row for row in data["examples"] if row["english_translation"] is None]
        self.assertEqual(len(unresolved), 2)
        self.assertTrue(all(row["evidence_status"] == "elicitation_unresolved" and row["note"]
                            for row in unresolved))

    def test_evidence_status_and_notes_survive_existing_schema(self):
        gloss = {"definition_en": "Occurs here.", "note": "Other uses unresolved.",
                 "evidence_status": "attested_context"}
        self.assertIn("Speaker-attested context", sense_definition(gloss))
        self.assertIn("Other uses unresolved", sense_definition(gloss))
        self.assertIn("Untranslated elicitation", example_note({"evidence_status": "elicitation_unresolved"}))
        self.assertEqual(FORM_EVIDENCE_STATUS["elicited_form_unresolved_roles"], "attested")

    def test_plan_keeps_old_jo_gloss_and_distinguishes_punctuation(self):
        state = empty_state()
        state["lexemes"] = [{"id": "jo-id", "headword": "jo", "status": "published",
                             "part_of_speech": None}]
        state["senses"] = [{"id": "for-id", "lexeme_id": "jo-id", "gloss_en": "for",
                            "definition_en": None, "display_order": 0}]
        plan, conflicts = plan_import(small_payload(), state)
        self.assertEqual(conflicts, [])
        self.assertEqual([row["headword"] for row in plan["entries"]], ["la"])
        self.assertEqual({gloss["gloss_en"] for _, gloss in plan["senses"]}, {"for", "of; 's"})
        self.assertNotEqual(example_key("Nah vin"), example_key("Nah vin!"))
        self.assertIn("jo-id", plan["draft_ids"])

    def test_unexpected_homograph_and_changed_jo_gloss_block_import(self):
        state = empty_state()
        state["lexemes"] = [
            {"id": "la-other", "headword": "la", "status": "published", "part_of_speech": None},
            {"id": "jo-id", "headword": "jo", "status": "published", "part_of_speech": None},
        ]
        state["senses"] = [{"id": "wrong", "lexeme_id": "jo-id", "gloss_en": "unrelated",
                            "definition_en": None, "display_order": 0}]
        _, conflicts = plan_import(small_payload(), state)
        self.assertTrue(any("la: unexpected pre-existing homograph" in item for item in conflicts))
        self.assertTrue(any("jo: previously reviewed gloss changed" in item for item in conflicts))

    def test_new_punctuation_variant_keeps_its_own_source(self):
        payload = small_payload()
        payload["entries"] = [{"headword": "nah", "action": "existing", "publication": "published",
                               "expected_existing_glosses": ["no"], "glosses": [],
                               "source_keys": ["speaker"]}]
        payload["examples"] = [{"kutchi_text": "Nah vin", "english_translation": "Don't go!",
                                "primary_headword": "nah", "primary_gloss_en": "no",
                                "linked_headwords": [], "source_key": "speaker",
                                "evidence_status": "attested", "note": "Command."}]
        state = empty_state()
        state["lexemes"] = [
            {"id": "nah-id", "headword": "nah", "status": "published", "part_of_speech": "interjection"},
            {"id": "vin-id", "headword": "vin", "status": "published", "part_of_speech": "verb"},
        ]
        state["senses"] = [
            {"id": "no-id", "lexeme_id": "nah-id", "gloss_en": "no", "definition_en": None},
            {"id": "go-id", "lexeme_id": "vin-id", "gloss_en": "go", "definition_en": None},
        ]
        state["examples"] = [{"id": "old-example", "sense_id": "go-id", "lexeme_id": "vin-id",
                              "kutchi_text": "Nah vin!", "english_translation": "Don't go!",
                              "note": "Older wording", "source_id": "old-source"}]
        plan, conflicts = plan_import(payload, state)
        self.assertEqual(conflicts, [])
        self.assertEqual([row["kutchi_text"] for row in plan["examples"]], ["Nah vin"])
        self.assertEqual(plan["example_links"], [])
        self.assertEqual(set(plan["draft_ids"]), {"nah-id"})

    def test_same_form_with_different_source_or_note_conflicts(self):
        payload = small_payload()
        payload["entries"] = [{"headword": "de", "action": "new", "publication": "published",
                               "part_of_speech": "verb", "glosses": [{"gloss_en": "give"}],
                               "source_keys": ["speaker"]}]
        payload["examples"] = []
        payload["forms"] = [{"lemma": "de", "written_form": "dye", "source_key": "speaker",
                             "evidence_status": "attested_form", "note": "Reviewed"}]
        state = empty_state()
        state["lexemes"] = [{"id": "de-id", "headword": "de", "status": "published",
                             "part_of_speech": "verb"}]
        state["senses"] = [{"id": "give-id", "lexeme_id": "de-id", "gloss_en": "give",
                            "definition_en": sense_definition({"gloss_en": "give"})}]
        state["forms"] = [{"id": "form-id", "lexeme_id": "de-id", "written_form": "dye",
                           **{field: None for field in (
                               "grammatical_person", "grammatical_number", "gender", "tense",
                               "aspect", "mood", "politeness", "original_transcription")},
                           "evidence_status": "attested", "source_id": "old-source",
                           "note": "Different evidence"}]
        _, conflicts = plan_import(payload, state)
        self.assertTrue(any("existing form provenance differs" in item for item in conflicts))

    def test_reviewed_corrections_plan_once_and_draft_crosslinked_owners(self):
        source = {"key": "speaker", "title": "Speaker study", "citation": "Native speaker",
                  "url": "/language/articles/test", "notes": "Reviewed."}
        corrected_gloss = {"gloss_en": "negative form in attested constructions",
                           "supersedes_gloss_en": "negative form in present constructions",
                           "supersedes_definition_en": None,
                           "definition_en": "The sleep sentence has a future meaning.",
                           "evidence_status": "attested_context"}
        corrected_form = {"lemma": "de", "written_form": "dhine", "source_key": "speaker",
                          "evidence_status": "attested_form", "tense": None,
                          "supersedes_tense": "past", "supersedes_note_contains": "past-negative",
                          "note": "The form's tense contribution remains unresolved."}
        corrected_example = {"kutchi_text": "Natho sume", "english_translation": "He won't sleep.",
                             "supersedes_translation": "He is not sleeping.",
                             "primary_headword": "natho",
                             "primary_gloss_en": corrected_gloss["gloss_en"],
                             "linked_headwords": ["sum"], "source_key": "speaker",
                             "evidence_status": "attested", "note": "Speaker-corrected future meaning."}
        payload = {"sources": [source], "entries": [
            {"headword": "natho", "action": "existing", "publication": "published",
             "expected_existing_glosses": ["negative form in present constructions"],
             "glosses": [corrected_gloss], "source_keys": ["speaker"]},
            {"headword": "de", "action": "existing", "publication": "published",
             "expected_existing_glosses": ["give"], "glosses": [], "source_keys": ["speaker"]},
        ], "forms": [corrected_form], "examples": [corrected_example]}
        state = empty_state()
        state["sources"] = [{"id": "source-id", **{k: v for k, v in source.items() if k != "key"}}]
        state["lexemes"] = [
            {"id": "natho-id", "headword": "natho", "status": "published", "part_of_speech": None},
            {"id": "de-id", "headword": "de", "status": "published", "part_of_speech": "verb"},
            {"id": "sum-id", "headword": "sum", "status": "published", "part_of_speech": "verb"},
        ]
        state["senses"] = [
            {"id": "negative-sense", "lexeme_id": "natho-id",
             "gloss_en": "negative form in present constructions", "definition_en": None},
            {"id": "give-sense", "lexeme_id": "de-id", "gloss_en": "give", "definition_en": None},
        ]
        state["source_links"] = [{"lexeme_id": owner, "source_id": "source-id"}
                                 for owner in ("natho-id", "de-id", "sum-id")]
        state["forms"] = [{"id": "dhine-id", "lexeme_id": "de-id", "written_form": "dhine",
                           **{field: None for field in (
                               "grammatical_person", "grammatical_number", "gender", "aspect",
                               "mood", "politeness", "original_transcription")},
                           "tense": "past", "evidence_status": "attested", "source_id": "source-id",
                           "note": "Recorded past-negative giving."}]
        state["examples"] = [{"id": "sleep-example", "sense_id": "negative-sense",
                              "lexeme_id": "natho-id", "kutchi_text": "Natho sume",
                              "english_translation": "He is not sleeping.", "note": "Older analysis",
                              "source_id": "old-example-source"}]
        state["example_links"] = [{"example_id": "sleep-example", "lexeme_id": "sum-id"}]

        first, conflicts = plan_import(payload, state)
        self.assertEqual(conflicts, [])
        self.assertEqual([len(first[key]) for key in
                          ("sense_updates", "form_updates", "example_updates")], [1, 1, 1])
        self.assertEqual(set(first["draft_ids"]), {"natho-id", "de-id", "sum-id"})

        state["senses"][0]["gloss_en"] = corrected_gloss["gloss_en"]
        state["senses"][0]["definition_en"] = sense_definition(corrected_gloss)
        state["forms"][0]["tense"] = corrected_form["tense"]
        state["forms"][0]["note"] = corrected_form["note"]
        state["examples"][0]["english_translation"] = corrected_example["english_translation"]
        state["examples"][0]["note"] = example_note(corrected_example)
        second, conflicts = plan_import(payload, state)
        self.assertEqual(conflicts, [])
        self.assertFalse(any(second[key] for key in second))

    def test_correction_refuses_unreviewed_old_value(self):
        payload = small_payload()
        payload["entries"] = [{"headword": "jo", "action": "existing", "publication": "published",
                               "expected_existing_glosses": ["for"], "glosses": [{
                                   "gloss_en": "of; 's", "supersedes_gloss_en": "for",
                                   "supersedes_definition_en": None,
                                   "definition_en": "Possession", "evidence_status": "attested_context"}]}]
        payload["examples"] = []
        state = empty_state()
        state["lexemes"] = [{"id": "jo-id", "headword": "jo", "status": "published",
                             "part_of_speech": None}]
        state["senses"] = [{"id": "for-id", "lexeme_id": "jo-id", "gloss_en": "for",
                            "definition_en": "unexpected editorial change"}]
        _, conflicts = plan_import(payload, state)
        self.assertTrue(any("definition correction precondition differs" in item for item in conflicts))

    def test_new_entry_from_prior_import_accepts_reviewed_old_gloss(self):
        payload = small_payload()
        payload["entries"] = [{"headword": "nathi", "action": "new", "publication": "published",
                               "part_of_speech": None, "glosses": [{
                                   "gloss_en": "negative form in attested clauses",
                                   "supersedes_gloss_en": "negative form in present clauses",
                                   "supersedes_definition_en": None,
                                   "definition_en": "The sleep example means won't sleep.",
                                   "evidence_status": "attested_context"}]}]
        payload["examples"] = []
        state = empty_state()
        state["lexemes"] = [{"id": "nathi-id", "headword": "nathi", "status": "published",
                             "part_of_speech": None}]
        state["senses"] = [{"id": "nathi-sense", "lexeme_id": "nathi-id",
                            "gloss_en": "negative form in present clauses", "definition_en": None}]
        plan, conflicts = plan_import(payload, state)
        self.assertEqual(conflicts, [])
        self.assertEqual(len(plan["sense_updates"]), 1)
        self.assertEqual(plan["entries"], [])


if __name__ == "__main__":
    unittest.main()
