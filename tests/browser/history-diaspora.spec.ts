import { expect, test } from "@playwright/test";

const slug = "kutchi-diaspora-kenya-ethiopia";
const articlePath = `/history/${slug}`;
const title = "Across the ocean: Kutchi histories in Kenya and Ethiopia";

test("history and diaspora category link to the published study", async ({ page }) => {
  for (const path of ["/history", "/history?category=diaspora", "/history?category=mombasa-community"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  await page.goto("/history?category=food-cultural-practices");
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  await page.goto("/history");
  await page.getByRole("link", { name: "Read the study and explore the map" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator('meta[name="author"]')).toHaveAttribute("content", "Farhan Abdulla");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://madhaaf.vercel.app${articlePath}`);
});

test("map periods, sources, playback and pause work", async ({ page }) => {
  await page.goto(articlePath);
  const periods = page.getByRole("group", { name: "Map periods" });
  const buttons = periods.getByRole("button");
  await expect(buttons).toHaveCount(4);
  await expect(buttons.nth(0)).toHaveAttribute("aria-pressed", "true");
  await page.locator(".diaspora-map").screenshot({ path: "test-results/diaspora-map-0.png" });
  await buttons.nth(2).click();
  await expect(page.locator(".diaspora-map__reading")).toContainText("Bombay to Aden");
  await expect(page.locator(".diaspora-map__reading")).toContainText("Kutch is among recorded origins");
  await page.locator(".diaspora-map").screenshot({ path: "test-results/diaspora-map-2.png" });
  await buttons.nth(3).click();
  await expect(page.locator(".diaspora-map__reading")).toContainText("not verified departure and arrival cities");
  await page.locator(".diaspora-map").screenshot({ path: "test-results/diaspora-map-3.png" });
  await page.getByRole("button", { name: "Play migration sequence" }).click();
  await expect(buttons.nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Pause sequence" })).toBeVisible();
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
  await page.getByRole("button", { name: "Pause sequence" }).click();
  await expect(page.locator(".diaspora-map__routes")).not.toHaveClass(/is-playing/);
  await buttons.nth(2).focus();
  await page.keyboard.press("Enter");
  await expect(buttons.nth(2)).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion keeps routes usable without playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(articlePath);
  await expect(page.getByRole("button", { name: "Play migration sequence" })).toBeDisabled();
  const buttons = page.getByRole("group", { name: "Map periods" }).getByRole("button");
  await buttons.nth(2).click();
  await expect(page.locator(".diaspora-map__reading")).toContainText("Bombay to Aden");
  await expect(page.locator(".diaspora-map__routes")).not.toHaveClass(/is-playing/);
});

test("references resolve, image files load and layouts fit mobile and desktop", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(articlePath);
    await expect(page.locator("#sources li")).toHaveCount(24);
    const invalidAnchors = await page.locator('.diaspora-study a[href^="#"]').evaluateAll((links) => links
      .map((link) => link.getAttribute("href")!.slice(1)).filter((id) => !document.getElementById(id)));
    expect(invalidAnchors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)).toBe(false);
    const images = page.locator(".diaspora-study img");
    await expect(images).toHaveCount(3);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await page.screenshot({ path: `test-results/diaspora-${width}.png`, fullPage: true });
  }
  await page.locator('a[aria-label="Source 6"]').first().click();
  await expect(page).toHaveURL(/#source-6$/);
  await expect(page.locator("#source-6")).toBeInViewport();
  expect(consoleErrors).toEqual([]);
});

test("article and complete map transcript remain readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(articlePath);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator("#sources li")).toHaveCount(24);
  await page.getByText("Read all map connections as text", { exact: true }).click();
  await expect(page.locator(".diaspora-transcript")).toContainText("Kenya to Britain");
  await context.close();
});
