import { expect, test } from "@playwright/test";

const researchDates = [
  ["what-ke-marks", "2026-03-12"],
  ["verbs-agreement-and-time", "2026-05-08"],
  ["nouns-gender-and-distance", "2026-07-02"],
  ["wanting-and-experiencers", "2026-09-14"],
  ["connecting-kutchi-clauses", "2026-10-19"],
  ["la-and-jo-beneficiary-and-possession", "2026-10-21"],
  ["negation-in-mombasa-kutchi", "2026-10-21"],
] as const;

test("About page states the research scope and credits founder and support", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: /Recording Mombasa and Ethiopian Kutchi/ })).toBeVisible();
  await expect(page.getByText(/Founder and researcher/)).toBeVisible();
  await expect(page.getByText(/academic research and documentation project/)).toBeVisible();
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

test("Research papers have accurately labeled dates and a linked author", async ({ page }) => {
  await page.goto("/language/articles");
  await expect(page.getByRole("link", { name: "By Farhan Abdulla" })).toHaveAttribute("href", "/about");
  const times = await page.locator(".research-tile__category time").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("datetime")));
  expect(times).toEqual(researchDates.map(([, date]) => date));
  for (const [slug, date] of researchDates) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator(".research-article__meta time")).toHaveAttribute("datetime", date);
    await expect(page.locator(".research-article__meta a[href='/about']")).toHaveText("Farhan Abdulla");
    await expect(page.locator(".research-article__lead")).not.toContainText(/my Kutchi|my research/i);
    await expect(page.getByText(/first appeared online in October 2026/)).toBeVisible();
  }
});

test("Writing and grammar guides present a research-focused voice", async ({ page }) => {
  await page.goto("/language/grammar");
  await expect(page.getByText(/This guide documents grammatical patterns in Mombasa and Ethiopian Kutchi/)).toBeVisible();
  await page.goto("/orthography");
  await expect(page.getByRole("heading", { name: "Working Latin orthography for East African Kutchi." })).toBeVisible();
});

test("About page has no horizontal overflow on mobile and tablet", async ({ page }) => {
  for (const width of [375, 768, 1024]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/about");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `About layout overflow at ${width}px`).toBeLessThanOrEqual(2);
    await expect(page.getByRole("heading", { name: /Recording Mombasa and Ethiopian Kutchi/ })).toBeVisible();
  }
});
