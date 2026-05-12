"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { castVote } from "@/app/actions/polls";
import type { PollFull } from "@/app/lib/queries";

const cx: React.CSSProperties = { maxWidth: "760px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function PollVoteClient({
  poll, currentUserId, userVotedOptionIds,
}: { poll: PollFull; currentUserId: string; userVotedOptionIds: string[] }) {
  const [voted, setVoted] = useState<string[]>(userVotedOptionIds);
  const [optionCounts, setOptionCounts] = useState(() =>
    new Map(poll.options.map((o) => [o.id, o._count.votes]))
  );
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(containerRef.current, { y: 24, opacity: 0, duration: 0.7, ease: "power4.out" });
  }, []);

  const totalVotes = poll._count.votes;
  const hasVoted = voted.length > 0;
  const canVote = !poll.isClosed && (!hasVoted || poll.isMultipleChoice);

  function toggleOption(optionId: string) {
    if (!canVote) return;
    if (poll.isMultipleChoice) {
      setVoted((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
    } else {
      setVoted([optionId]);
    }
    setError("");
  }

  function handleVote() {
    if (voted.length === 0) { setError("Select at least one option."); return; }
    const newSelections = voted.filter((id) => !userVotedOptionIds.includes(id));
    if (newSelections.length === 0) return;

    setOptionCounts((prev) => {
      const next = new Map(prev);
      newSelections.forEach((id) => next.set(id, (next.get(id) ?? 0) + 1));
      return next;
    });

    startTransition(async () => {
      const result = await castVote(poll.id, newSelections);
      if (result?.message && result.message !== "ok") setError(result.message);
    });
  }

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx} ref={containerRef}>
        <Link href="/dashboard/polls" style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", marginBottom: "1.5rem", display: "inline-block" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)")}><ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />Polls</Link>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.15 }}>{poll.title}</h1>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            {poll.isClosed && <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,100,100,0.7)", border: "1px solid rgba(255,100,100,0.2)", padding: "0.2rem 0.5rem" }}>Closed</span>}
            {poll.isMultipleChoice && <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(100,180,255,0.6)", border: "1px solid rgba(100,180,255,0.15)", padding: "0.2rem 0.5rem" }}>Multiple Choice</span>}
          </div>
        </div>

        {poll.description && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "1rem" }}>{poll.description}</p>}

        <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)", marginBottom: "2rem" }}>
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""} · by {poll.creator.name} · {new Date(poll.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        {error && <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.2)", padding: "0.6rem 0.75rem", marginBottom: "1rem" }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {poll.options.map((option) => {
            const count = optionCounts.get(option.id) ?? 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = voted.includes(option.id);
            const showResults = hasVoted || poll.isClosed;

            return (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                style={{
                  position: "relative", border: `1px solid ${isSelected ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                  padding: "1rem 1.25rem", cursor: canVote ? "pointer" : "default",
                  background: isSelected ? "rgba(255,255,255,0.04)" : "#000",
                  transition: "all 0.15s", overflow: "hidden",
                }}
                onMouseEnter={(e) => { if (canVote) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                {showResults && (
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", transition: "width 0.5s ease-out" }} />
                )}
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 400, color: isSelected ? "#fff" : "rgba(255,255,255,0.7)" }}>{option.text}</span>
                  {showResults && (
                    <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{pct}% ({count})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!poll.isClosed && !hasVoted && (
          <button
            onClick={handleVote}
            disabled={voted.length === 0}
            style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: voted.length > 0 ? "#fff" : "rgba(255,255,255,0.1)", color: voted.length > 0 ? "#000" : "rgba(255,255,255,0.3)", border: "none", padding: "0.85rem 2rem", fontWeight: 700, cursor: voted.length > 0 ? "pointer" : "default", transition: "all 0.2s" }}
          >
            Submit Vote
          </button>
        )}
        {hasVoted && !poll.isClosed && <p style={{ ...MONO, fontSize: "11px", color: "rgba(140,255,140,0.6)", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.4rem" }}><Check size={14} /> Your vote has been recorded.</p>}
        {poll.isClosed && <p style={{ ...MONO, fontSize: "11px", color: "rgba(255,100,100,0.5)", letterSpacing: "0.1em" }}>This poll is closed.</p>}
      </div>
    </div>
  );
}
