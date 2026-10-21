"""Check owner-list provenance and conflict-sensitive import planning."""

import sys
import unittest
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from import_kutchi_word_list_additions import evidence, plan_import  # noqa: E402


def existing_state():
    glosses = {
        "heklo": "alone (masculine)", "hekli": "alone (feminine)",
        "nindhar": "sleep", "se": "because", "kaaro": "black",
        "jaldi": "quickly", "pat": "floor", "miri(n)": "everyone",
        "goro": "horse", "no": "nine", "poi": "then",
        "chakli": "bird", "sangan": "chain", "sono": "dream",
    }
    lexemes = [{"id": name, "headword": name, "part_of_speech": None,
                "status": "published"} for name in glosses]
    senses = [{"lexeme_id": name, "gloss_en": gloss, "display_order": 0}
              for name, gloss in glosses.items()]
    spellings = [{"lexeme_id": name, "spelling": name} for name in glosses]
    return {"lexemes": lexemes, "senses": senses, "spellings": spellings,
            "forms": [], "sources": [], "source_links": []}


class WordListAdditionsTests(unittest.TestCase):
    def test_source_rows_and_grammatical_forms_are_explicit(self):
        payload = evidence()
        rows = payload["rows"]
        self.assertEqual((rows[0]["source_row"], rows[-1]["source_row"]), (368, 454))
        self.assertEqual(next(row for row in rows if row["word"] == "no")["action"], "homograph")
        self.assertEqual(next(row for row in rows if row["word"] == "ghaambryo")["action"], "new_entry")
        self.assertEqual({row["word"] for row in rows if row["action"] == "recorded_form"},
                         {"jorathi", "ruparee", "ugaree", "ugaraa"})
        self.assertIsNone(next(row for row in rows if row["word"] == "ugaraa")["gender"])

    def test_plan_preserves_nine_and_adds_nail_as_homograph(self):
        operations, conflicts = plan_import(evidence(), existing_state())
        self.assertEqual(conflicts, [])
        self.assertEqual(Counter(row["action"] for row in operations),
                         {"new_entry": 69, "homograph": 1, "add_sense": 1,
                          "spelling_variant": 3, "recorded_form": 4})

    def test_an_existing_variant_spelling_is_not_merged_silently(self):
        state = existing_state()
        state["lexemes"].append({"id": "other", "headword": "chaklee",
                                 "part_of_speech": "noun", "status": "published"})
        state["senses"].append({"lexeme_id": "other", "gloss_en": "other", "display_order": 0})
        _, conflicts = plan_import(evidence(), state)
        self.assertTrue(any("chaklee" in conflict for conflict in conflicts))

    def test_missing_original_homograph_blocks_import(self):
        state = existing_state()
        state["senses"] = [sense for sense in state["senses"] if sense["lexeme_id"] != "no"]
        _, conflicts = plan_import(evidence(), state)
        self.assertTrue(any("no: original homograph" in conflict for conflict in conflicts))


if __name__ == "__main__":
    unittest.main()
