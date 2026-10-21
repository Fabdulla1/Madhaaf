"""Evidence and collision checks for the second Kutchi elicitation import."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import import_kutchi_grammar_evidence as importer


class GrammarEvidenceTest(unittest.TestCase):
    def test_full_attested_contrasts_and_no_generated_cross_combinations(self):
        payload = importer.evidence()
        sentences = {item["kutchi"] for item in payload["examples"]}
        self.assertIn("Au(n) hin chokro ke disa(n)tho", sentences)
        self.assertIn("Au(n) hee chokro disa(n)tho", sentences)
        self.assertNotIn("Au(n) hin chokro disa(n)tho", sentences)
        self.assertNotIn("Au(n) hee chokro ke disa(n)tho", sentences)
        self.assertIn("chokre ke kapetho", sentences)
        self.assertIn("chokro ke kapetho", sentences)
        self.assertIn("Mukhe hinee cheejeu(n) kape(n)thaa", sentences)
        self.assertIn("hoonee ke hin cheejeu(n) kape(n)theu(n)", sentences)
        self.assertIn("Au(n) hin kadho ke kya(n)tho", sentences)
        self.assertEqual(len(sentences), 49)

    def test_only_known_lemma_forms_are_attached(self):
        payload = importer.evidence()
        forms = {item["written_form"]: item for item in payload["forms"]}
        self.assertEqual(len(forms), 10)
        self.assertEqual(forms["chokra"]["grammatical_number"], "plural")
        self.assertEqual(forms["chokreu(n)"]["grammatical_number"], "plural")
        self.assertNotIn("grammatical_number", forms["ghare(n)"])
        self.assertNotIn("chokre", forms)
        self.assertNotIn("kape(n)thaa", forms)
        self.assertNotIn("kape(n)theu(n)", forms)
        self.assertNotIn("dhinose", forms)
        self.assertTrue(all(item.get("aspect") is None for item in forms.values()))
        self.assertFalse(next(x for x in payload["new_lexemes"]
                              if x["headword"] == "thadho")["publish"])

    def test_exact_meaning_conflict_is_held(self):
        payload = importer.evidence()
        existing = {
            "lexemes": [{"id": 1, "headword": "hin", "part_of_speech": None}],
            "spellings": [],
            "senses": [{"lexeme_id": 1, "gloss_en": "a different meaning"}],
        }
        plan = importer.build_plan(payload, existing)
        self.assertIn("hin: existing meaning differs; review required", plan["conflicts"])
        self.assertNotIn("hin", plan["existing_ids"])
        self.assertNotIn("hin", {item["headword"] for item in plan["new"]})

    def test_pun_homograph_is_explicitly_disambiguated(self):
        payload = importer.evidence()
        sentence = next(item for item in payload["examples"] if "pun khadho nai" in item["kutchi"])
        self.assertIn("pun|conjunction", sentence["links"])
        self.assertNotIn("pun", sentence["links"])


if __name__ == "__main__":
    unittest.main()
