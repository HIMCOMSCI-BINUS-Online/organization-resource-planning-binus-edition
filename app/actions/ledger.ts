"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const LedgerSchema = z.object({
  date: z.string().min(1, { message: "Date is required." }),
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  category: z.string().min(1, { message: "Category is required." }).trim(),
  type: z.enum(["INCOME", "EXPENSE"], { error: "Type must be INCOME or EXPENSE." }),
  amount: z.coerce.number().int().positive({ message: "Amount must be a positive integer (in IDR)." }),
  description: z.string().optional(),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createLedgerEntry(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await assertAuth();

  const parsed = LedgerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { date, title, category, type, amount, description } = parsed.data;

  await db.ledgerEntry.create({
    data: {
      date: new Date(date),
      title,
      category,
      type,
      amount,
      description: description || null,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/ledger");
  revalidatePath("/dashboard");
  return { message: "ok" };
}

export async function updateLedgerEntry(
  id: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  await assertAuth();

  const parsed = LedgerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { date, title, category, type, amount, description } = parsed.data;

  await db.ledgerEntry.update({
    where: { id },
    data: { date: new Date(date), title, category, type, amount, description: description || null },
  });

  revalidatePath("/dashboard/ledger");
  revalidatePath("/dashboard");
  return { message: "ok" };
}

export async function deleteLedgerEntry(id: string): Promise<void> {
  await assertAuth();
  await db.ledgerEntry.delete({ where: { id } });
  revalidatePath("/dashboard/ledger");
  revalidatePath("/dashboard");
}
