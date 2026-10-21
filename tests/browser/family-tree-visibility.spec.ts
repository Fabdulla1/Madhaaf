import { expect, test } from "@playwright/test";
import { familyTreePositions, relationshipsForTree } from "../../src/lib/family-tree";

test("private tree shows saved connections while public tree requires publication", () => {
  const relationships = [
    { id: "draft", status: "draft" },
    { id: "review", status: "review" },
    { id: "published", status: "published" },
    { id: "archived", status: "archived" },
  ];

  expect(relationshipsForTree(relationships, false).map(({ id }) => id)).toEqual([
    "draft", "review", "published",
  ]);
  expect(relationshipsForTree(relationships, true).map(({ id }) => id)).toEqual([
    "published",
  ]);
});

test("partnered parents with a shared child have stable map positions", () => {
  const positions = familyTreePositions(["mother", "father", "child"], [
    { person_a_id: "mother", person_b_id: "child", kind: "parent" },
    { person_a_id: "father", person_b_id: "child", kind: "parent" },
    { person_a_id: "mother", person_b_id: "father", kind: "partner" },
  ], { width: 238, height: 100 });

  expect(positions.size).toBe(3);
  expect(positions.get("mother")!.y).toBe(positions.get("father")!.y);
  expect(positions.get("child")!.y).toBeGreaterThan(positions.get("mother")!.y);
});
