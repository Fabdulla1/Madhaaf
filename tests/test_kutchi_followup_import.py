"""Keep the twelve follow-up glosses exact and reject ambiguous matches."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from import_kutchi_followup_words import EXPECTED, evidence, plan_import  # noqa: E402


def empty_state():
    return {"lexemes": [], "senses": [], "spellings": [], "forms": [], "sources": []}


class FollowupImportTests(unittest.TestCase):
    def test_all_owner_spellings_and_glosses_are_preserved(self):
        entries = evidence()["entries"]
        self.assertEqual({item["headword"]: item["gloss_en"] for item in entries}, EXPECTED)
        self.assertIsNone(next(item for item in entries if item["headword"] == "madhath")["part_of_speech"])
        self.assertIsNone(next(item for item in entries if item["headword"] == "byaa")["part_of_speech"])

    def test_missing_entries_are_planned_once(self):
        planned, conflicts = plan_import(evidence(), empty_state())
        self.assertEqual(len(planned), 12)
        self.assertEqual(conflicts, [])

    def test_existing_spelling_or_different_meaning_blocks_import(self):
        state = empty_state()
        state["spellings"].append({"lexeme_id": "other", "spelling": "mudh"})
        state["lexemes"].append({"id": "existing", "headword": "ful",
                                 "part_of_speech": "noun", "status": "published"})
        state["senses"].append({"lexeme_id": "existing", "gloss_en": "different"})
        _, conflicts = plan_import(evidence(), state)
        self.assertTrue(any("mudh" in conflict for conflict in conflicts))
        self.assertTrue(any("ful" in conflict for conflict in conflicts))


if __name__ == "__main__":
    unittest.main()
