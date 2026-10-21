import { expect, test } from "@playwright/test";

test("Language hub links to dictionary, grammar and writing guide", async ({ page }) => {
  await page.goto("/language");
  await expect(page.getByRole("heading", { name: "A language in words, patterns and voices." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse the dictionary/i })).toHaveAttribute("href", "/dictionary");
  await expect(page.getByRole("link", { name: /Explore the grammar/i })).toHaveAttribute("href", "/language/grammar");
  await expect(page.getByRole("link", { name: /Read the writing guide/i })).toHaveAttribute("href", "/orthography");
});

test("Grammar shows attested inflections, uncertainties, and a table", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "How Kutchi sentences work." })).toBeVisible();
  await expect(page.getByText("Thu(n) khadho kyenthi", { exact: true })).toBeVisible();
  await expect(page.getByText("Hinee khadho kyenthaa", { exact: true })).toBeVisible();
  await expect(page.getByText("Mere kuroo kyenthaa?", { exact: false }).first()).toBeVisible();
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
