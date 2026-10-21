import sys
import unittest
from pathlib import Path
from uuid import UUID

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from import_family_connections import plan_import, sheet_graph


class FamilyConnectionsImportTests(unittest.TestCase):
    def test_reciprocal_siblings_and_spouses_are_one_edge_each(self):
        rows = [
            {"Person": "First", "Sibling": "Second", "Father": "", "Mother": "",
             "Wife": "Partner", "Husband": "", "Children": "Child"},
            {"Person": "Second", "Sibling": "First", "Father": "", "Mother": "",
             "Wife": "", "Husband": "", "Children": ""},
            {"Person": "Partner", "Sibling": "", "Father": "", "Mother": "",
             "Wife": "", "Husband": "First", "Children": "Child"},
        ]
        names, edges = sheet_graph(rows, {})
        self.assertEqual(len(names), 4)
        self.assertEqual(len(edges), 4)
        self.assertEqual({kind for kind, *_ in edges}, {"parent", "partner", "sibling"})

    def test_alias_reuses_existing_member_and_second_plan_is_empty(self):
        rows = [{"Person": "Alternate Name", "Sibling": "", "Father": "",
                 "Mother": "", "Wife": "", "Husband": "", "Children": "Child"}]
        aliases = {"alternate name": "Existing Name"}
        names, edges = sheet_graph(rows, aliases)
        existing_id = UUID("00000000-0000-4000-8000-000000000001")
        child_id = UUID("00000000-0000-4000-8000-000000000002")
        people = [{"id": existing_id, "preferred_name": "Existing Name", "status": "published"},
                  {"id": child_id, "preferred_name": "Child", "status": "draft"}]
        plan = plan_import(names, edges, people, [], aliases)
        self.assertEqual(plan["new_people"], {})
        self.assertEqual(len(plan["new_edges"]), 1)
        existing_edge = [{"person_a_id": existing_id, "person_b_id": child_id,
                          "kind": "parent", "status": "draft"}]
        second = plan_import(names, edges, people, existing_edge, aliases)
        self.assertEqual(second["new_people"], {})
        self.assertEqual(second["new_edges"], [])

    def test_alias_must_resolve_to_one_existing_profile(self):
        names, edges = sheet_graph([{"Person": "Alias", "Sibling": "", "Father": "",
                                    "Mother": "", "Wife": "", "Husband": "", "Children": ""}],
                                  {"alias": "Unknown target"})
        with self.assertRaisesRegex(RuntimeError, "does not name exactly one"):
            plan_import(names, edges, [], [], {"alias": "Unknown target"})


if __name__ == "__main__":
    unittest.main()
