"use client";

import { useRef, useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { deleteLedgerEntry } from "@/app/actions/ledger";
import type { LedgerSummary, LedgerEntryRow } from "@/app/lib/queries";
import LedgerEntryModal from "./LedgerEntryModal";

const cx: React.CSSProperties = {
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
  paddingRight: "clamp(1.25rem, 4vw, 3rem)",
  width: "100%",
};
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

function AnimatedBalance({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prevValue.current;
    prevValue.current = value;
    const obj = { val: from };
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power3.out",
      onUpdate() {
        if (!el) return;
        const v = Math.round(obj.val);
        el.textContent = new Intl.NumberFormat("id-ID").format(v);
      },
    });
  }, [value]);

  return <span ref={ref}>{new Intl.NumberFormat("id-ID").format(value)}</span>;
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

type TypeFilter = "ALL" | "INCOME" | "EXPENSE";

export default function LedgerClient({
  summary,
  categories,
  initialSearch,
  initialType,
  initialCategory,
  page,
}: {
  summary: LedgerSummary;
  categories: string[];
  initialSearch: string;
  initialType: TypeFilter;
  initialCategory: string;
  page: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isPending, startDelete] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntryRow | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(balanceRef.current ? Array.from(balanceRef.current.children) : [], { y: 18, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.35")
      .from(controlsRef.current, { y: 14, opacity: 0, duration: 0.45 }, "-=0.25")
      .from(tableRef.current, { y: 10, opacity: 0, duration: 0.4 }, "-=0.2");
  }, []);

  const pushFilters = useCallback(
    (overrides: Partial<{ search: string; type: TypeFilter; category: string; page: number }>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const t = overrides.type ?? typeFilter;
      const c = overrides.category ?? categoryFilter;
      const p = overrides.page ?? 1;
      if (s) params.set("search", s);
      if (t !== "ALL") params.set("type", t);
      if (c) params.set("category", c);
      if (p > 1) params.set("page", String(p));
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [search, typeFilter, categoryFilter, pathname, router]
  );

  useEffect(() => {
    const t = setTimeout(() => pushFilters({ search }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const perPage = 25;
  const totalPages = Math.ceil(summary.total / perPage);

  const inputStyle: React.CSSProperties = {
    ...MONO, background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "12px",
    letterSpacing: "0.04em", padding: "0.6rem 0.75rem", outline: "none", width: "100%",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: "#000", cursor: "pointer" };

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Buku Kas</h1>
          </div>
          <button
            onClick={() => { setEditingEntry(null); setShowModal(true); }}
            style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + Add Entry
          </button>
        </div>

        {/* Balance cards */}
        <div ref={balanceRef} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "2rem" }}>
          {[
            { label: "Total Income", value: summary.totalIncome, color: "rgba(140,255,140,0.8)" },
            { label: "Total Expense", value: summary.totalExpense, color: "rgba(255,100,100,0.8)" },
            { label: "Balance", value: summary.balance, color: summary.balance >= 0 ? "#fff" : "rgba(255,100,100,0.8)" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#000", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem" }}>{card.label}</p>
              <p style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.04em", color: card.color, lineHeight: 1 }}>
                Rp <AnimatedBalance value={card.value} />
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div ref={controlsRef} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", marginBottom: "1rem", alignItems: "end" }}>
          <input type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
          <select value={typeFilter} onChange={(e) => { const v = e.target.value as TypeFilter; setTypeFilter(v); pushFilters({ type: v }); }} style={selectStyle}>
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); pushFilters({ category: e.target.value }); }} style={selectStyle}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", marginBottom: "1rem" }}>{summary.total} {summary.total === 1 ? "entry" : "entries"}</p>

        {/* Table */}
        <div ref={tableRef} style={{ border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1.2fr 1fr auto", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["Date", "Title", "Category", "Amount", "Type", ""].map((h) => (
              <span key={h} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{h}</span>
            ))}
          </div>

          {summary.entries.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>No entries found.</p>
            </div>
          ) : (
            summary.entries.map((entry, idx) => (
              <div
                key={entry.id}
                style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1.2fr 1fr auto", padding: "0.85rem 1rem", borderBottom: idx === summary.entries.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)", alignItems: "center", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  {new Date(entry.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{entry.title}</p>
                  {entry.description && <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{entry.description}</p>}
                </div>
                <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>{entry.category}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: entry.type === "INCOME" ? "rgba(140,255,140,0.85)" : "rgba(255,100,100,0.85)", letterSpacing: "-0.01em" }}>
                  {entry.type === "INCOME" ? "+" : "-"}Rp {formatIDR(entry.amount)}
                </span>
                <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: entry.type === "INCOME" ? "rgba(140,255,140,0.5)" : "rgba(255,100,100,0.5)", border: "1px solid", borderColor: entry.type === "INCOME" ? "rgba(140,255,140,0.15)" : "rgba(255,100,100,0.15)", padding: "0.2rem 0.45rem", width: "fit-content" }}>
                  {entry.type}
                </span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => { setEditingEntry(entry); setShowModal(true); }} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", padding: "0.25rem 0.5rem", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>Edit</button>
                  <button disabled={isPending} onClick={() => startDelete(async () => { await deleteLedgerEntry(entry.id); })} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.5)", background: "transparent", border: "1px solid rgba(255,80,80,0.1)", padding: "0.25rem 0.5rem", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,80,80,0.9)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.3)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,80,80,0.5)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.1)"; }}>Del</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => pushFilters({ page: p })} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.15em", padding: "0.3rem 0.6rem", background: p === page ? "#fff" : "transparent", color: p === page ? "#000" : "rgba(255,255,255,0.3)", border: "1px solid", borderColor: p === page ? "#fff" : "rgba(255,255,255,0.1)" }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <LedgerEntryModal
          entry={editingEntry}
          categories={categories}
          onClose={() => { setShowModal(false); setEditingEntry(null); }}
        />
      )}
    </div>
  );
}
