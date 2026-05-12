import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }).trim(),
  password: z.string().min(1, { message: "Password is required." }),
});

export const OnboardingSchema = z.object({
  memberId: z
    .string()
    .min(2, { message: "Member ID must be at least 2 characters." })
    .trim(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .trim(),
  email: z.string().email({ message: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { message: "Must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  TREASURER: "Treasurer",
  INSTRUCTOR: "Instructor",
  SECRETARY: "Secretary",
  MEMBER: "Member",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  "Super Admin": ["*"],
  Treasurer: ["ledger:read", "ledger:write", "members:read"],
  Instructor: ["tasks:read", "tasks:write", "members:read", "knowledge:read"],
  Secretary: ["members:read", "members:write", "tasks:read", "knowledge:read", "knowledge:write"],
  Member: ["members:read", "tasks:read", "knowledge:read"],
};
