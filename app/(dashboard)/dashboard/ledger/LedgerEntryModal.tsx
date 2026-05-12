"use client";

import { useRef, useEffect, useActionState } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import { createLedgerEntry, updateLedgerEntry } from "@/app/actions/ledger";
import type { LedgerEntryRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
  borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", ...MONO,
  fontSize: "13px", letterSpacing: "0.04em", padding: "0.7rem 0.65rem", outline: "none",
};
const selectStyle: React.CSSProperties = { ...inputStyle, background: "#111", cursor: "pointer" };

function Field({ id, label, type = "text", placeholder, defaultValue, required, errors }: {
  id: string; label: string; type?: string; placeholder?: string;
  defaultValue?: string; required?: boolean; errors?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label htmlFor={id} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>
        {label}{required && " *"}
      </label>
      <input id={id} name={id} type={type} placeholder={placeholder} defaultValue={defaultValue} style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
      {errors && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{errors[0]}</span>}
    </div>
  );
}

export default function LedgerEntryModal({ entry, categories, onClose }: {
  entry: LedgerEntryRow | null; categories: string[]; onClose: () => void;
}) {
  const isEdit = !!entry;
  const action = isEdit ? updateLedgerEntry.bind(null, entry.id) : createLedgerEntry;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(modalRef.current, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power4.out" });
  }, []);

  useEffect(() => { if (state?.message === "ok") onClose(); }, [state, onClose]);

  function close() {
    gsap.to(modalRef.current, { y: 16, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: onClose });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  }

  const errors = state?.errors ?? {};
  const defaultDate = entry ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return (
    <>
      <div ref={overlayRef} onClick={close} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)" }} />
      <div ref={modalRef} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "min(520px,95vw)", maxHeight: "90vh", overflowY: "auto", background: "#000", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#000", zIndex: 1 }}>
          <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{isEdit ? "Edit Entry" : "New Entry"}</span>
          <button onClick={close} style={{ ...MONO, fontSize: "16px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", lineHeight: 1 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><X size={16} style={{ display: "block" }} /></button>
        </div>

        <form action={formAction} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {state?.message && state.message !== "ok" && (
            <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.2)", padding: "0.6rem 0.75rem" }}>{state.message}</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field id="date" label="Date" type="date" defaultValue={defaultDate} required errors={errors.date} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="type" style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Type *</label>
              <select id="type" name="type" defaultValue={entry?.type ?? "INCOME"} style={selectStyle}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
              {errors.type && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{errors.type[0]}</span>}
            </div>
          </div>

          <Field id="title" label="Title" placeholder="e.g. Iuran Anggota Bulan Juni" defaultValue={entry?.title} required errors={errors.title} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="category" style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Category *</label>
              <input id="category" name="category" list="cat-list" placeholder="e.g. Iuran, Konsumsi" defaultValue={entry?.category} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
              <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              {errors.category && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{errors.category[0]}</span>}
            </div>
            <Field id="amount" label="Amount (IDR)" type="number" placeholder="e.g. 150000" defaultValue={entry?.amount.toString()} required errors={errors.amount} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="description" style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Description</label>
            <textarea id="description" name="description" placeholder="Optional notes..." defaultValue={entry?.description ?? ""} rows={2} style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={pending} style={{ flex: 1, ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: pending ? "rgba(255,255,255,0.1)" : "#fff", color: pending ? "rgba(255,255,255,0.3)" : "#000", border: "none", padding: "0.8rem", fontWeight: 700 }}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Entry"}
            </button>
            <button type="button" onClick={close} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem 1.25rem" }}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
