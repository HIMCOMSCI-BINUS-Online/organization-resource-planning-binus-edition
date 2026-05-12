import { notFound } from "next/navigation";
import { getPollById } from "@/app/lib/queries";
import { getCurrentUser } from "@/app/lib/dal";
import PollVoteClient from "./PollVoteClient";

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [poll, user] = await Promise.all([getPollById(id), getCurrentUser()]);
  if (!poll || !user) notFound();

  const userVotedOptionIds = poll.votes.filter((v) => v.userId === user.id).map((v) => v.optionId);

  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <PollVoteClient poll={poll} currentUserId={user.id} userVotedOptionIds={userVotedOptionIds} />
    </main>
  );
}
