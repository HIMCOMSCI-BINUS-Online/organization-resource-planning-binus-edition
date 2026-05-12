"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { deleteEvent } from "@/app/actions/events";
import type { EventRow } from "@/app/lib/queries";
import EventModal from "./EventModal";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isUpcoming(d: Date) { return new Date(d) >= new Date(); }

export default function EventsClient({ events: initial }: { events: EventRow[] }) {
  const [events, setEvents] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [, startTransition] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(gridRef.current ? Array.from(gridRef.current.children) : [], { y: 18, opacity: 0, stagger: 0.07, duration: 0.5 }, "-=0.35");
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    startTransition(() => { deleteEvent(id); });
  }

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Events</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>{events.length} total</span>
            <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>+ New Event</button>
          </div>
        </div>

        {events.length === 0 ? (
          <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "4rem 0", letterSpacing: "0.1em" }}>No events yet.</p>
        ) : (
          <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ background: "#000", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", transition: "background 0.15s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)")} onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#000")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: isUpcoming(ev.startDate) ? "rgba(140,255,140,0.7)" : "rgba(255,255,255,0.2)", border: "1px solid", borderColor: isUpcoming(ev.startDate) ? "rgba(140,255,140,0.2)" : "rgba(255,255,255,0.08)", padding: "0.15rem 0.4rem" }}>
                    {isUpcoming(ev.startDate) ? "Upcoming" : "Past"}
                  </span>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button onClick={() => { setEditing(ev); setShowModal(true); }} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", padding: "0.15rem 0.3rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(ev.id)} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.3)", background: "transparent", border: "none", padding: "0.15rem 0.3rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.3)")}><X size={12} /></button>
                  </div>
                </div>
                <Link href={`/dashboard/events/${ev.id}`} style={{ textDecoration: "none" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: "0.5rem" }}>{ev.title}</p>
                  <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "0.75rem" }}>{fmtDate(ev.startDate)}{ev.endDate ? ` → ${fmtDate(ev.endDate)}` : ""}</p>
                  {ev.location && <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.25)", marginBottom: "0.5rem" }}>📍 {ev.location}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>by {ev.creator.name.split(" ")[0]}</span>
                    <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.1rem 0.4rem" }}>{ev._count.attendances} attendees → Manage</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <EventModal event={editing} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
    </div>
  );
}
