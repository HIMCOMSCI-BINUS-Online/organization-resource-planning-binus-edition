"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { deleteAsset, checkoutAsset, returnAsset } from "@/app/actions/assets";
import type { AssetRow, MemberRow } from "@/app/lib/queries";
import AssetModal from "./AssetModal";

const cx: React.CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", width: "100%" };
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "rgba(140,255,140,0.7)",
  IN_USE: "rgba(255,200,80,0.7)",
  MAINTENANCE: "rgba(100,180,255,0.7)",
  LOST: "rgba(255,100,100,0.7)",
};

export default function AssetsClient({
  assets: initial, categories, members, initialCategory, initialStatus,
}: { assets: AssetRow[]; categories: string[]; members: MemberRow[]; initialCategory: string; initialStatus: string }) {
  const router = useRouter();
  const [assets, setAssets] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AssetRow | null>(null);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [, startTransition] = useTransition();
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(gridRef.current ? Array.from(gridRef.current.children) : [], { y: 18, opacity: 0, stagger: 0.05, duration: 0.45 }, "-=0.35");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    startTransition(() => router.push(`/dashboard/assets?${params.toString()}`));
  }, [category, status, router]);

  function handleDelete(id: string) {
    if (!confirm("Delete this asset?")) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
    startTransition(() => { deleteAsset(id); });
  }

  function handleReturn(id: string) {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, status: "AVAILABLE", currentHolder: null } : a));
    startTransition(() => { returnAsset(id); });
  }

  const available = assets.filter((a) => a.status === "AVAILABLE").length;
  const inUse = assets.filter((a) => a.status === "IN_USE").length;

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={headerRef} style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Assets</h1>
            </div>
            <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>+ New Asset</button>
          </div>

          <div style={{ display: "flex", gap: "2rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.25rem" }}>
            {[
              { label: "Total", value: assets.length, color: "#fff" },
              { label: "Available", value: available, color: STATUS_COLOR.AVAILABLE },
              { label: "In Use", value: inUse, color: STATUS_COLOR.IN_USE },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.value}</p>
                <p style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.2rem" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...MONO, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.25)", color: category ? "#fff" : "rgba(255,255,255,0.3)", fontSize: "12px", padding: "0.5rem 0.75rem", outline: "none", cursor: "pointer" }}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...MONO, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.25)", color: status ? "#fff" : "rgba(255,255,255,0.3)", fontSize: "12px", padding: "0.5rem 0.75rem", outline: "none", cursor: "pointer" }}>
              <option value="">All Statuses</option>
              {["AVAILABLE", "IN_USE", "MAINTENANCE", "LOST"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>

        {assets.length === 0 ? (
          <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "4rem 0", letterSpacing: "0.1em" }}>No assets found.</p>
        ) : (
          <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
            {assets.map((asset) => (
              <div key={asset.id} style={{ background: "#000", padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)", transition: "background 0.15s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)")} onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#000")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: STATUS_COLOR[asset.status], border: `1px solid ${STATUS_COLOR[asset.status].replace("0.7", "0.2")}`, padding: "0.15rem 0.4rem" }}>{asset.status.replace("_", " ")}</span>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button onClick={() => { setEditing(asset); setShowModal(true); }} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", padding: "0.15rem 0.3rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(asset.id)} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.3)", background: "transparent", border: "none", padding: "0.15rem 0.3rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.3)")}><X size={12} /></button>
                  </div>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>{asset.name}</p>
                <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem" }}>{asset.category}{asset.serialNumber ? ` · S/N: ${asset.serialNumber}` : ""}</p>
                {asset.currentHolder && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,200,80,0.6)" }}>Held by {asset.currentHolder.name.split(" ")[0]}</span>
                    <button onClick={() => handleReturn(asset.id)} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(140,255,140,0.6)", background: "transparent", border: "1px solid rgba(140,255,140,0.15)", padding: "0.2rem 0.5rem", cursor: "pointer" }}>Return</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AssetModal asset={editing} members={members} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
    </div>
  );
}
