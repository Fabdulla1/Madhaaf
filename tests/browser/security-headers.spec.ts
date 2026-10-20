import { expect, test } from "@playwright/test";

test("public and private routes send baseline browser security headers", async ({ request }) => {
  for (const path of ["/", "/login", "/family/tree", "/api/admin/overview"]) {
    const response = await request.get(path);
    expect(response.headers()["x-content-type-options"], path).toBe("nosniff");
    expect(response.headers()["x-frame-options"], path).toBe("DENY");
    expect(response.headers()["referrer-policy"], path).toBe("no-referrer");
    expect(response.headers()["content-security-policy"], path).toContain("frame-ancestors 'none'");
  }
});
