"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import type { ReportStats } from "@/app/lib/queries";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ReportsClient({ stats }: { stats: ReportStats }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(sectionsRef.current ? Array.from(sectionsRef.current.children) : [], { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.35");
  }, []);

  const taskRate = stats.tasks.total > 0 ? Math.round((stats.tasks.done / stats.tasks.total) * 100) : 0;
  const memberRate = stats.members.total > 0 ? Math.round((stats.members.active / stats.members.total) * 100) : 0;
  const assetRate = stats.assets.total > 0 ? Math.round((stats.assets.available / stats.assets.total) * 100) : 0;

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Reports</h1>
        </div>

        <div ref={sectionsRef} style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.07)" }}>

          {/* Members */}
          <ReportSection title="Members" index="01">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total Members" value={String(stats.members.total)} />
              <StatCell label="Active" value={String(stats.members.active)} color="rgba(140,255,140,0.7)" />
              <StatCell label="Inactive" value={String(stats.members.total - stats.members.active)} color="rgba(255,100,100,0.5)" />
              <StatCell label="Active Rate" value={`${memberRate}%`} color="rgba(255,255,255,0.6)" />
            </div>
            {stats.members.byRole.length > 0 && (
              <div style={{ marginTop: "1px", background: "#000", padding: "1rem 1.25rem" }}>
                <p style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem" }}>By Role</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  {stats.members.byRole.map((r) => (
                    <div key={r.name} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{r.name}</span>
                      <span style={{ ...MONO, fontSize: "12px", fontWeight: 700, color: "#fff" }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ReportSection>

          {/* Finances */}
          <ReportSection title="Finances" index="02">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total Income" value={fmtCurrency(stats.ledger.totalIncome)} color="rgba(140,255,140,0.7)" />
              <StatCell label="Total Expenses" value={fmtCurrency(stats.ledger.totalExpense)} color="rgba(255,100,100,0.6)" />
              <StatCell label="Balance" value={fmtCurrency(stats.ledger.balance)} color={stats.ledger.balance >= 0 ? "rgba(140,255,140,0.7)" : "rgba(255,100,100,0.7)"} />
            </div>
          </ReportSection>

          {/* Tasks */}
          <ReportSection title="Tasks" index="03">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total Tasks" value={String(stats.tasks.total)} />
              <StatCell label="Completed" value={String(stats.tasks.done)} color="rgba(140,255,140,0.7)" />
              <StatCell label="Overdue" value={String(stats.tasks.overdue)} color={stats.tasks.overdue > 0 ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.4)"} />
              <StatCell label="Completion Rate" value={`${taskRate}%`} color="rgba(255,255,255,0.6)" />
            </div>
            {stats.tasks.total > 0 && (
              <div style={{ background: "#000", padding: "1rem 1.25rem", marginTop: "1px" }}>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.07)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${taskRate}%`, background: "rgba(140,255,140,0.5)", transition: "width 1s ease-out" }} />
                </div>
              </div>
            )}
          </ReportSection>

          {/* Events & Attendance */}
          <ReportSection title="Events & Attendance" index="04">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total Events" value={String(stats.events.total)} />
              <StatCell label="Attendance Records" value={String(stats.events.totalAttendances)} color="rgba(100,180,255,0.7)" />
              <StatCell label="Avg. per Event" value={stats.events.total > 0 ? fmt(Math.round(stats.events.totalAttendances / stats.events.total)) : "—"} color="rgba(255,255,255,0.5)" />
            </div>
          </ReportSection>

          {/* Assets */}
          <ReportSection title="Assets" index="05">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total Assets" value={String(stats.assets.total)} />
              <StatCell label="Available" value={String(stats.assets.available)} color="rgba(140,255,140,0.7)" />
              <StatCell label="In Use" value={String(stats.assets.inUse)} color="rgba(255,200,80,0.7)" />
              <StatCell label="Availability Rate" value={`${assetRate}%`} color="rgba(255,255,255,0.5)" />
            </div>
          </ReportSection>

          {/* Announcements */}
          <ReportSection title="Announcements" index="06">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
              <StatCell label="Total" value={String(stats.announcements.total)} />
              <StatCell label="Active" value={String(stats.announcements.active)} color="rgba(140,255,140,0.7)" />
              <StatCell label="Expired" value={String(stats.announcements.total - stats.announcements.active)} color="rgba(255,255,255,0.25)" />
            </div>
          </ReportSection>

        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, index, children }: { title: string; index: string; children: React.ReactNode }) {
  const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  return (
    <div style={{ background: "#000" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>{index}</span>
        <h2 style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</h2>
      </div>
      <div style={{ padding: "1px" }}>{children}</div>
    </div>
  );
}

function StatCell({ label, value, color = "#fff" }: { label: string; value: string; color?: string }) {
  const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  return (
    <div style={{ background: "#000", padding: "1.25rem" }}>
      <p style={{ fontSize: "1.6rem", fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.35rem" }}>{value}</p>
      <p style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}
