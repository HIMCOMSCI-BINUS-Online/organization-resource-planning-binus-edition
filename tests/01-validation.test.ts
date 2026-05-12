/**
 * Tests for schema validation (Zod) — no DB or network required.
 * Covers: LoginSchema, OnboardingSchema, ROLES, ROLE_PERMISSIONS
 */
import { describe, it, expect } from "vitest";
import { LoginSchema, OnboardingSchema, ROLES, ROLE_PERMISSIONS } from "@/app/lib/definitions";

// ── LoginSchema ───────────────────────────────────────────────────────────────

describe("LoginSchema", () => {
  it("passes with valid email and password", () => {
    const result = LoginSchema.safeParse({ email: "user@org.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("fails with invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toBeDefined();
  });

  it("fails with empty password", () => {
    const result = LoginSchema.safeParse({ email: "user@org.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("fails when both fields are empty", () => {
    const result = LoginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});

// ── OnboardingSchema ──────────────────────────────────────────────────────────

describe("OnboardingSchema", () => {
  const valid = {
    memberId: "MBR001",
    name: "John Doe",
    email: "john@org.com",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("passes with valid complete data", () => {
    expect(OnboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when memberId is too short", () => {
    const result = OnboardingSchema.safeParse({ ...valid, memberId: "X" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.memberId).toBeDefined();
  });

  it("fails when name is too short", () => {
    const result = OnboardingSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toBeDefined();
  });

  it("fails when password has no number", () => {
    const result = OnboardingSchema.safeParse({ ...valid, password: "PasswordOnly", confirmPassword: "PasswordOnly" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("fails when password has no letter", () => {
    const result = OnboardingSchema.safeParse({ ...valid, password: "12345678", confirmPassword: "12345678" });
    expect(result.success).toBe(false);
  });

  it("fails when password is under 8 chars", () => {
    const result = OnboardingSchema.safeParse({ ...valid, password: "Ab1", confirmPassword: "Ab1" });
    expect(result.success).toBe(false);
  });

  it("fails when passwords do not match", () => {
    const result = OnboardingSchema.safeParse({ ...valid, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined();
  });

  it("fails with invalid email format", () => {
    const result = OnboardingSchema.safeParse({ ...valid, email: "bad-email" });
    expect(result.success).toBe(false);
  });
});

// ── ROLES & ROLE_PERMISSIONS ──────────────────────────────────────────────────

describe("ROLES constants", () => {
  it("defines all 5 roles", () => {
    expect(Object.keys(ROLES)).toHaveLength(5);
    expect(ROLES.SUPER_ADMIN).toBe("Super Admin");
    expect(ROLES.TREASURER).toBe("Treasurer");
    expect(ROLES.SECRETARY).toBe("Secretary");
    expect(ROLES.INSTRUCTOR).toBe("Instructor");
    expect(ROLES.MEMBER).toBe("Member");
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("Super Admin has wildcard permission", () => {
    expect(ROLE_PERMISSIONS["Super Admin"]).toContain("*");
  });

  it("Treasurer has ledger permissions", () => {
    const perms = ROLE_PERMISSIONS["Treasurer"];
    expect(perms).toContain("ledger:read");
    expect(perms).toContain("ledger:write");
  });

  it("Member has read-only permissions", () => {
    const perms = ROLE_PERMISSIONS["Member"];
    expect(perms.every((p) => p.endsWith(":read"))).toBe(true);
  });

  it("all roles have at least one permission", () => {
    Object.values(ROLE_PERMISSIONS).forEach((perms) => {
      expect(perms.length).toBeGreaterThan(0);
    });
  });
});
