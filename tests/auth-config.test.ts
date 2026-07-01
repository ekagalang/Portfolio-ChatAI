import { describe, it, expect } from "vitest";
import { isAdminEmail } from "@/lib/auth.config";

// ADMIN_EMAILS = "admin@test.com, owner@test.com" via vitest.config.ts
describe("isAdminEmail", () => {
  it("mengenali email admin (case-insensitive & trim)", () => {
    expect(isAdminEmail("admin@test.com")).toBe(true);
    expect(isAdminEmail("ADMIN@Test.com")).toBe(true);
    expect(isAdminEmail("  owner@test.com ")).toBe(true);
  });

  it("menolak non-admin, null, & kosong", () => {
    expect(isAdminEmail("random@test.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });
});
