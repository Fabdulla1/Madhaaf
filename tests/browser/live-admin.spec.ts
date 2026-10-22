import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("a new administrator changes their temporary password and cannot manage users", async ({ page }) => {
  test.skip(process.env.MADHAAF_E2E_STAGING !== "1" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY,
    "Account writes are allowed only against an explicitly configured staging project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `kutchi-e2e-editor-${randomBytes(8).toString("hex")}@example.com`;
  const temporaryPassword = `Temporary-${randomBytes(20).toString("hex")}`;
  const ownPassword = `Personal-${randomBytes(20).toString("hex")}`;
  let userId: string | undefined;

  try {
    const { data, error: createError } = await manager.auth.admin.createUser({
      email, password: temporaryPassword, email_confirm: true,
      user_metadata: { display_name: "Temporary editor" },
    });
    expect(createError).toBeNull();
    userId = data.user!.id;
    const { error: roleError } = await manager.from("app_users").insert({
      user_id: userId, role: "admin", must_change_password: true,
    });
    expect(roleError).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(temporaryPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin\/account\/setup$/);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/account\/setup$/);
    await page.getByLabel("Temporary password").fill(temporaryPassword);
    await page.getByLabel("New password", { exact: true }).fill(ownPassword);
    await page.getByLabel("Confirm new password").fill(ownPassword);
    await page.getByRole("button", { name: "Save password and continue" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);

    const result = await page.evaluate(async () => {
      const response = await fetch("/api/admin/users");
      return { status: response.status, body: await response.json() };
    });
    expect(result.status).toBe(403);
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users", exact: true })).toHaveCount(0);
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  } finally {
    if (userId) await manager.auth.admin.deleteUser(userId);
  }
});
