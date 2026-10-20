import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("a saved child can lead the next family connection", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(6).toString("hex");
  const email = `relationship-editor-${suffix}@example.com`;
  const password = `Check-${randomBytes(20).toString("hex")}`;
  const names = ["Grandparent", "Parent", "Child", "Next child", "Unrelated partner"].map(label => `${label} ${suffix}`);
  let userId: string | undefined;
  const memberIds: string[] = [];

  async function choosePerson(label: "Parent" | "Child" | "First partner" | "Second partner", name: string) {
    await page.getByRole("combobox", { name: label, exact: true }).fill(name);
    await page.getByRole("listbox", { name: `${label} suggestions` }).getByRole("option").filter({ hasText: name }).click();
    await expect(page.getByRole("combobox", { name: label, exact: true })).toHaveValue(name);
  }

  try {
    const created = await manager.auth.admin.createUser({ email, password, email_confirm: true });
    expect(created.error).toBeNull();
    userId = created.data.user!.id;
    const role = await manager.from("app_users").insert({ user_id: userId, role: "admin" });
    expect(role.error).toBeNull();
    for (const preferred_name of [names[0], names[1], names[2], names[4]]) {
      const person = await manager.from("family_members").insert({ preferred_name, status: "draft" }).select("id").single();
      expect(person.error).toBeNull();
      memberIds.push(person.data!.id);
    }

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/family-relationships");

    await choosePerson("Parent", names[0]);
    await choosePerson("Child", names[1]);
    await page.getByRole("button", { name: "Save relationship" }).click();
    await expect(page.getByRole("combobox", { name: "Parent", exact: true })).toHaveValue(names[1]);
    await expect(page.getByRole("combobox", { name: "Child", exact: true })).toHaveValue("");

    await choosePerson("Child", names[2]);
    await page.getByRole("button", { name: "Save relationship" }).click();
    await expect(page.getByRole("combobox", { name: "Parent", exact: true })).toHaveValue(names[2]);
    await expect(page.getByRole("combobox", { name: "Child", exact: true })).toHaveValue("");

    await page.getByRole("checkbox", { name: "Create a new profile for one person" }).check();
    await page.getByRole("textbox", { name: "New person's preferred name" }).fill(names[3]);
    await page.getByRole("button", { name: "Save person and relationship" }).click();
    await expect(page.getByRole("combobox", { name: "Parent", exact: true })).toHaveValue(names[3]);
    await expect(page.getByRole("combobox", { name: "Child", exact: true })).toHaveValue("");

    await page.getByRole("combobox", { name: "Relationship" }).selectOption("partner");
    await choosePerson("Second partner", names[4]);
    await page.getByRole("button", { name: "Save relationship" }).click();
    await expect(page.getByRole("combobox", { name: "First partner", exact: true })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Second partner", exact: true })).toHaveValue("");
  } finally {
    const created = await manager.from("family_members").select("id").eq("preferred_name", names[3]).maybeSingle();
    if (created.data) memberIds.push(created.data.id);
    if (memberIds.length) {
      const relationships = await manager.from("family_relationships").select("id").in("person_a_id", memberIds);
      for (const edge of relationships.data ?? []) await manager.from("family_relationships").delete().eq("id", edge.id);
    }
    for (const id of memberIds.reverse()) await manager.from("family_members").delete().eq("id", id);
    if (userId) await manager.auth.admin.deleteUser(userId);
  }
});
