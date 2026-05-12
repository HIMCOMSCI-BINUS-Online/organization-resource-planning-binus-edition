/**
 * Tests for permission logic (dal.ts hasPermission equivalent).
 * Verifies the role-based access control matrix without DB access.
 */
import { describe, it, expect } from "vitest";
import { ROLE_PERMISSIONS } from "@/app/lib/definitions";
import type { RoleName } from "@/app/lib/definitions";

function hasPermission(role: RoleName, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}

// ── Super Admin ───────────────────────────────────────────────────────────────

describe("Super Admin permissions", () => {
  const role: RoleName = "Super Admin";

  it("has access to everything via wildcard", () => {
    const allPerms = [
      "ledger:read", "ledger:write",
      "members:read", "members:write",
      "tasks:read", "tasks:write",
      "knowledge:read", "knowledge:write",
      "any:future:permission",
    ];
    allPerms.forEach((p) => expect(hasPermission(role, p)).toBe(true));
  });
});

// ── Treasurer ─────────────────────────────────────────────────────────────────

describe("Treasurer permissions", () => {
  const role: RoleName = "Treasurer";

  it("can read and write ledger", () => {
    expect(hasPermission(role, "ledger:read")).toBe(true);
    expect(hasPermission(role, "ledger:write")).toBe(true);
  });

  it("can read members", () => {
    expect(hasPermission(role, "members:read")).toBe(true);
  });

  it("cannot write members", () => {
    expect(hasPermission(role, "members:write")).toBe(false);
  });

  it("cannot write tasks", () => {
    expect(hasPermission(role, "tasks:write")).toBe(false);
  });
});

// ── Secretary ─────────────────────────────────────────────────────────────────

describe("Secretary permissions", () => {
  const role: RoleName = "Secretary";

  it("can read and write members", () => {
    expect(hasPermission(role, "members:read")).toBe(true);
    expect(hasPermission(role, "members:write")).toBe(true);
  });

  it("can read tasks but not write", () => {
    expect(hasPermission(role, "tasks:read")).toBe(true);
    expect(hasPermission(role, "tasks:write")).toBe(false);
  });

  it("can read and write knowledge", () => {
    expect(hasPermission(role, "knowledge:read")).toBe(true);
    expect(hasPermission(role, "knowledge:write")).toBe(true);
  });

  it("cannot access ledger", () => {
    expect(hasPermission(role, "ledger:read")).toBe(false);
    expect(hasPermission(role, "ledger:write")).toBe(false);
  });
});

// ── Instructor ────────────────────────────────────────────────────────────────

describe("Instructor permissions", () => {
  const role: RoleName = "Instructor";

  it("can read and write tasks", () => {
    expect(hasPermission(role, "tasks:read")).toBe(true);
    expect(hasPermission(role, "tasks:write")).toBe(true);
  });

  it("can read members and knowledge", () => {
    expect(hasPermission(role, "members:read")).toBe(true);
    expect(hasPermission(role, "knowledge:read")).toBe(true);
  });

  it("cannot write members", () => {
    expect(hasPermission(role, "members:write")).toBe(false);
  });

  it("cannot access ledger", () => {
    expect(hasPermission(role, "ledger:read")).toBe(false);
  });
});

// ── Member ────────────────────────────────────────────────────────────────────

describe("Member permissions", () => {
  const role: RoleName = "Member";

  it("has read-only access to members, tasks, knowledge", () => {
    expect(hasPermission(role, "members:read")).toBe(true);
    expect(hasPermission(role, "tasks:read")).toBe(true);
    expect(hasPermission(role, "knowledge:read")).toBe(true);
  });

  it("cannot write anything", () => {
    const writePerms = ["members:write", "tasks:write", "knowledge:write", "ledger:write", "ledger:read"];
    writePerms.forEach((p) => expect(hasPermission(role, p)).toBe(false));
  });
});

// ── Permission matrix consistency ─────────────────────────────────────────────

describe("Permission matrix consistency", () => {
  it("every role that has :write also has :read for the same resource", () => {
    const roles: RoleName[] = ["Super Admin", "Treasurer", "Secretary", "Instructor", "Member"];
    roles.forEach((role) => {
      if (ROLE_PERMISSIONS[role].includes("*")) return;
      const writePerms = ROLE_PERMISSIONS[role].filter((p) => p.endsWith(":write"));
      writePerms.forEach((wp) => {
        const readPerm = wp.replace(":write", ":read");
        expect(hasPermission(role, readPerm)).toBe(true);
      });
    });
  });
});
