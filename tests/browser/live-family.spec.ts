import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());

test("a saved draft connection appears in the private family map", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY, "Requires a configured Supabase project");
  test.setTimeout(120_000);

  const manager = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = randomBytes(6).toString("hex");
  const email = `tree-check-${suffix}@example.com`;
  const password = `Check-${randomBytes(20).toString("hex")}`;
  const parentName = `Tree parent ${suffix}`;
  const childName = `Tree child ${suffix}`;
  let userId: string | undefined;
  const memberIds: string[] = [];
  let relationshipId: string | undefined;

  try {
    const created = await manager.auth.admin.createUser({ email, password, email_confirm: true });
    expect(created.error).toBeNull();
    userId = created.data.user!.id;
    const role = await manager.from("app_users").insert({ user_id: userId, role: "admin" });
    expect(role.error).toBeNull();

    for (const preferred_name of [parentName, childName]) {
      const inserted = await manager.from("family_members").insert({ preferred_name, status: "draft" }).select("id").single();
      expect(inserted.error).toBeNull();
      memberIds.push(inserted.data!.id);
    }
    const edge = await manager.from("family_relationships").insert({
      person_a_id: memberIds[0], person_b_id: memberIds[1], kind: "parent",
      parent_kind: "unknown", status: "draft",
    }).select("id").single();
    expect(edge.error).toBeNull();
    relationshipId = edge.data!.id;

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/family/tree");
    await expect(page.getByText(parentName, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(childName, { exact: true }).first()).toBeVisible();
    const edgePath = page.locator(`.react-flow__edge[data-id="${relationshipId}"] path`).first();
    await expect.poll(async () => (await edgePath.boundingBox())?.height ?? 0).toBeGreaterThan(20);
    await expect(edgePath).toBeInViewport();
  } finally {
    if (relationshipId) await manager.from("family_relationships").delete().eq("id", relationshipId);
    for (const id of memberIds.reverse()) await manager.from("family_members").delete().eq("id", id);
    if (userId) await manager.auth.admin.deleteUser(userId);
  }
});
