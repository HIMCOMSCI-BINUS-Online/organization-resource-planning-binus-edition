"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const Schema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  content: z.string().min(1, { message: "Content is required." }),
  isPinned: z.string().optional(),
  expiresAt: z.string().optional(),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createAnnouncement(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await assertAuth();
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, content, isPinned, expiresAt } = parsed.data;
  await db.announcement.create({
    data: {
      title, content,
      isPinned: isPinned === "on",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      authorId: user.id,
    },
  });

  revalidatePath("/dashboard/announcements");
  return { message: "ok" };
}

export async function updateAnnouncement(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAuth();
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, content, isPinned, expiresAt } = parsed.data;
  await db.announcement.update({
    where: { id },
    data: {
      title, content,
      isPinned: isPinned === "on",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/dashboard/announcements");
  return { message: "ok" };
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await assertAuth();
  await db.announcement.delete({ where: { id } });
  revalidatePath("/dashboard/announcements");
}

export async function togglePin(id: string, isPinned: boolean): Promise<void> {
  await assertAuth();
  await db.announcement.update({ where: { id }, data: { isPinned } });
  revalidatePath("/dashboard/announcements");
}
