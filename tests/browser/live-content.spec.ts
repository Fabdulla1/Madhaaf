import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("administrator can draft and publish a word, and open content editors", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(8).toString("hex");
  const email = `kutchi-e2e-content-${suffix}@example.com`;
  const password = `Test-${randomBytes(20).toString("hex")}`;
  const headword = `test-${suffix}`;
  let userId: string | undefined;
  let lexemeId: string | undefined;

  try {
    const { data: created, error: createError } = await manager.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    expect(createError).toBeNull();
    userId = created.user!.id;
    const { error: roleError } = await manager.from("app_users").insert({ user_id: userId, role: "admin" });
    expect(roleError).toBeNull();

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/history");
    await expect(page.getByRole("heading", { name: "History and culture", exact: true })).toBeVisible();
    await page.goto("/admin/history/new");
    await expect(page.getByLabel("Title")).toBeVisible();

    await page.goto("/admin/dictionary");
    await expect(page.getByRole("heading", { name: "Dictionary", exact: true })).toBeVisible();
    await page.goto("/admin/dictionary/new");
    await page.getByLabel("Headword").fill(headword);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Saved successfully.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/dictionary\/[a-f0-9-]{36}$/);
    lexemeId = page.url().split("/").at(-1);
    await page.reload();
    await expect(page.getByText(headword, { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Preferred", { exact: true })).toBeVisible();

    await page.getByLabel("English meaning").fill(`Test meaning ${suffix}`);
    await page.getByRole("button", { name: "Add meaning" }).click();
    await expect(page.getByText("Saved to this entry.")).toBeVisible();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Published successfully.")).toBeVisible();
    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Open published page" }).click();
    const published = await popup;
    await published.waitForLoadState();
    await expect(published.getByText(headword, { exact: true }).first()).toBeVisible();
  } finally {
    if (!lexemeId) {
      const { data: found } = await manager.from("lexemes").select("id").eq("headword", headword).maybeSingle();
      lexemeId = found?.id;
    }
    try {
      if (lexemeId) {
        const { error: unpublishError } = await manager.from("lexemes").update({ status: "draft" }).eq("id", lexemeId);
        expect(unpublishError).toBeNull();
        const { error: deleteError } = await manager.from("lexemes").delete().eq("id", lexemeId);
        expect(deleteError).toBeNull();
      }
    } finally {
      if (userId) await manager.auth.admin.deleteUser(userId);
    }
  }
});
