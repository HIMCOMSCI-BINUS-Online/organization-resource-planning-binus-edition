"use client";

import { useRef, useEffect, useActionState, useState } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import { createPoll } from "@/app/actions/polls";
import type { FormState } from "@/app/lib/definitions";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
  borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontFamily: "var(--font-mono)",
  fontSize: "13px", letterSpacing: "0.04em", padding: "0.7rem 0.65rem", outline: "none",
};

export default function PollModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createPoll, undefined);
  const [options, setOptions] = useState(["", ""]);
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

  return (
    <>
      <div ref={overlayRef} onClick={close} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)" }} />
      <div ref={modalRef} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "min(560px,95vw)", maxHeight: "90vh", overflowY: "auto", background: "#000", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#000" }}>
          <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>New Poll</span>
          <button onClick={close} style={{ ...MONO, fontSize: "16px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><X size={16} style={{ display: "block" }} /></button>
        </div>
        <form action={formAction} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {state?.message && state.message !== "ok" && <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.2)", padding: "0.6rem 0.75rem" }}>{state.message}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Question *</label>
            <input name="title" placeholder="What do you want to ask?" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
            {state?.errors?.title && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{state.errors.title[0]}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Description</label>
            <textarea name="description" rows={2} style={{ ...inputStyle, resize: "vertical" }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Options * (min 2)</label>
              {options.length < 8 && (
                <button type="button" onClick={() => setOptions((prev) => [...prev, ""])} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem" }}>+ Add</button>
              )}
            </div>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input name="options" value={opt} onChange={(e) => setOptions((prev) => prev.map((o, j) => j === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} style={{ ...inputStyle, flex: 1 }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
                {options.length > 2 && (
                  <button type="button" onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.4)", background: "transparent", border: "none", padding: "0 0.3rem" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.4)")}><X size={12} /></button>
                )}
              </div>
            ))}
            {state?.errors?.options && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{state.errors.options[0]}</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input type="checkbox" name="isMultipleChoice" id="isMultipleChoice" style={{ accentColor: "#fff", width: "14px", height: "14px" }} />
            <label htmlFor="isMultipleChoice" style={{ ...MONO, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>Allow multiple choices</label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={pending} style={{ flex: 1, ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: pending ? "rgba(255,255,255,0.1)" : "#fff", color: pending ? "rgba(255,255,255,0.3)" : "#000", border: "none", padding: "0.8rem", fontWeight: 700 }}>
              {pending ? "Creating..." : "Create Poll"}
            </button>
            <button type="button" onClick={close} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem 1.25rem" }}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
