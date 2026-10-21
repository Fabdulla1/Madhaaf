"""Focused checks for the owner-supplied linguistic import fixture."""

import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "import_kutchi_linguistic_evidence.py"
SPEC = importlib.util.spec_from_file_location("kutchi_import", SCRIPT)
importer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(importer)


class EvidenceTest(unittest.TestCase):
    def test_only_attested_forms_and_complete_examples(self):
        payload = importer.evidence()
        forms = importer.forms(payload)
        self.assertEqual(len(forms), 95)
        self.assertEqual(len(payload["examples"]), 25)
        self.assertNotIn("Paa(n) maso", {x["kutchi"] for x in payload["examples"]})
        self.assertEqual(
            {x["written_form"] for x in forms if x["lemma"] == "chad" and x["tense"] == "past"},
            {"chadidinose", "chadyavose"},
        )
        self.assertEqual(
            {x["original_transcription"] for x in forms if x["lemma"] == "kar"}
            - {None},
            {"karantho", "karentho", "karenthi", "karonthaa"},
        )
        self.assertTrue(all(x["aspect"] is None for x in forms))
        self.assertTrue(all(
            x["mood"] is None for x in forms if x["mood"] != "imperative"
        ))
        self.assertEqual(importer.HELD_DRAFT_HEADWORDS,
                         {"khaa", "i(n)ya", "i(n)ye", "i(n)yo", "ai"})

    def test_near_spellings_are_conflicts_not_new_entries(self):
        payload = importer.evidence()
        existing = {
            "lexemes": [
                {"id": 1, "headword": "khaadho", "part_of_speech": "noun", "status": "published"},
                {"id": 2, "headword": "hada", "part_of_speech": "adverb", "status": "published"},
                {"id": 3, "headword": "hooda", "part_of_speech": "adverb", "status": "published"},
                {"id": 4, "headword": "maroo", "part_of_speech": "noun", "status": "published"},
                {"id": 5, "headword": "sare'lo", "part_of_speech": None, "status": "published"},
                {"id": 6, "headword": "sarelo", "part_of_speech": None, "status": "published"},
            ],
            "spellings": [], "senses": [],
        }
        plan = importer.build_plan(payload, existing)
        conflicts = "\n".join(plan["conflicts"])
        for headword in ("khadho", "hadaa", "hoodaa", "maru", "sare’lo"):
            self.assertIn(headword, conflicts)
            self.assertNotIn(headword, {x["headword"] for x in plan["new"]})

    def test_part_of_speech_conflict_is_not_mutated(self):
        payload = importer.evidence()
        existing = {
            "lexemes": [
                {"id": 1, "headword": "kar", "part_of_speech": "noun", "status": "published"}
            ],
            "spellings": [], "senses": [],
        }
        plan = importer.build_plan(payload, existing)
        self.assertNotIn("kar", plan["resolved"])
        self.assertFalse(plan["semantic_holds"])
        self.assertTrue(any("kar: existing part of speech" in x for x in plan["conflicts"]))

    def test_different_meaning_is_held_as_possible_homograph(self):
        payload = importer.evidence()
        existing = {
            "lexemes": [
                {"id": 1, "headword": "hee", "part_of_speech": "pronoun", "status": "published"}
            ],
            "spellings": [],
            "senses": [{"lexeme_id": 1, "gloss_en": "this"}],
        }
        plan = importer.build_plan(payload, existing)
        self.assertNotIn("hee", plan["resolved"])
        self.assertTrue(any(x.startswith("hee:") for x in plan["semantic_holds"]))


if __name__ == "__main__":
    unittest.main()
