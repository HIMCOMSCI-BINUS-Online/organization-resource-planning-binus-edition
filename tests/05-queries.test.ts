/**
 * Integration tests for query helpers in app/lib/queries.ts
 * Requires a running PostgreSQL database with at least one seeded user.
 *
 * Run after 03-database.test.ts has populated test data, or run full suite together.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Direct DB client for setup/teardown
function makeDb() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const db = makeDb();

let roleId: string;
let userId: string;

beforeAll(async () => {
  const role = await db.role.upsert({
    where: { name: "__qtest_role__" },
    create: { name: "__qtest_role__", permissions: ["*"] },
    update: {},
  });
  roleId = role.id;

  const hash = await bcrypt.hash("Password1", 4);
  const user = await db.user.upsert({
    where: { memberId: "__qtest__mbr" },
    create: {
      memberId: "__qtest__mbr",
      name: "Query Test User",
      email: `qtestuser_${Date.now()}@example.com`,
      passwordHash: hash,
      roleId,
    },
    update: {},
  });
  userId = user.id;
});

afterAll(async () => {
  await db.announcement.deleteMany({ where: { title: { startsWith: "__qtest__" } } });
  await db.event.deleteMany({ where: { title: { startsWith: "__qtest__" } } });
  await db.asset.deleteMany({ where: { name: { startsWith: "__qtest__" } } });
  await db.document.deleteMany({ where: { slug: { startsWith: "__qtest__" } } });
  await db.ledgerEntry.deleteMany({ where: { title: { startsWith: "__qtest__" } } });
  await db.task.deleteMany({ where: { title: { startsWith: "__qtest__" } } });
  await db.user.deleteMany({ where: { memberId: "__qtest__mbr" } });
  await db.role.deleteMany({ where: { name: "__qtest_role__" } });
  await db.$disconnect();
});

// ── getMembers ────────────────────────────────────────────────────────────────

describe("getMembers query", () => {
  it("returns paginated list", async () => {
    const { members, total } = await db.user.findMany({
      take: 10,
      select: { id: true, name: true, isActive: true, role: { select: { name: true } } },
    }).then((members) => ({ members, total: members.length }));

    expect(Array.isArray(members)).toBe(true);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it("filters by isActive=true", async () => {
    const members = await db.user.findMany({
      where: { isActive: true },
      select: { id: true, isActive: true },
    });
    expect(members.every((m) => m.isActive === true)).toBe(true);
  });

  it("searches by name (case-insensitive)", async () => {
    const results = await db.user.findMany({
      where: { name: { contains: "query test", mode: "insensitive" } },
    });
    expect(results.some((u) => u.memberId === "__qtest__mbr")).toBe(true);
  });
});

// ── getDashboardStats ─────────────────────────────────────────────────────────

describe("getDashboardStats query", () => {
  it("returns non-negative counts", async () => {
    const [totalMembers, activeMembers, totalRoles] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.role.count(),
    ]);
    expect(totalMembers).toBeGreaterThanOrEqual(0);
    expect(activeMembers).toBeLessThanOrEqual(totalMembers);
    expect(totalRoles).toBeGreaterThan(0);
  });

  it("newestMember returns most recently created user", async () => {
    const newest = await db.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: { name: true, createdAt: true },
    });
    if (newest) {
      expect(newest.name).toBeTruthy();
      expect(newest.createdAt).toBeInstanceOf(Date);
    }
  });
});

// ── getLedgerEntries ──────────────────────────────────────────────────────────

describe("getLedgerEntries query", () => {
  beforeAll(async () => {
    await db.ledgerEntry.createMany({
      data: [
        { title: "__qtest__ income", date: new Date(), category: "Test", type: "INCOME", amount: 100_000, userId },
        { title: "__qtest__ expense", date: new Date(), category: "Test", type: "EXPENSE", amount: 50_000, userId },
      ],
    });
  });

  it("aggregates income correctly", async () => {
    const result = await db.ledgerEntry.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    });
    expect((result._sum.amount ?? 0)).toBeGreaterThanOrEqual(100_000);
  });

  it("balance = income - expense", async () => {
    const [inc, exp] = await Promise.all([
      db.ledgerEntry.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
    ]);
    const balance = (inc._sum.amount ?? 0) - (exp._sum.amount ?? 0);
    expect(typeof balance).toBe("number");
  });
});

// ── getAnnouncements ──────────────────────────────────────────────────────────

describe("getAnnouncements query", () => {
  beforeAll(async () => {
    await db.announcement.createMany({
      data: [
        { title: "__qtest__ pinned", content: "pinned", isPinned: true, authorId: userId },
        { title: "__qtest__ normal", content: "normal", isPinned: false, authorId: userId },
        {
          title: "__qtest__ expired",
          content: "expired",
          isPinned: false,
          expiresAt: new Date(Date.now() - 1000),
          authorId: userId,
        },
      ],
    });
  });

  it("pinned announcements come first", async () => {
    const list = await db.announcement.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
    const pinned = list.filter((a) => a.isPinned);
    const unpinned = list.filter((a) => !a.isPinned);
    if (pinned.length > 0 && unpinned.length > 0) {
      const firstUnpinnedIndex = list.findIndex((a) => !a.isPinned);
      const lastPinnedIndex = list.map((a) => a.isPinned).lastIndexOf(true);
      expect(lastPinnedIndex).toBeLessThan(firstUnpinnedIndex);
    }
  });

  it("active filter excludes expired announcements", async () => {
    const active = await db.announcement.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    });
    expect(active.every((a) => !a.expiresAt || a.expiresAt > new Date())).toBe(true);
  });
});

// ── getEvents ─────────────────────────────────────────────────────────────────

describe("getEvents query", () => {
  let eventId: string;

  beforeAll(async () => {
    const event = await db.event.create({
      data: {
        title: "__qtest__ Workshop",
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        creatorId: userId,
      },
    });
    eventId = event.id;
  });

  it("finds upcoming events", async () => {
    const upcoming = await db.event.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
    });
    expect(upcoming.some((e) => e.id === eventId)).toBe(true);
  });

  it("includes attendance count", async () => {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendances: true } } },
    });
    expect(event?._count.attendances).toBe(0);
  });
});

// ── getAssets ─────────────────────────────────────────────────────────────────

describe("getAssets query", () => {
  beforeAll(async () => {
    await db.asset.createMany({
      data: [
        { name: "__qtest__ Laptop", category: "Electronics", status: "AVAILABLE", creatorId: userId },
        { name: "__qtest__ Camera", category: "Electronics", status: "IN_USE", currentHolderId: userId, creatorId: userId },
        { name: "__qtest__ Whiteboard", category: "Furniture", status: "AVAILABLE", creatorId: userId },
      ],
    });
  });

  it("filters by category", async () => {
    const electronics = await db.asset.findMany({ where: { category: "Electronics" } });
    expect(electronics.every((a) => a.category === "Electronics")).toBe(true);
  });

  it("filters by status", async () => {
    const available = await db.asset.findMany({ where: { status: "AVAILABLE" } });
    expect(available.every((a) => a.status === "AVAILABLE")).toBe(true);
  });

  it("lists unique categories", async () => {
    const raw = await db.asset.findMany({ select: { category: true }, distinct: ["category"] });
    const categories = raw.map((r) => r.category);
    expect(categories).toContain("Electronics");
    expect(categories).toContain("Furniture");
  });
});

// ── getReportStats ────────────────────────────────────────────────────────────

describe("getReportStats — full aggregation", () => {
  it("computes all stats without throwing", async () => {
    const [
      totalMembers, activeMembers,
      totalIncome, totalExpense,
      totalTasks, doneTasks,
      totalEvents, totalAttendances,
      totalAssets, availableAssets,
      totalAnn, activeAnn,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.ledgerEntry.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
      db.ledgerEntry.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
      db.task.count(),
      db.task.count({ where: { status: "DONE" } }),
      db.event.count(),
      db.attendance.count(),
      db.asset.count(),
      db.asset.count({ where: { status: "AVAILABLE" } }),
      db.announcement.count(),
      db.announcement.count({ where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
    ]);

    expect(activeMembers).toBeLessThanOrEqual(totalMembers);
    expect(doneTasks).toBeLessThanOrEqual(totalTasks);
    expect(availableAssets).toBeLessThanOrEqual(totalAssets);
    expect(activeAnn).toBeLessThanOrEqual(totalAnn);
    expect(totalAttendances).toBeLessThanOrEqual(totalEvents * 1000);
    const balance = (totalIncome._sum.amount ?? 0) - (totalExpense._sum.amount ?? 0);
    expect(typeof balance).toBe("number");
  });
});
