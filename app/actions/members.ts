"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const MemberSchema = z.object({
  memberId: z.string().min(2, { message: "Member ID must be at least 2 characters." }).trim(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).trim(),
  email: z.string().email({ message: "Enter a valid email." }).trim(),
  phone: z.string().optional(),
  division: z.string().optional(),
  batch: z.string().optional(),
  bio: z.string().optional(),
  roleId: z.string().min(1, { message: "Role is required." }),
  password: z.string().min(8, { message: "Must be at least 8 characters." }).optional().or(z.literal("")),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createMember(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  await assertAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = MemberSchema.extend({
    password: z.string().min(8, { message: "Password is required for new members." }),
  }).safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { memberId, name, email, phone, division, batch, bio, roleId, password } = parsed.data;

  const exists = await db.user.findFirst({ where: { OR: [{ memberId }, { email }] } });
  if (exists) {
    return { message: "A member with that ID or email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { memberId, name, email, phone: phone || null, division: division || null, batch: batch || null, bio: bio || null, roleId, passwordHash },
  });

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
  return { message: "ok" };
}

export async function updateMember(
  id: string,
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  await assertAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = MemberSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { memberId, name, email, phone, division, batch, bio, roleId, password } = parsed.data;

  const conflict = await db.user.findFirst({
    where: { OR: [{ memberId }, { email }], NOT: { id } },
  });
  if (conflict) {
    return { message: "Another member already uses that ID or email." };
  }

  const data: Record<string, unknown> = {
    memberId, name, email,
    phone: phone || null,
    division: division || null,
    batch: batch || null,
    bio: bio || null,
    roleId,
  };

  if (password && password.length >= 8) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await db.user.update({ where: { id }, data });

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
  return { message: "ok" };
}

export async function toggleMemberActive(id: string, isActive: boolean): Promise<void> {
  await assertAuth();
  await db.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
}
