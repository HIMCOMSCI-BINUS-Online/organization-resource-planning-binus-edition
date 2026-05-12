"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { gsap } from "gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteAnnouncement, togglePin } from "@/app/actions/announcements";
import type { AnnouncementRow } from "@/app/lib/queries";
import AnnouncementModal from "./AnnouncementModal";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function AnnouncementsClient({ announcements: initial }: { announcements: AnnouncementRow[] }) {
  const [announcements, setAnnouncements] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(listRef.current ? Array.from(listRef.current.children) : [], { y: 16, opacity: 0, stagger: 0.06, duration: 0.5 }, "-=0.35");
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    startTransition(() => { deleteAnnouncement(id); });
  }

  function handleTogglePin(id: string, isPinned: boolean) {
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, isPinned: !isPinned } : a));
    startTransition(() => { togglePin(id, !isPinned); });
  }

  const pinned = announcements.filter((a) => a.isPinned);
  const regular = announcements.filter((a) => !a.isPinned);
  const sorted = [...pinned, ...regular];

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Announcements</h1>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >+ New Announcement</button>
        </div>

        {sorted.length === 0 ? (
          <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "4rem 0", letterSpacing: "0.1em" }}>No announcements yet.</p>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
            {sorted.map((a) => (
              <AnnouncementRow
                key={a.id}
                announcement={a}
                isExpanded={expanded === a.id}
                onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                onEdit={() => { setEditing(a); setShowModal(true); }}
                onDelete={() => handleDelete(a.id)}
                onTogglePin={() => handleTogglePin(a.id, a.isPinned)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AnnouncementModal
          announcement={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function AnnouncementRow({
  announcement: a, isExpanded, onToggle, onEdit, onDelete, onTogglePin,
}: {
  announcement: AnnouncementRow;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const isExpired = a.expiresAt && new Date(a.expiresAt) < new Date();

  return (
    <div style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div
        style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "flex-start", gap: "1rem", cursor: "pointer" }}
        onClick={onToggle}
      >
        {a.isPinned && (
          <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.15rem 0.4rem", letterSpacing: "0.2em", textTransform: "uppercase", flexShrink: 0, marginTop: "2px" }}>PIN</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: isExpired ? "rgba(255,255,255,0.3)" : "#fff", letterSpacing: "-0.01em", marginBottom: "0.3rem" }}>
            {a.title}
            {isExpired && <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,100,100,0.6)", marginLeft: "0.6rem", letterSpacing: "0.15em" }}>EXPIRED</span>}
          </p>
          <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
            {a.author.name} · {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {a.expiresAt && !isExpired && <span style={{ marginLeft: "0.75rem", color: "rgba(255,200,80,0.6)" }}>Expires {new Date(a.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onTogglePin} style={{ ...MONO, fontSize: "9px", color: a.isPinned ? "rgba(255,200,80,0.8)" : "rgba(255,255,255,0.2)", background: "transparent", border: "none", padding: "0.2rem 0.4rem" }} title={a.isPinned ? "Unpin" : "Pin"}>⊕</button>
          <button onClick={onEdit} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", padding: "0.2rem 0.4rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}><Pencil size={12} /></button>
          <button onClick={onDelete} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.3)", background: "transparent", border: "none", padding: "0.2rem 0.4rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.3)")}><X size={12} /></button>
        </div>
      </div>
      {isExpanded && (
        <div style={{ padding: "0 1.5rem 1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ paddingTop: "1rem", color: "rgba(255,255,255,0.7)", fontSize: "13px", lineHeight: 1.8 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
