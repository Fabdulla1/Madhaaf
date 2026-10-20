import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("draft queue and private profile include records beyond the first page", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(8).toString("hex");
  const email = `madhaaf-pagination-${suffix}@example.com`;
  const password = `Test-${randomBytes(20).toString("hex")}`;
  const personId = "11111111-1111-4111-8111-111111111111";
  const relativeId = "22222222-2222-4222-8222-222222222222";
  let userId: string | undefined;

  try {
    const { data: created, error: createError } = await manager.auth.admin.createUser({ email, password, email_confirm: true });
    expect(createError).toBeNull();
    userId = created.user!.id;
    const { error: roleError } = await manager.from("app_users").insert({ user_id: userId, role: "admin" });
    expect(roleError).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const adminApiPattern = "**/api/admin/*";
    await page.route(adminApiPattern, route => {
      const url = new URL(route.request().url());
      const resource = url.pathname.split("/").at(-1);
      const status = url.searchParams.get("status");
      const pageNumber = Number(url.searchParams.get("page"));
      const data = resource === "members" && status === "draft"
        ? [{ id: pageNumber === 1 ? personId : relativeId, preferred_name: pageNumber === 1 ? "First draft" : "Later draft", status: "draft" }]
        : resource === "members" && status === "review"
          ? [{ id: "33333333-3333-4333-8333-333333333333", preferred_name: "In review", status: "review" }]
          : [];
      return route.fulfill({ json: { data, pagination: { hasMore: resource === "members" && status === "draft" && pageNumber === 1 } } });
    });
    await page.goto("/admin/drafts");
    await expect(page.getByRole("heading", { name: "Drafts and publishing" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Later draft/ })).toBeVisible();
    await expect(page.getByText("3 awaiting publication")).toBeVisible();
    await page.unroute(adminApiPattern);

    await page.route("**/api/admin/tree*", route => {
      const pageNumber = Number(new URL(route.request().url()).searchParams.get("memberPage"));
      return route.fulfill({ json: { data: {
        members: pageNumber === 1
          ? [{ id: personId, preferred_name: "First person", living_status: "deceased", status: "published" }]
          : [{ id: relativeId, preferred_name: "Later relative", living_status: "deceased", status: "draft" }],
        relationships: pageNumber === 1 ? [] : [{ id: "44444444-4444-4444-8444-444444444444", person_a_id: personId, person_b_id: relativeId, kind: "parent", parent_kind: "unknown", confidence: "confirmed", status: "draft" }],
        pagination: { members: { hasMore: pageNumber === 1 }, relationships: { hasMore: pageNumber === 1 } },
      } } });
    });
    await page.route(`**/api/admin/members/${personId}`, route => route.fulfill({ json: { data: { id: personId, preferred_name: "First person", living_status: "deceased", status: "published" } } }));
    await page.route("**/api/admin/links?*", route => route.fulfill({ json: { data: [] } }));
    await page.goto(`/family/${personId}`);
    await expect(page.getByRole("heading", { name: "Family connections" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Later relative" })).toBeVisible();
    await expect(page.getByText(/confirmed · draft/)).toBeVisible();
  } finally {
    if (userId) await manager.auth.admin.deleteUser(userId);
  }
});
