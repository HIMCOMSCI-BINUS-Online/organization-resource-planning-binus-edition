"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import type { DocumentRow } from "@/app/lib/queries";
import DocumentModal from "./DocumentModal";

const cx: React.CSSProperties = {
  maxWidth: "1280px", marginLeft: "auto", marginRight: "auto",
  paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", width: "100%",
};
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function KnowledgeClient({
  docs,
  categories,
  initialSearch,
  initialCategory,
}: {
  docs: DocumentRow[];
  categories: string[];
  initialSearch: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(
        gridRef.current ? Array.from(gridRef.current.children) : [],
        { y: 18, opacity: 0, stagger: 0.05, duration: 0.45 },
        "-=0.4"
      );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      startTransition(() => {
        router.push(`/dashboard/knowledge?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, category, router]);

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Knowledge</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>{docs.length} docs</span>
            <button
              onClick={() => setShowModal(true)}
              style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + New Doc
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search docs..."
            style={{ ...MONO, flex: "1 1 220px", minWidth: 0, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "12px", letterSpacing: "0.04em", padding: "0.6rem 0.75rem", outline: "none" }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...MONO, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.25)", color: category ? "#fff" : "rgba(255,255,255,0.3)", fontSize: "12px", letterSpacing: "0.04em", padding: "0.6rem 0.75rem", outline: "none", cursor: "pointer" }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Grid */}
        {docs.length === 0 ? (
          <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "4rem 0", letterSpacing: "0.1em" }}>
            No documents found.
          </div>
        ) : (
          <div
            ref={gridRef}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}
          >
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <DocumentModal
          doc={null}
          categories={categories}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function DocCard({ doc }: { doc: DocumentRow }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" });
    }
  }, []);

  return (
    <Link
      ref={ref}
      href={`/dashboard/knowledge/${doc.slug}`}
      style={{
        display: "block", background: "#000", padding: "1.5rem", textDecoration: "none",
        borderTop: "1px solid rgba(255,255,255,0.07)", transition: "background 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#000")}
    >
      <p style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.6rem" }}>{doc.category}</p>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: "0.75rem" }}>{doc.title}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{doc.author.name.split(" ")[0]}</span>
        <span style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>
          {new Date(doc.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      </div>
    </Link>
  );
}
