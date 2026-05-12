"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/dal";
import type { FormState } from "@/app/lib/definitions";

const PollSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).trim(),
  description: z.string().optional(),
  isMultipleChoice: z.string().optional(),
  options: z.array(z.string().min(1)).min(2, { message: "At least 2 options required." }),
});

async function assertAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createPoll(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await assertAuth();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    isMultipleChoice: formData.get("isMultipleChoice"),
    options: formData.getAll("options").filter(Boolean),
  };

  const parsed = PollSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const { title, description, isMultipleChoice, options } = parsed.data;

  await db.poll.create({
    data: {
      title,
      description: description || null,
      isMultipleChoice: isMultipleChoice === "on",
      creatorId: user.id,
      options: { create: options.map((text) => ({ text })) },
    },
  });

  revalidatePath("/dashboard/polls");
  return { message: "ok" };
}

export async function closePoll(id: string, isClosed: boolean): Promise<void> {
  await assertAuth();
  await db.poll.update({ where: { id }, data: { isClosed } });
  revalidatePath("/dashboard/polls");
  revalidatePath(`/dashboard/polls/${id}`);
}

export async function deletePoll(id: string): Promise<void> {
  await assertAuth();
  await db.poll.delete({ where: { id } });
  revalidatePath("/dashboard/polls");
}

export async function castVote(pollId: string, optionIds: string[]): Promise<FormState> {
  const user = await assertAuth();

  const poll = await db.poll.findUnique({ where: { id: pollId } });
  if (!poll) return { message: "Poll not found." };
  if (poll.isClosed) return { message: "This poll is closed." };

  if (!poll.isMultipleChoice) {
    if (optionIds.length !== 1) return { message: "Select exactly one option." };
    const alreadyVoted = await db.pollVote.findFirst({ where: { pollId, userId: user.id } });
    if (alreadyVoted) return { message: "You have already voted." };
  }

  await db.pollVote.createMany({
    data: optionIds.map((optionId) => ({ pollId, optionId, userId: user.id })),
    skipDuplicates: true,
  });

  revalidatePath(`/dashboard/polls/${pollId}`);
  return { message: "ok" };
}
