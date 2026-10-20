import { expect, test } from "@playwright/test";

test("public routes and responsive layouts", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "What we carry, we can keep." })).toBeVisible();
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
  for (const path of ["/api/admin/tree", "/api/admin/members", "/api/admin/media", "/api/admin/users"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should not return private data`).not.toBe(200);
  }
  const response = await request.post("/api/admin/lexemes", { data: { headword: "unauthorized" } });
  expect(response.status()).not.toBe(201);
});
