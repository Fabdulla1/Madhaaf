import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("family editor clears after save and publish while suggestions survive backspacing", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(6).toString("hex");
  const email = `family-editor-${suffix}@example.com`;
  const password = `Check-${randomBytes(20).toString("hex")}`;
  const existingName = `Suggested person ${suffix}`;
  const draftName = `Draft person ${suffix}`;
  const publishedName = `Published person ${suffix}`;
  let userId: string | undefined;
  const memberIds: string[] = [];

  try {
    const created = await manager.auth.admin.createUser({ email, password, email_confirm: true });
    expect(created.error).toBeNull();
    userId = created.data.user!.id;
    const role = await manager.from("app_users").insert({ user_id: userId, role: "admin" });
    expect(role.error).toBeNull();
    const existing = await manager.from("family_members").insert({ preferred_name: existingName, status: "draft" }).select("id").single();
    expect(existing.error).toBeNull();
    memberIds.push(existing.data!.id);

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/family-members/new");

    const name = page.locator("#preferred_name");
    await name.fill(existingName);
    await expect(page.getByRole("list", { name: "Similar people" }).getByText(existingName)).toBeVisible();
    await name.fill("");
    await expect(page.getByRole("list", { name: "Similar people" }).getByText(existingName)).toBeVisible();
    await expect(page.getByText("Previous suggestions. Type another name to update them.")).toBeVisible();

    const birthplace = page.locator("#birthplace");
    await birthplace.fill("Nairobi");
    await expect.poll(async () => page.getByRole("listbox", { name: "Place suggestions" }).getByRole("option").count()).toBeGreaterThan(0);
    await birthplace.fill("Nai");
    await expect(page.getByRole("listbox", { name: "Place suggestions" }).getByRole("option").first()).toBeVisible();
    await birthplace.fill("");
    await expect(page.getByRole("listbox", { name: "Place suggestions" }).getByRole("option").first()).toBeVisible();

    await name.fill(draftName);
    await page.locator("#birth_date_text").selectOption("year");
    await page.locator("#birth_date_text-year").fill("1885");
    await birthplace.fill("Nairobi");
    await page.locator("#short_bio").fill("Temporary editor test profile");
    await page.getByRole("button", { name: "Save draft" }).click();
    const draftLink = page.getByRole("link", { name: `Open ${draftName}'s profile` });
    await expect(draftLink).toBeVisible();
    memberIds.push((await draftLink.getAttribute("href"))!.split("/").pop()!);
    await expect(page).toHaveURL(/\/admin\/family-members\/new$/);
    await expect(name).toHaveValue("");
    await expect(birthplace).toHaveValue("");
    await expect(page.locator("#birth_date_text")).toHaveValue("unknown");
    await expect(page.locator("#short_bio")).toHaveValue("");
    await expect(page.locator("#visibility")).toHaveValue("private");

    await name.fill(publishedName);
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    const publishedLink = page.getByRole("link", { name: `Open ${publishedName}'s profile` });
    await expect(publishedLink).toBeVisible();
    memberIds.push((await publishedLink.getAttribute("href"))!.split("/").pop()!);
    await expect(page).toHaveURL(/\/admin\/family-members\/new$/);
    await expect(name).toHaveValue("");
  } finally {
    for (const id of memberIds.reverse()) await manager.from("family_members").delete().eq("id", id);
    if (userId) await manager.auth.admin.deleteUser(userId);
  }
});
