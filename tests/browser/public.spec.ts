import { expect, test } from "@playwright/test";

test("public routes and responsive layouts", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Documenting Mombasa and Ethiopian Kutchi." })).toBeVisible();
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow, `home overflow at ${width}px`).toBe(false);
  }
  await page.goto("/dictionary");
  await expect(page.getByRole("heading", { name: "Words to carry forward." })).toBeVisible();
  await page.screenshot({ path: "test-results/dictionary-375.png", fullPage: true });
  await page.goto("/history");
  await expect(page.getByRole("heading", { name: "Stories, carefully told." })).toBeVisible();
  await page.screenshot({ path: "test-results/history-375.png", fullPage: true });
  await page.goto("/orthography");
  await expect(page.getByText(/draft 0\.3/i).first()).toBeVisible();
  await page.goto("/family");
  await expect(page.getByText(/private/i).first()).toBeVisible();
  await page.goto("/family/tree");
  await expect(page.getByRole("heading", { name: /family tree/i }).first()).toBeVisible();
  await page.goto("/login");
  await page.screenshot({ path: "test-results/login-375.png", fullPage: true });
});

test("admin data routes reject unauthenticated requests", async ({ request }) => {
  for (const path of ["/api/admin/tree", "/api/admin/members", "/api/admin/media", "/api/admin/users", "/api/admin/birthplaces", "/api/admin/locations", "/api/admin/duplicates?entity=people&q=Amina"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should not return private data`).not.toBe(200);
  }
  const response = await request.post("/api/admin/lexemes", { data: { headword: "unauthorized" } });
  expect(response.status()).not.toBe(201);
});

test("mobile navigation and links do not show decorative emoji or arrow symbols", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/", "/language", "/language/articles", "/dictionary", "/history"]) {
    await page.goto(route);
    const decorativeLinks = await page.locator("a > span[aria-hidden='true']").evaluateAll((nodes) =>
      nodes.filter((node) => /[↗↓☰]/u.test(node.textContent ?? "") && getComputedStyle(node).display !== "none")
        .map((node) => node.textContent));
    expect(decorativeLinks, `decorative link symbols on ${route}`).toEqual([]);
  }
  await expect(page.locator(".wordmark__symbol:visible").first()).toBeVisible();
  await expect(page.locator(".mobile-nav summary:visible").first()).not.toContainText("☰");
  await page.locator(".mobile-nav summary:visible").first().click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).first()).toBeVisible();
});
