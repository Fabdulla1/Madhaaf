import { expect, test } from "@playwright/test";

test("Language hub links to dictionary, grammar and writing guide", async ({ page }) => {
  await page.goto("/language");
  await expect(page.getByRole("heading", { name: "Studying Mombasa and Ethiopian Kutchi." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse the dictionary/i })).toHaveAttribute("href", "/dictionary");
  await expect(page.getByRole("link", { name: /Explore the grammar/i })).toHaveAttribute("href", "/language/grammar");
  await expect(page.getByRole("link", { name: /Read the writing guide/i })).toHaveAttribute("href", "/orthography");
});

test("Grammar shows attested inflections, uncertainties, and a table", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "How Kutchi sentences work." })).toBeVisible();
  await expect(page.getByText("Thu(n) khadho kye(n)thi", { exact: true })).toBeVisible();
  await expect(page.getByText("Hinee khadho kye(n)thaa", { exact: true })).toBeVisible();
  await expect(page.getByText("Mere kuroo kye(n)thaa?", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("What we still need to learn.")).toBeVisible();
});

test("Language pages remain navigable on narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/language");
  await expect(page.getByRole("heading", { name: "Explore the language" })).toBeVisible();
  await page.getByRole("link", { name: /Explore the grammar/i }).click();
  await expect(page).toHaveURL(/\/language\/grammar$/);
  await expect(page.getByRole("heading", { name: "How Kutchi sentences work." })).toBeVisible();
});

test("Grammar includes eight-verb survey, habitual reading, future and negation", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "A pattern across eight verbs." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The present, past and future." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Not doing, and not going to do." })).toBeVisible();
  await expect(page.getByText("Au(n) haroj suma(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("Nah vendhose", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /08 · Questions/i })).toHaveAttribute("href", "#questions");
});


test("Grammar presents speaker-attested verb-first, medial and final arrangements without imposing verb-final order", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "Word order is not always verb-final." })).toBeVisible();
  await expect(page.locator(".grammar-order-list li strong")).toHaveText([
    "Au(n) chada(n)tho hin ke",
    "Chada(n)tho au(n) hin ke",
    "hin ke au(n) chada(n)tho",
  ]);
  await expect(page.getByRole("heading", { name: "Verbs tend to come last." })).toHaveCount(0);
  await expect(page.getByText(/not which is\s+most frequent in ordinary conversation/)).toBeVisible();
});

test("Word-order comparison stays readable on a small viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/language/grammar#word-order");
  await expect(page.locator(".grammar-order-list li")).toHaveCount(3);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test("Grammar reference includes la/jo and the expanded negative evidence", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "La and jo connect people to things differently." })).toBeVisible();
  await expect(page.getByRole("link", { name: /10 · La and jo/ })).toHaveAttribute("href", "#postpositions");
  await expect(page.getByText("Hin la au(n) pe(n)sa kayose", { exact: true })).toBeVisible();
  await expect(page.getByText("Hin jo pe(n)sa au(n) kayose", { exact: true })).toBeVisible();
  await expect(page.getByText("Hee mukhe pe(n)sa nai dhine", { exact: true })).toBeVisible();
  await expect(page.getByText(/natho.*nathi.*nathaa/i).first()).toBeVisible();
});
