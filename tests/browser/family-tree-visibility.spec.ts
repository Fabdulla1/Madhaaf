import { expect, test } from "@playwright/test";
import { relationshipsForTree } from "../../src/lib/family-tree";

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
