/**
 * Integration tests against the real local database.
 * Requires: DATABASE_URL pointing to a running PostgreSQL instance.
 *
 * Each test suite cleans up after itself using transactions or explicit deletes
 * so the DB stays in a predictable state between runs.
 *
 * Run: npm run test:db
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ── Test DB client (direct, no serverless max:1 limit) ────────────────────────

function createTestClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const db = createTestClient();

// ── Shared test data ──────────────────────────────────────────────────────────

let roleId: string;
let userId: string;

beforeAll(async () => {
  // Ensure a test role exists
  const role = await db.role.upsert({
    where: { name: "__test_member__" },
    create: { name: "__test_member__", permissions: ["members:read"] },
    update: {},
  });
  roleId = role.id;
});

afterAll(async () => {
  // Clean up all test data in dependency order
  await db.pollVote.deleteMany({ where: { poll: { title: { startsWith: "__test__" } } } });
  await db.pollOption.deleteMany({ where: { poll: { title: { startsWith: "__test__" } } } });
  await db.poll.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.attendance.deleteMany({ where: { event: { title: { startsWith: "__test__" } } } });
  await db.event.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.asset.deleteMany({ where: { name: { startsWith: "__test__" } } });
  await db.announcement.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.document.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.task.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.ledgerEntry.deleteMany({ where: { title: { startsWith: "__test__" } } });
  await db.user.deleteMany({ where: { memberId: { startsWith: "__test__" } } });
  await db.role.deleteMany({ where: { name: { startsWith: "__test__" } } });
  await db.$disconnect();
});

// ── Helper ────────────────────────────────────────────────────────────────────

async function createTestUser(suffix = "01") {
  const hash = await bcrypt.hash("Password1", 4);
  return db.user.create({
    data: {
      memberId: `__test__mbr_${suffix}`,
      name: `Test User ${suffix}`,
      email: `testuser_${suffix}_${Date.now()}@example.com`,
      passwordHash: hash,
      roleId,
    },
  });
}

// ── Role ──────────────────────────────────────────────────────────────────────

describe("Role model", () => {
  it("creates a role with permissions", async () => {
    const role = await db.role.create({
      data: { name: `__test__role_${Date.now()}`, permissions: ["tasks:read"] },
    });
    expect(role.id).toBeTruthy();
    expect(role.name).toContain("__test__");
  });

  it("enforces unique role names", async () => {
    const name = `__test__dup_${Date.now()}`;
    await db.role.create({ data: { name, permissions: [] } });
    await expect(db.role.create({ data: { name, permissions: [] } })).rejects.toThrow();
  });
});

// ── User / Members ────────────────────────────────────────────────────────────

describe("User model (Members module)", () => {
  it("creates a user with hashed password", async () => {
    const user = await createTestUser("u01");
    userId = user.id;
    expect(user.id).toBeTruthy();
    expect(user.memberId).toBe("__test__mbr_u01");
    expect(user.passwordHash).not.toBe("Password1");
    expect(await bcrypt.compare("Password1", user.passwordHash)).toBe(true);
  });

  it("enforces unique memberId", async () => {
    await expect(createTestUser("u01")).rejects.toThrow();
  });

  it("finds user by memberId", async () => {
    const found = await db.user.findUnique({ where: { memberId: "__test__mbr_u01" } });
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test User u01");
  });

  it("updates isActive status", async () => {
    const updated = await db.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    expect(updated.isActive).toBe(false);
    await db.user.update({ where: { id: userId }, data: { isActive: true } });
  });

  it("filters active members", async () => {
    const active = await db.user.findMany({ where: { isActive: true } });
    expect(active.every((u) => u.isActive)).toBe(true);
  });
});

// ── LedgerEntry ───────────────────────────────────────────────────────────────

describe("LedgerEntry model (Ledger module)", () => {
  let entryId: string;

  it("creates an INCOME entry", async () => {
    const entry = await db.ledgerEntry.create({
      data: {
        title: "__test__ dues Q1",
        date: new Date(),
        category: "Membership",
        type: "INCOME",
        amount: 500_000,
        userId,
      },
    });
    entryId = entry.id;
    expect(entry.type).toBe("INCOME");
    expect(entry.amount).toBe(500_000);
  });

  it("creates an EXPENSE entry", async () => {
    const entry = await db.ledgerEntry.create({
      data: {
        title: "__test__ office supplies",
        date: new Date(),
        category: "Operations",
        type: "EXPENSE",
        amount: 150_000,
        userId,
      },
    });
    expect(entry.type).toBe("EXPENSE");
  });

  it("calculates balance from aggregation", async () => {
    const [income, expense] = await Promise.all([
      db.ledgerEntry.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
    ]);
    const balance = (income._sum.amount ?? 0) - (expense._sum.amount ?? 0);
    expect(balance).toBeGreaterThanOrEqual(0); // at least our test data is valid
  });

  it("updates an entry amount", async () => {
    const updated = await db.ledgerEntry.update({ where: { id: entryId }, data: { amount: 600_000 } });
    expect(updated.amount).toBe(600_000);
  });
});

// ── Task ──────────────────────────────────────────────────────────────────────

describe("Task model (Tasks module)", () => {
  let taskId: string;

  it("creates a task in TODO status", async () => {
    const task = await db.task.create({
      data: {
        title: "__test__ fix the signup form",
        status: "TODO",
        priority: "HIGH",
        creatorId: userId,
      },
    });
    taskId = task.id;
    expect(task.status).toBe("TODO");
    expect(task.priority).toBe("HIGH");
  });

  it("moves task through statuses", async () => {
    for (const status of ["IN_PROGRESS", "REVIEW", "DONE"] as const) {
      const t = await db.task.update({ where: { id: taskId }, data: { status } });
      expect(t.status).toBe(status);
    }
  });

  it("assigns task to a user", async () => {
    const t = await db.task.update({ where: { id: taskId }, data: { assigneeId: userId } });
    expect(t.assigneeId).toBe(userId);
  });

  it("counts tasks by status", async () => {
    const counts = await db.task.groupBy({ by: ["status"], _count: true });
    expect(Array.isArray(counts)).toBe(true);
  });
});

// ── Document ──────────────────────────────────────────────────────────────────

describe("Document model (Knowledge module)", () => {
  let slug: string;

  it("creates a document with unique slug", async () => {
    slug = `__test__-doc-${Date.now()}`;
    const doc = await db.document.create({
      data: {
        title: "__test__ Getting Started",
        slug,
        content: "# Hello\nThis is test content.",
        category: "General",
        authorId: userId,
      },
    });
    expect(doc.slug).toBe(slug);
  });

  it("enforces unique slugs", async () => {
    await expect(
      db.document.create({
        data: { title: "__test__ dup", slug, content: "x", authorId: userId },
      })
    ).rejects.toThrow();
  });

  it("finds document by slug", async () => {
    const found = await db.document.findUnique({ where: { slug } });
    expect(found).not.toBeNull();
    expect(found!.title).toBe("__test__ Getting Started");
  });
});

// ── Announcement ──────────────────────────────────────────────────────────────

describe("Announcement model (Announcements module)", () => {
  it("creates a pinned announcement", async () => {
    const ann = await db.announcement.create({
      data: {
        title: "__test__ Pinned Notice",
        content: "Important update.",
        isPinned: true,
        authorId: userId,
      },
    });
    expect(ann.isPinned).toBe(true);
  });

  it("creates an announcement with expiry date", async () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const ann = await db.announcement.create({
      data: {
        title: "__test__ Expiring Notice",
        content: "Expires soon.",
        expiresAt,
        authorId: userId,
      },
    });
    expect(ann.expiresAt).not.toBeNull();
  });

  it("filters active (non-expired) announcements", async () => {
    const active = await db.announcement.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    expect(active.every((a) => !a.expiresAt || a.expiresAt > new Date())).toBe(true);
  });
});

// ── Event + Attendance ────────────────────────────────────────────────────────

describe("Event + Attendance models (Events module)", () => {
  let eventId: string;

  it("creates an event", async () => {
    const event = await db.event.create({
      data: {
        title: "__test__ Annual Meeting",
        startDate: new Date(),
        location: "Main Hall",
        creatorId: userId,
      },
    });
    eventId = event.id;
    expect(event.id).toBeTruthy();
  });

  it("records attendance for a member", async () => {
    const att = await db.attendance.create({
      data: { eventId, userId, status: "PRESENT" },
    });
    expect(att.status).toBe("PRESENT");
  });

  it("prevents duplicate attendance records", async () => {
    await expect(
      db.attendance.create({ data: { eventId, userId, status: "ABSENT" } })
    ).rejects.toThrow();
  });

  it("upserts attendance (change status)", async () => {
    const att = await db.attendance.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, status: "EXCUSED" },
      update: { status: "EXCUSED" },
    });
    expect(att.status).toBe("EXCUSED");
  });

  it("cascades delete attendance when event is deleted", async () => {
    const tempEvent = await db.event.create({
      data: { title: "__test__ temp event", startDate: new Date(), creatorId: userId },
    });
    await db.attendance.create({ data: { eventId: tempEvent.id, userId, status: "PRESENT" } });
    await db.event.delete({ where: { id: tempEvent.id } });
    const orphan = await db.attendance.findFirst({ where: { eventId: tempEvent.id } });
    expect(orphan).toBeNull();
  });
});

// ── Poll + Vote ───────────────────────────────────────────────────────────────

describe("Poll + PollVote models (Polls module)", () => {
  let pollId: string;
  let optionId: string;

  it("creates a poll with options", async () => {
    const poll = await db.poll.create({
      data: {
        title: "__test__ Best framework?",
        isMultipleChoice: false,
        creatorId: userId,
        options: {
          create: [{ text: "Next.js" }, { text: "Remix" }, { text: "Nuxt" }],
        },
      },
      include: { options: true },
    });
    pollId = poll.id;
    optionId = poll.options[0].id;
    expect(poll.options).toHaveLength(3);
  });

  it("records a vote", async () => {
    const vote = await db.pollVote.create({
      data: { pollId, optionId, userId },
    });
    expect(vote.pollId).toBe(pollId);
    expect(vote.optionId).toBe(optionId);
  });

  it("prevents duplicate vote on same option", async () => {
    await expect(
      db.pollVote.create({ data: { pollId, optionId, userId } })
    ).rejects.toThrow();
  });

  it("counts votes per option", async () => {
    const counts = await db.pollVote.groupBy({
      by: ["optionId"],
      where: { pollId },
      _count: true,
    });
    expect(counts.length).toBeGreaterThan(0);
  });

  it("closes a poll", async () => {
    const closed = await db.poll.update({ where: { id: pollId }, data: { isClosed: true } });
    expect(closed.isClosed).toBe(true);
  });

  it("cascades delete votes when poll is deleted", async () => {
    await db.poll.delete({ where: { id: pollId } });
    const orphanVotes = await db.pollVote.findMany({ where: { pollId } });
    expect(orphanVotes).toHaveLength(0);
  });
});

// ── Asset ─────────────────────────────────────────────────────────────────────

describe("Asset model (Assets module)", () => {
  let assetId: string;

  it("creates an asset with AVAILABLE status", async () => {
    const asset = await db.asset.create({
      data: {
        name: "__test__ Projector",
        category: "Electronics",
        status: "AVAILABLE",
        creatorId: userId,
      },
    });
    assetId = asset.id;
    expect(asset.status).toBe("AVAILABLE");
  });

  it("checks out asset to a holder", async () => {
    const asset = await db.asset.update({
      where: { id: assetId },
      data: { status: "IN_USE", currentHolderId: userId },
    });
    expect(asset.status).toBe("IN_USE");
    expect(asset.currentHolderId).toBe(userId);
  });

  it("returns asset (clears holder)", async () => {
    const asset = await db.asset.update({
      where: { id: assetId },
      data: { status: "AVAILABLE", currentHolderId: null },
    });
    expect(asset.status).toBe("AVAILABLE");
    expect(asset.currentHolderId).toBeNull();
  });

  it("filters assets by status", async () => {
    const available = await db.asset.findMany({ where: { status: "AVAILABLE" } });
    expect(available.every((a) => a.status === "AVAILABLE")).toBe(true);
  });

  it("supports all status values", async () => {
    for (const status of ["AVAILABLE", "IN_USE", "MAINTENANCE", "LOST"] as const) {
      const a = await db.asset.update({ where: { id: assetId }, data: { status } });
      expect(a.status).toBe(status);
    }
  });
});

// ── Reports aggregation ───────────────────────────────────────────────────────

describe("Reports — cross-module aggregations", () => {
  it("counts total and active members", async () => {
    const [total, active] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
    ]);
    expect(total).toBeGreaterThan(0);
    expect(active).toBeLessThanOrEqual(total);
  });

  it("computes ledger balance", async () => {
    const [inc, exp] = await Promise.all([
      db.ledgerEntry.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
    ]);
    const balance = (inc._sum.amount ?? 0) - (exp._sum.amount ?? 0);
    expect(typeof balance).toBe("number");
  });

  it("counts tasks by completion status", async () => {
    const [total, done] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: "DONE" } }),
    ]);
    expect(done).toBeLessThanOrEqual(total);
  });

  it("returns members grouped by role", async () => {
    const byRole = await db.role.findMany({
      select: { name: true, _count: { select: { users: true } } },
    });
    expect(Array.isArray(byRole)).toBe(true);
  });
});
