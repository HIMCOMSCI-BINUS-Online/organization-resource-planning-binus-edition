import "server-only";
import { db } from "@/app/lib/db";

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  totalRoles: number;
  newestMember: { name: string; createdAt: Date } | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalMembers, activeMembers, totalRoles, newestMember] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.role.count(),
      db.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { name: true, createdAt: true },
      }),
    ]);

  return { totalMembers, activeMembers, totalRoles, newestMember };
}

export type MemberRow = {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string | null;
  division: string | null;
  batch: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  role: { id: string; name: string };
};

export async function getMembers(opts?: {
  search?: string;
  roleId?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}): Promise<{ members: MemberRow[]; total: number }> {
  const { search, roleId, isActive, page = 1, perPage = 20 } = opts ?? {};

  const where = {
    ...(isActive !== undefined ? { isActive } : {}),
    ...(roleId ? { roleId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { memberId: { contains: search, mode: "insensitive" as const} },
            { division: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [members, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        memberId: true,
        name: true,
        email: true,
        phone: true,
        division: true,
        batch: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return { members, total };
}

export async function getMemberById(id: string): Promise<MemberRow | null> {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      memberId: true,
      name: true,
      email: true,
      phone: true,
      division: true,
      batch: true,
      bio: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export async function getRoles() {
  return db.role.findMany({ orderBy: { name: "asc" } });
}

// Ledger

export type LedgerEntryRow = {
  id: string;
  date: Date;
  title: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  createdAt: Date;
  user: { id: string; name: string };
};

export type LedgerSummary = {
  entries: LedgerEntryRow[];
  total: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export async function getLedgerEntries(opts?: {
  search?: string;
  type?: "INCOME" | "EXPENSE";
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<LedgerSummary> {
  const { search, type, category, page = 1, perPage = 25 } = opts ?? {};

  const where = {
    ...(type ? { type } : {}),
    ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [entries, total, agg] = await Promise.all([
    db.ledgerEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        date: true,
        title: true,
        category: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
    db.ledgerEntry.count({ where }),
    // Always compute balance on the full unfiltered set
    db.ledgerEntry.groupBy({
      by: ["type"],
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = agg.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const totalExpense = agg.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  return {
    entries: entries as LedgerEntryRow[],
    total,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export async function getLedgerCategories(): Promise<string[]> {
  const rows = await db.ledgerEntry.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

// Tasks

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: { id: string; name: string } | null;
  creator: { id: string; name: string };
};

export type KanbanBoard = Record<TaskRow["status"], TaskRow[]>;

export async function getKanbanBoard(): Promise<KanbanBoard> {
  const tasks = await db.task.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  const board: KanbanBoard = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
  for (const t of tasks as TaskRow[]) board[t.status].push(t);
  return board;
}

// Knowledge Base

export type DocumentRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string };
};

export type DocumentFull = DocumentRow & { content: string };

export async function getDocuments(opts?: {
  search?: string;
  category?: string;
}): Promise<DocumentRow[]> {
  const { search, category } = opts ?? {};
  return db.document.findMany({
    where: {
      ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { category: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
    },
  }) as Promise<DocumentRow[]>;
}

export async function getDocumentBySlug(slug: string): Promise<DocumentFull | null> {
  return db.document.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
    },
  }) as Promise<DocumentFull | null>;
}

export async function getDocumentCategories(): Promise<string[]> {
  const rows = await db.document.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

// ── Announcements ─────────────────────────────────────────────────────────────

export type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string };
};

export async function getAnnouncements(): Promise<AnnouncementRow[]> {
  const now = new Date();
  return db.announcement.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, content: true, isPinned: true,
      expiresAt: true, createdAt: true, updatedAt: true,
      author: { select: { id: true, name: true } },
    },
  }) as Promise<AnnouncementRow[]>;
}

// ── Events & Attendance ───────────────────────────────────────────────────────

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  creator: { id: string; name: string };
  _count: { attendances: number };
};

export type EventFull = EventRow & {
  attendances: {
    id: string;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    note: string | null;
    user: { id: string; name: string; memberId: string; division: string | null };
  }[];
};

export async function getEvents(): Promise<EventRow[]> {
  return db.event.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true, title: true, description: true, location: true,
      startDate: true, endDate: true, createdAt: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { attendances: true } },
    },
  }) as Promise<EventRow[]>;
}

export async function getEventById(id: string): Promise<EventFull | null> {
  return db.event.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, location: true,
      startDate: true, endDate: true, createdAt: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { attendances: true } },
      attendances: {
        select: {
          id: true, status: true, note: true,
          user: { select: { id: true, name: true, memberId: true, division: true } },
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  }) as Promise<EventFull | null>;
}

// ── Polls ─────────────────────────────────────────────────────────────────────

export type PollRow = {
  id: string;
  title: string;
  description: string | null;
  isMultipleChoice: boolean;
  isClosed: boolean;
  createdAt: Date;
  creator: { id: string; name: string };
  _count: { votes: number; options: number };
};

export type PollFull = PollRow & {
  options: {
    id: string;
    text: string;
    _count: { votes: number };
  }[];
  votes: { userId: string; optionId: string }[];
};

export async function getPolls(): Promise<PollRow[]> {
  return db.poll.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      isMultipleChoice: true, isClosed: true, createdAt: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { votes: true, options: true } },
    },
  }) as Promise<PollRow[]>;
}

export async function getPollById(id: string): Promise<PollFull | null> {
  return db.poll.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true,
      isMultipleChoice: true, isClosed: true, createdAt: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { votes: true, options: true } },
      options: {
        select: { id: true, text: true, _count: { select: { votes: true } } },
        orderBy: { createdAt: "asc" },
      },
      votes: { select: { userId: true, optionId: true } },
    },
  }) as Promise<PollFull | null>;
}

// ── Assets ────────────────────────────────────────────────────────────────────

export type AssetRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  serialNumber: string | null;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "LOST";
  createdAt: Date;
  updatedAt: Date;
  currentHolder: { id: string; name: string } | null;
  creator: { id: string; name: string };
};

export async function getAssets(opts?: { category?: string; status?: string }): Promise<AssetRow[]> {
  const { category, status } = opts ?? {};
  return db.asset.findMany({
    where: {
      ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
      ...(status ? { status: status as "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "LOST" } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, category: true, description: true,
      serialNumber: true, status: true, createdAt: true, updatedAt: true,
      currentHolder: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  }) as Promise<AssetRow[]>;
}

export async function getAssetCategories(): Promise<string[]> {
  const rows = await db.asset.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

// ── Reports ───────────────────────────────────────────────────────────────────

export type ReportStats = {
  members: { total: number; active: number; byRole: { name: string; count: number }[] };
  ledger: { totalIncome: number; totalExpense: number; balance: number };
  tasks: { total: number; done: number; overdue: number };
  events: { total: number; totalAttendances: number };
  assets: { total: number; available: number; inUse: number };
  announcements: { total: number; active: number };
};

export async function getReportStats(): Promise<ReportStats> {
  const now = new Date();
  const [
    totalMembers, activeMembers, roleGroups,
    incomeAgg, expenseAgg,
    totalTasks, doneTasks, overdueTasks,
    totalEvents, totalAttendances,
    totalAssets, availableAssets, inUseAssets,
    totalAnnouncements, activeAnnouncements,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.role.findMany({ select: { name: true, _count: { select: { users: true } } }, orderBy: { name: "asc" } }),
    db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
    db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
    db.task.count(),
    db.task.count({ where: { status: "DONE" } }),
    db.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: now } } }),
    db.event.count(),
    db.attendance.count(),
    db.asset.count(),
    db.asset.count({ where: { status: "AVAILABLE" } }),
    db.asset.count({ where: { status: "IN_USE" } }),
    db.announcement.count(),
    db.announcement.count({ where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;

  return {
    members: {
      total: totalMembers,
      active: activeMembers,
      byRole: roleGroups.map((r) => ({ name: r.name, count: r._count.users })),
    },
    ledger: { totalIncome, totalExpense, balance: totalIncome - totalExpense },
    tasks: { total: totalTasks, done: doneTasks, overdue: overdueTasks },
    events: { total: totalEvents, totalAttendances },
    assets: { total: totalAssets, available: availableAssets, inUse: inUseAssets },
    announcements: { total: totalAnnouncements, active: activeAnnouncements },
  };
}
