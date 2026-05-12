"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const EventSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, { message: "Start date is required." }),
  endDate: z.string().optional(),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createEvent(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await assertAuth();
  const parsed = EventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, description, location, startDate, endDate } = parsed.data;
  await db.event.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      creatorId: user.id,
    },
  });

  revalidatePath("/dashboard/events");
  return { message: "ok" };
}

export async function updateEvent(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAuth();
  const parsed = EventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, description, location, startDate, endDate } = parsed.data;
  await db.event.update({
    where: { id },
    data: {
      title,
      description: description || null,
      location: location || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${id}`);
  return { message: "ok" };
}

export async function deleteEvent(id: string): Promise<void> {
  await assertAuth();
  await db.event.delete({ where: { id } });
  revalidatePath("/dashboard/events");
}

export async function upsertAttendance(
  eventId: string,
  userId: string,
  status: "PRESENT" | "ABSENT" | "EXCUSED",
  note?: string
): Promise<void> {
  await assertAuth();
  await db.attendance.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: { status, note: note || null },
    create: { eventId, userId, status, note: note || null },
  });
  revalidatePath(`/dashboard/events/${eventId}`);
}

export async function bulkCreateAttendance(eventId: string, userIds: string[]): Promise<void> {
  await assertAuth();
  await db.attendance.createMany({
    data: userIds.map((userId) => ({ eventId, userId, status: "PRESENT" as const })),
    skipDuplicates: true,
  });
  revalidatePath(`/dashboard/events/${eventId}`);
}
