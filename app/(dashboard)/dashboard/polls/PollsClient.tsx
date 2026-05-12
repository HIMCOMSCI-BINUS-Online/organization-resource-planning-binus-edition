"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { deletePoll, closePoll } from "@/app/actions/polls";
import type { PollRow } from "@/app/lib/queries";
import PollModal from "./PollModal";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function PollsClient({ polls: initial }: { polls: PollRow[] }) {
  const [polls, setPolls] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(listRef.current ? Array.from(listRef.current.children) : [], { y: 14, opacity: 0, stagger: 0.06, duration: 0.5 }, "-=0.35");
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this poll?")) return;
    setPolls((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => { deletePoll(id); });
  }

  function handleClose(id: string, isClosed: boolean) {
    setPolls((prev) => prev.map((p) => p.id === id ? { ...p, isClosed: !isClosed } : p));
    startTransition(() => { closePoll(id, !isClosed); });
  }

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Polls</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>{polls.length} total</span>
            <button onClick={() => setShowModal(true)} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>+ New Poll</button>
          </div>
        </div>

        {polls.length === 0 ? (
          <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "4rem 0", letterSpacing: "0.1em" }}>No polls yet.</p>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
            {polls.map((p) => (
              <div key={p.id} style={{ background: "#000", padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <Link href={`/dashboard/polls/${p.id}`} style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", textDecoration: "none" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}>{p.title}</Link>
                    {p.isClosed && <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,100,100,0.7)", border: "1px solid rgba(255,100,100,0.2)", padding: "0.1rem 0.35rem" }}>Closed</span>}
                    {p.isMultipleChoice && <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(100,180,255,0.6)", border: "1px solid rgba(100,180,255,0.15)", padding: "0.1rem 0.35rem" }}>Multi</span>}
                  </div>
                  <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
                    {p._count.options} options · {p._count.votes} votes · by {p.creator.name.split(" ")[0]} · {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button onClick={() => handleClose(p.id, p.isClosed)} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: p.isClosed ? "rgba(140,255,140,0.6)" : "rgba(255,200,80,0.6)", background: "transparent", border: `1px solid ${p.isClosed ? "rgba(140,255,140,0.15)" : "rgba(255,200,80,0.15)"}`, padding: "0.25rem 0.5rem", cursor: "pointer" }}>{p.isClosed ? "Reopen" : "Close"}</button>
                  <button onClick={() => handleDelete(p.id)} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.3)", background: "transparent", border: "none", padding: "0.2rem 0.4rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.3)")}><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <PollModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
