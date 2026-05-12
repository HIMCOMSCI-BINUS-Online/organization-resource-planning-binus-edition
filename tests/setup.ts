import { vi } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Set required env vars for all tests
process.env.SESSION_SECRET = "test-secret-key-that-is-long-enough-32chars";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://localhost:5432/orp_db?schema=public";
process.env.NEXT_PUBLIC_ORG_NAME = "Test Org";
