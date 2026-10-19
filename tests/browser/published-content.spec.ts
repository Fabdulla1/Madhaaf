import { expect, test } from "@playwright/test";

test("dictionary search separates exact punctuation from other matches", async ({ page }) => {
  await page.route("**/api/dictionary?**", async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get("q")).toBe("ku'la");
    await route.fulfill({ json: {
      data: [
        { id: "11111111-1111-4111-8111-111111111111", headword: "ku'la", word_forms: [{ id: "f1", spelling: "ku'la", is_preferred: true }], senses: [{ id: "s1", gloss_en: "Why" }] },
        { id: "22222222-2222-4222-8222-222222222222", headword: "kul", word_forms: [], senses: [{ id: "s2", gloss_en: "Related test match" }] },
      ],
      pagination: { page: 1, limit: 24, total: 2, hasMore: false },
    } });
  });
  await page.goto("/dictionary?q=ku%27la");
  await expect(page.getByRole("heading", { name: "Exact spelling" })).toBeVisible();
  await expect(page.getByRole("link", { name: /ku'la.*Why/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /kul.*Related test match/ })).toBeVisible();
});

test("article citations render while private Markdown links stay inactive", async ({ page }) => {
  await page.route("**/api/history/test-article", async (route) => {
    await route.fulfill({ json: { data: {
      id: "33333333-3333-4333-8333-333333333333",
      slug: "test-article",
      title: "Test article",
      body_markdown: "A test paragraph with a [private link](/family/tree) and a [dictionary link](/dictionary).",
      sources: [{ id: "source-1", title: "Test source", citation: "Test citation", url: "https://example.org/source" }],
      categories: [],
      media: [],
    } } });
  });
  await page.goto("/history/test-article");
  await expect(page.getByRole("heading", { name: "Test article" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.getByText("Test citation")).toBeVisible();
  await expect(page.getByRole("link", { name: "dictionary link" })).toHaveAttribute("href", "/dictionary");
  await expect(page.getByRole("link", { name: "private link" })).toHaveCount(0);
});
