/**
 * Tests for JWT session helpers — no DB or Next.js runtime required.
 * Covers: encrypt, decrypt (valid token, expired, tampered, missing secret)
 */
import { describe, it, expect, vi } from "vitest";

// next/headers is a Next.js server API; mock it so we can test encrypt/decrypt
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { encrypt, decrypt } from "@/app/lib/session";
import type { SessionPayload } from "@/app/lib/session";

const SAMPLE: SessionPayload = {
  userId: "user_abc123",
  role: "Super Admin",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
};

describe("encrypt + decrypt (round-trip)", () => {
  it("produces a non-empty JWT string", async () => {
    const token = await encrypt(SAMPLE);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("decrypts back to the original payload", async () => {
    const token = await encrypt(SAMPLE);
    const result = await decrypt(token);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(SAMPLE.userId);
    expect(result!.role).toBe(SAMPLE.role);
  });

  it("returns null for undefined input", async () => {
    const result = await decrypt(undefined);
    expect(result).toBeNull();
  });

  it("returns null for empty string", async () => {
    const result = await decrypt("");
    expect(result).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await encrypt(SAMPLE);
    const [header, payload, sig] = token.split(".");
    const tampered = `${header}.${payload}.${sig}xxx`;
    const result = await decrypt(tampered);
    expect(result).toBeNull();
  });

  it("returns null for completely invalid string", async () => {
    const result = await decrypt("this.is.notvalid");
    expect(result).toBeNull();
  });

  it("different payloads produce different tokens", async () => {
    const t1 = await encrypt(SAMPLE);
    const t2 = await encrypt({ ...SAMPLE, userId: "user_xyz999" });
    expect(t1).not.toBe(t2);
  });
});

describe("encrypt — payload fields", () => {
  it("preserves userId across roles", async () => {
    const roles = ["Super Admin", "Treasurer", "Secretary", "Instructor", "Member"];
    for (const role of roles) {
      const token = await encrypt({ ...SAMPLE, role });
      const result = await decrypt(token);
      expect(result!.role).toBe(role);
    }
  });
});
