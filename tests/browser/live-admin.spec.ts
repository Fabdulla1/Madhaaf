import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("administrator can create, rename, readdress, and reset another administrator", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(8).toString("hex");
  const firstEmail = `kutchi-e2e-owner-${suffix}@example.com`;
  const secondEmail = `kutchi-e2e-editor-${suffix}@example.com`;
  const changedEmail = `kutchi-e2e-renamed-${suffix}@example.com`;
  const firstPassword = `First-${randomBytes(20).toString("hex")}`;
  const secondPassword = `Second-${randomBytes(20).toString("hex")}`;
  const changedPassword = `Changed-${randomBytes(20).toString("hex")}`;
  const userIds: string[] = [];

  try {
    const { data: initial, error: createError } = await manager.auth.admin.createUser({
      email: firstEmail, password: firstPassword, email_confirm: true,
      user_metadata: { display_name: "Temporary test owner" },
    });
    expect(createError).toBeNull();
    expect(initial.user).toBeTruthy();
    userIds.push(initial.user!.id);
    const { error: roleError } = await manager.from("app_users").insert({ user_id: initial.user!.id, role: "admin" });
    expect(roleError).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email address").fill(firstEmail);
    await page.locator("#password").fill(firstPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();

    const createForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Add administrator" }) });
    await createForm.getByLabel("Display name").fill("Temporary test editor");
    await createForm.getByLabel("Sign-in email").fill(secondEmail);
    await createForm.getByLabel("Temporary password").fill(secondPassword);
    await createForm.getByRole("button", { name: "Create user" }).click();
    await expect(page.getByText("Administrator created.", { exact: false })).toBeVisible();

    const { data: found } = await manager.auth.admin.listUsers({ page: 1, perPage: 100 });
    const second = found.users.find(user => user.email === secondEmail);
    expect(second).toBeTruthy();
    userIds.push(second!.id);
    const editor = page.locator("form").filter({ has: page.getByRole("heading", { name: "Temporary test editor" }) });
    await editor.getByLabel("Display name").fill("Renamed test editor");
    await editor.getByLabel("Sign-in email").fill(changedEmail);
    await editor.getByLabel("New password, if changing").fill(changedPassword);
    await editor.getByRole("button", { name: "Save user" }).click();
    await expect(page.getByRole("heading", { name: "Renamed test editor" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/login");
    await page.getByLabel("Email address").fill(changedEmail);
    await page.locator("#password").fill(changedPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const selfChangedPassword = `Self-${randomBytes(20).toString("hex")}`;
    await page.goto("/admin/settings");
    await page.getByLabel("New password", { exact: true }).fill(selfChangedPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Password updated.")).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/login");
    await page.getByLabel("Email address").fill(changedEmail);
    await page.locator("#password").fill(selfChangedPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  } finally {
    const { data: remaining } = await manager.auth.admin.listUsers({ page: 1, perPage: 100 });
    for (const user of remaining.users.filter(user => user.email?.includes(suffix))) {
      if (!userIds.includes(user.id)) userIds.push(user.id);
    }
    for (const id of userIds.reverse()) await manager.auth.admin.deleteUser(id);
  }
});
