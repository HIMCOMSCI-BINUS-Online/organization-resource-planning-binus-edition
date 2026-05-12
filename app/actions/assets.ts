"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const AssetSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).trim(),
  category: z.string().min(1, { message: "Category is required." }).trim(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "LOST"]),
  currentHolderId: z.string().optional(),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createAsset(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await assertAuth();
  const parsed = AssetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, category, description, serialNumber, status, currentHolderId } = parsed.data;
  await db.asset.create({
    data: {
      name, category,
      description: description || null,
      serialNumber: serialNumber || null,
      status,
      currentHolderId: currentHolderId || null,
      creatorId: user.id,
    },
  });

  revalidatePath("/dashboard/assets");
  return { message: "ok" };
}

export async function updateAsset(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  await assertAuth();
  const parsed = AssetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, category, description, serialNumber, status, currentHolderId } = parsed.data;
  await db.asset.update({
    where: { id },
    data: {
      name, category,
      description: description || null,
      serialNumber: serialNumber || null,
      status,
      currentHolderId: currentHolderId || null,
    },
  });

  revalidatePath("/dashboard/assets");
  return { message: "ok" };
}

export async function deleteAsset(id: string): Promise<void> {
  await assertAuth();
  await db.asset.delete({ where: { id } });
  revalidatePath("/dashboard/assets");
}

export async function checkoutAsset(id: string, userId: string): Promise<void> {
  await assertAuth();
  await db.asset.update({
    where: { id },
    data: { status: "IN_USE", currentHolderId: userId },
  });
  revalidatePath("/dashboard/assets");
}

export async function returnAsset(id: string): Promise<void> {
  await assertAuth();
  await db.asset.update({
    where: { id },
    data: { status: "AVAILABLE", currentHolderId: null },
  });
  revalidatePath("/dashboard/assets");
}
