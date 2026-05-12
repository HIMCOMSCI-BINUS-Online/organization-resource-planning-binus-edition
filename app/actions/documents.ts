"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const DocSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  category: z.string().min(1, { message: "Category is required." }).trim(),
  content: z.string().min(1, { message: "Content cannot be empty." }),
});

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createDocument(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await assertAuth();

  const parsed = DocSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, category, content } = parsed.data;
  const baseSlug = toSlug(title);

  // Ensure unique slug
  const existing = await db.document.count({ where: { slug: { startsWith: baseSlug } } });
  const slug = existing === 0 ? baseSlug : `${baseSlug}-${existing}`;

  await db.document.create({
    data: { title, slug, category, content, authorId: user.id },
  });

  revalidatePath("/dashboard/knowledge");
  return { message: "ok" };
}

export async function updateDocument(
  id: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  await assertAuth();

  const parsed = DocSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { title, category, content } = parsed.data;

  await db.document.update({ where: { id }, data: { title, category, content } });

  revalidatePath("/dashboard/knowledge");
  revalidatePath("/dashboard/knowledge/[slug]", "page");
  return { message: "ok" };
}

export async function deleteDocument(id: string, slug: string): Promise<void> {
  await assertAuth();
  await db.document.delete({ where: { id } });
  revalidatePath("/dashboard/knowledge");
  redirect("/dashboard/knowledge");
}
