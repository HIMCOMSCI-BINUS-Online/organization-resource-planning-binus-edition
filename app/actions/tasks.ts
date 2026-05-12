"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const TaskSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createTask(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await assertAuth();

  const parsed = TaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, description, status, priority, dueDate, assigneeId } = parsed.data;

  await db.task.create({
    data: {
      title,
      description: description || null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      creatorId: user.id,
    },
  });

  revalidatePath("/dashboard/tasks");
  return { message: "ok" };
}

export async function updateTask(
  id: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  await assertAuth();

  const parsed = TaskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, description, status, priority, dueDate, assigneeId } = parsed.data;

  await db.task.update({
    where: { id },
    data: {
      title,
      description: description || null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
    },
  });

  revalidatePath("/dashboard/tasks");
  return { message: "ok" };
}

export async function moveTask(id: string, status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"): Promise<void> {
  await assertAuth();
  await db.task.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(id: string): Promise<void> {
  await assertAuth();
  await db.task.delete({ where: { id } });
  revalidatePath("/dashboard/tasks");
}
