import { expect, test } from "@playwright/test";

const studies = [
  "what-ke-marks",
  "verbs-agreement-and-time",
  "nouns-gender-and-distance",
  "wanting-and-experiencers",
  "connecting-kutchi-clauses",
] as const;

test("research library displays five illustrated, navigable studies", async ({ page }) => {
  await page.goto("/language/articles");
  await expect(page.getByRole("heading", { name: "What the sentences are teaching us." })).toBeVisible();
  const tiles = page.locator(".research-tile");
  await expect(tiles).toHaveCount(5);
  for (const slug of studies) {
    await expect(tiles.locator(`a[href="/language/articles/${slug}"]`).first()).toBeVisible();
  }
  await expect(page.locator(".research-tile img")).toHaveCount(5);
});

test("ke study preserves the critical paired construction and links terms to the dictionary", async ({ page }) => {
  await page.goto("/language/articles/what-ke-marks");
  await expect(page.getByRole("heading", { level: 1, name: /What does ke mark/ })).toBeVisible();
  await expect(page.getByText("Au(n) hin chokro ke disa(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("Au(n) hee chokro disa(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("chokre ke kapetho", { exact: true })).toBeVisible();
  await expect(page.getByText("chokro ke kapetho", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/dictionary?q=ke"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "How this article was prepared" })).toBeVisible();
});

test("each article has source context, original illustration and vocabulary links", async ({ page, request }) => {
  for (const slug of studies) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator("article.research-article h1")).toBeVisible();
    await expect(page.locator("article.research-article > figure img")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Words in this study" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this article was prepared" })).toBeVisible();
    await expect(page.locator(".research-wordnotes a[href^='/dictionary?q=']").first()).toBeVisible();
    const path = await page.locator("article.research-article > figure img").getAttribute("src");
    expect(path).toBeTruthy();
    const response = await request.get(path!);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
  }
});

test("research articles can be reached from Language and Grammar", async ({ page }) => {
  await page.goto("/language");
  await page.getByRole("link", { name: /Browse research articles/i }).click();
  await expect(page).toHaveURL(/\/language\/articles$/);
  await page.goto("/language/grammar");
  await expect(page.getByRole("link", { name: "Read the research articles" })).toHaveAttribute("href", "/language/articles");
});

test("unknown article slug returns not found", async ({ page }) => {
  const response = await page.goto("/language/articles/not-a-real-study");
  expect(response?.status()).toBe(404);
});

test("research articles have no horizontal page overflow on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const slug of studies) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator("article.research-article h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal page overflow for ${slug}`).toBeLessThanOrEqual(1);
  }
});
