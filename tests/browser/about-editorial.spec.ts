import { expect, test } from "@playwright/test";

const researchDates = [
  ["what-ke-marks", "2026-03-12"],
  ["verbs-agreement-and-time", "2026-05-08"],
  ["nouns-gender-and-distance", "2026-07-02"],
  ["wanting-and-experiencers", "2026-09-14"],
  ["connecting-kutchi-clauses", "2026-10-19"],
] as const;

test("About page credits Farhan, his East African Kutchi mission, and TokenWorks", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: /I built Madhaaf because/ })).toBeVisible();
  await expect(page.getByText(/My name is Farhan Abdulla/)).toBeVisible();
  await expect(page.getByText(/Kutchi is my native tongue/)).toBeVisible();
  await expect(page.getByText(/Kenya and Ethiopia/).first()).toBeVisible();
  await expect(page.getByText(/Adam Anderson/)).toBeVisible();
  await expect(page.getByText(/TokenWorks LLC/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Visit TokenWorks/i })).toHaveAttribute("href", "https://www.tokenworks.ai/");
  await expect(page.locator(".about-hero__art img")).toBeVisible();
});

test("About can be reached from global navigation and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  await expect(page.getByRole("navigation", { name: "Footer navigation" })
    .getByRole("link", { name: "About Madhaaf" })).toHaveAttribute("href", "/about");
  await page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("Research papers have distinct, transparently labeled dates and a linked author", async ({ page }) => {
  await page.goto("/language/articles");
  await expect(page.getByRole("link", { name: "By Farhan Abdulla" })).toHaveAttribute("href", "/about");
  const times = await page.locator(".research-tile__category time").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("datetime")));
  expect(times).toEqual(researchDates.map(([, date]) => date));
  for (const [slug, date] of researchDates) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator(".research-article__meta time")).toHaveAttribute("datetime", date);
    await expect(page.locator(".research-article__meta a[href='/about']")).toHaveText("Farhan Abdulla");
    await expect(page.locator(".research-article__lead")).toContainText("I ");
    await expect(page.getByText(/first appeared online in October 2026/)).toBeVisible();
  }
});

test("Writing and grammar guides reflect the founder's first-person editorial voice", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByText(/I am trying to document how my Mombasa Kutchi works/)).toBeVisible();
  await page.goto("/orthography");
  await expect(page.getByRole("heading", { name: "How I am learning to write our Kutchi." })).toBeVisible();
});

test("About page has no horizontal overflow on mobile and tablet", async ({ page }) => {
  for (const width of [375, 768, 1024]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/about");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `About layout overflow at ${width}px`).toBeLessThanOrEqual(2);
    await expect(page.getByRole("heading", { name: /I built Madhaaf because/ })).toBeVisible();
  }
});
