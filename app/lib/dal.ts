import "server-only";
import { cache } from "react";
import { db } from "@/app/lib/db";
import { getSessionPayload } from "@/app/lib/session";

export type CurrentUser = {
  id: string;
  memberId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  role: { id: string; name: string; permissions: unknown };
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSessionPayload();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId, isActive: true },
    select: {
      id: true,
      memberId: true,
      name: true,
      email: true,
      avatarUrl: true,
      isActive: true,
      role: { select: { id: true, name: true, permissions: true } },
    },
  });

  return user;
});

export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const perms = user.role.permissions as string[];
  return perms.includes("*") || perms.includes(permission);
}

export async function isFirstBoot(): Promise<boolean> {
  const count = await db.user.count();
  return count === 0;
}
