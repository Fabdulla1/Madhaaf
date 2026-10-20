import { expect, test } from "@playwright/test";

const publishedTree = {
  data: {
    enabled: true,
    members: [
      { id: "11111111-1111-4111-8111-111111111111", preferred_name: "Amina", birth_date_text: "1930s", death_date_text: "2001", short_bio: "An archive member." },
      { id: "22222222-2222-4222-8222-222222222222", preferred_name: "Hassan", birth_date_text: "1950s", death_date_text: "2010", short_bio: "A second member." },
    ],
    relationships: [
      { id: "33333333-3333-4333-8333-333333333333", person_a_id: "11111111-1111-4111-8111-111111111111", person_b_id: "22222222-2222-4222-8222-222222222222", kind: "parent", parent_kind: "biological", confidence: "confirmed" },
    ],
  },
};

test("public family tree shows reviewed people without admin controls", async ({ page }) => {
  await page.route("**/api/family/tree", route => route.fulfill({ json: publishedTree }));
  await page.goto("/family/tree?view=public");
  await expect(page.getByRole("heading", { name: "Our family tree" })).toBeVisible();
  await expect(page.getByText("Amina", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Hassan", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  await expect.poll(async () => (await page.locator(".react-flow__edge-path").boundingBox())?.height ?? 0).toBeGreaterThan(20);
  await expect(page.locator(".react-flow__edge-path")).toBeInViewport();
  await page.screenshot({ path: "test-results/family-tree-desktop.png", fullPage: true });
  await expect(page.getByRole("link", { name: "Manage people" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Full profile" })).toHaveCount(0);

  await page.getByRole("button", { name: "List" }).click();
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await page.getByRole("button", { name: "Amina" }).click();
  await expect(page.getByRole("heading", { name: "Direct connections" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Child: Hassan/ })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 850 });
  await page.screenshot({ path: "test-results/family-tree-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)).toBe(false);
});

test("public family tree has a safe empty state when sharing is off", async ({ page }) => {
  await page.route("**/api/family/tree", route => route.fulfill({ json: { data: { enabled: false, members: [], relationships: [] } } }));
  await page.goto("/family/tree?view=public");
  await expect(page.getByText("The family tree is being prepared.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Add first person" })).toHaveCount(0);
});
