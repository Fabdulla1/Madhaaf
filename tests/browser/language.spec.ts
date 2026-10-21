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
  await page.getByText("Browse 17 grammar chapters").click();
  await page.getByRole("navigation", { name: "Grammar chapters" }).getByRole("link", { name: /Case marking/ }).click();
  await expect(page).toHaveURL(/#case-marking$/);
  await expect(page.getByRole("heading", { name: "The environments of ke." })).toBeVisible();
  await page.getByRole("link", { name: "↑ Chapters" }).click();
  await expect(page).toHaveURL(/#grammar-chapters$/);
  await expect(page.getByText("Browse 17 grammar chapters")).toBeInViewport();
  await expect(page.locator("#nouns").getByText(/These recorded noun forms may be plural or contextual/)).toBeVisible();
  await expect(page.locator("#nouns").getByRole("table", { name: /Attested noun forms/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("Grammar includes eight-verb survey, habitual reading, future and negation", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByRole("heading", { name: "A pattern across eight verbs." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The present, past and future." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Not doing, and not going to do." })).toBeVisible();
  await expect(page.getByText("Au(n) haroj suma(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("Nah vendhose", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: /Questions/i })).toHaveAttribute("href", "#questions");
});

test("Grammar preserves complete ke judgments and labels hypotheses", async ({ page }) => {
  await page.goto("/language/grammar");
  const caseSection = page.locator("#case-marking");
  await expect(caseSection.getByText("Au(n) hin chokro ke disa(n)tho", { exact: true })).toBeVisible();
  await expect(caseSection.getByText("Au(n) hee chokro disa(n)tho", { exact: true })).toBeVisible();
  await expect(caseSection.getByText("chokre ke kapetho", { exact: true })).toBeVisible();
  await expect(caseSection.getByText("chokro ke kapetho", { exact: true })).toBeVisible();
  await expect(caseSection.getByText(/Hypothesis · demonstrative form may reflect case/)).toBeVisible();
  await expect(caseSection.getByText(/mixed combinations have not been confirmed/)).toBeVisible();
  await expect(caseSection.getByRole("link", { name: /Search dictionary for “ke”/ }).last()).toHaveAttribute("href", "/dictionary?q=ke");
});

test("New grammar chapters retain forms, explicit uncertainty, and accessible tables", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.locator("#nouns").getByText("Chokreu(n) sume(n)thaa", { exact: true })).toBeVisible();
  await expect(page.locator("#adjectives").getByText("Hee bhairee thadhee ai", { exact: true })).toBeVisible();
  await expect(page.locator("#desire").getByText("hoonee ke hin cheejeu(n) kape(n)theu(n)", { exact: true })).toBeVisible();
  await expect(page.locator("#desire").getByText(/do not establish a universal infinitive/)).toBeVisible();
  await expect(page.locator("#negation").getByText("Nathi sume", { exact: true })).toBeVisible();
  await expect(page.locator("#complex-sentences").getByText("savare varsaath pondhi, tha poi au(n) ghare rondhose", { exact: true })).toBeVisible();
  await expect(page.locator("#demonstratives").getByRole("table", { name: /Recorded proximal and distal forms/ })).toBeVisible();
  await expect(page.locator("#nouns").getByRole("table", { name: /Attested noun forms/ })).toBeVisible();
  await expect(page.locator("#complex-sentences").getByRole("table", { name: /Recorded meanings/ })).toBeVisible();
});
