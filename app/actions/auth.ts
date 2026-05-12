"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/app/lib/db";
import { createSession, deleteSession } from "@/app/lib/session";
import { LoginSchema, OnboardingSchema, ROLES, ROLE_PERMISSIONS } from "@/app/lib/definitions";
import type { FormState } from "@/app/lib/definitions";

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    return { message: "Invalid credentials." };
  }

  const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatch) {
    return { message: "Invalid credentials." };
  }

  await createSession(user.id, user.role.name);
  redirect("/dashboard");
}

export async function setupSuperAdmin(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    memberId: formData.get("memberId"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = OnboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const existingUser = await db.user.count();
  if (existingUser > 0) {
    return { message: "System is already initialized." };
  }

  const existingRole = await db.role.findUnique({
    where: { name: ROLES.SUPER_ADMIN },
  });

  const superAdminRole =
    existingRole ??
    (await db.role.create({
      data: {
        name: ROLES.SUPER_ADMIN,
        permissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
      },
    }));

  // Seed remaining roles if they don't exist yet
  const otherRoles = Object.entries(ROLES).filter(([, v]) => v !== ROLES.SUPER_ADMIN);
  for (const [, roleName] of otherRoles) {
    const name = roleName as keyof typeof ROLE_PERMISSIONS;
    await db.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, permissions: ROLE_PERMISSIONS[name] },
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data: {
      memberId: parsed.data.memberId,
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      roleId: superAdminRole.id,
    },
  });

  await createSession(user.id, ROLES.SUPER_ADMIN);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
