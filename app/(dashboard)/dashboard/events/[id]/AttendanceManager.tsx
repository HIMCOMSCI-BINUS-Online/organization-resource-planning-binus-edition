"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { ArrowLeft, Check, X, Minus } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { upsertAttendance, bulkCreateAttendance } from "@/app/actions/events";
import type { EventFull, MemberRow } from "@/app/lib/queries";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const STATUS_COLORS = {
  PRESENT: "rgba(140,255,140,0.7)",
  ABSENT: "rgba(255,100,100,0.7)",
  EXCUSED: "rgba(255,200,80,0.7)",
};

type AttStatus = "PRESENT" | "ABSENT" | "EXCUSED";

export default function AttendanceManager({ event, members }: { event: EventFull; members: MemberRow[] }) {
  const [attendances, setAttendances] = useState(
    new Map(event.attendances.map((a) => [a.user.id, { status: a.status as AttStatus, note: a.note }]))
  );
  const [, startTransition] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(tableRef.current, { y: 16, opacity: 0, duration: 0.5 }, "-=0.3");
  }, []);

  function setStatus(userId: string, status: AttStatus) {
    setAttendances((prev) => {
      const next = new Map(prev);
      next.set(userId, { status, note: prev.get(userId)?.note ?? null });
      return next;
    });
    startTransition(() => { upsertAttendance(event.id, userId, status); });
  }

  function markAll(status: AttStatus) {
    const newMap = new Map<string, { status: AttStatus; note: string | null }>();
    members.forEach((m) => newMap.set(m.id, { status, note: null }));
    setAttendances(newMap);
    startTransition(() => { bulkCreateAttendance(event.id, members.map((m) => m.id)); });
  }

  const present = [...attendances.values()].filter((a) => a.status === "PRESENT").length;
  const absent = [...attendances.values()].filter((a) => a.status === "ABSENT").length;
  const excused = [...attendances.values()].filter((a) => a.status === "EXCUSED").length;
  const rate = members.length > 0 ? Math.round((present / members.length) * 100) : 0;

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard/events" style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", marginBottom: "1.5rem", display: "inline-block" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)")}><ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />Events</Link>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem" }}>Attendance</p>
              <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2.4rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: "0.4rem" }}>{event.title}</h1>
              <p style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                {new Date(event.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                {event.location && ` · ${event.location}`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["PRESENT", "ABSENT", "EXCUSED"] as AttStatus[]).map((s) => (
                <button key={s} onClick={() => markAll(s)} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", background: "transparent", color: STATUS_COLORS[s], border: `1px solid ${STATUS_COLORS[s].replace("0.7", "0.2")}`, padding: "0.4rem 0.75rem", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = STATUS_COLORS[s].replace("0.7", "0.1"))} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  All {s}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { label: "Present", value: present, color: STATUS_COLORS.PRESENT },
              { label: "Absent", value: absent, color: STATUS_COLORS.ABSENT },
              { label: "Excused", value: excused, color: STATUS_COLORS.EXCUSED },
              { label: "Rate", value: `${rate}%`, color: "rgba(255,255,255,0.6)" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.value}</p>
                <p style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.2rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Member rows */}
        <div ref={tableRef} style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "0.7rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Member</span>
            <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Status</span>
          </div>
          {members.map((m) => {
            const att = attendances.get(m.id);
            const status = att?.status;
            return (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "0.85rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "0.15rem" }}>{m.name}</p>
                  <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{m.memberId}{m.division ? ` · ${m.division}` : ""}</p>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {(["PRESENT", "ABSENT", "EXCUSED"] as AttStatus[]).map((s) => (
                    <button key={s} onClick={() => setStatus(m.id, s)} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", background: status === s ? STATUS_COLORS[s].replace("0.7", "0.15") : "transparent", color: status === s ? STATUS_COLORS[s] : "rgba(255,255,255,0.2)", border: `1px solid ${status === s ? STATUS_COLORS[s].replace("0.7", "0.3") : "rgba(255,255,255,0.08)"}`, padding: "0.25rem 0.5rem", cursor: "pointer", transition: "all 0.15s" }}>
                      {s === "PRESENT" ? <Check size={14} /> : s === "ABSENT" ? <X size={14} /> : <Minus size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "3rem 0" }}>No active members found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
