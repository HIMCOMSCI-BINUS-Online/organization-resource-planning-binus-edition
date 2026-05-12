"use client";

import { useRef, useEffect, useActionState } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import { createEvent, updateEvent } from "@/app/actions/events";
import type { EventRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
  borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontFamily: "var(--font-mono)",
  fontSize: "13px", letterSpacing: "0.04em", padding: "0.7rem 0.65rem", outline: "none",
};

export default function EventModal({ event, onClose }: { event: EventRow | null; onClose: () => void }) {
  const isEdit = !!event;
  const serverAction = isEdit ? updateEvent.bind(null, event.id) : createEvent;
  const [state, formAction, pending] = useActionState<FormState, FormData>(serverAction, undefined);
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

  const fmtDate = (d: Date | null | undefined) => d ? new Date(d).toISOString().slice(0, 16) : "";

  return (
    <>
      <div ref={overlayRef} onClick={close} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)" }} />
      <div ref={modalRef} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "min(560px,95vw)", maxHeight: "90vh", overflowY: "auto", background: "#000", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#000" }}>
          <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{isEdit ? "Edit Event" : "New Event"}</span>
          <button onClick={close} style={{ ...MONO, fontSize: "16px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}><X size={16} style={{ display: "block" }} /></button>
        </div>
        <form action={formAction} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {state?.message && state.message !== "ok" && <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.2)", padding: "0.6rem 0.75rem" }}>{state.message}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Title *</label>
            <input name="title" defaultValue={event?.title} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
            {state?.errors?.title && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{state.errors.title[0]}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Description</label>
            <textarea name="description" defaultValue={event?.description ?? ""} rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Location</label>
            <input name="location" defaultValue={event?.location ?? ""} placeholder="e.g. Meeting Room A, Online" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Start Date *</label>
              <input name="startDate" type="datetime-local" defaultValue={fmtDate(event?.startDate)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
              {state?.errors?.startDate && <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{state.errors.startDate[0]}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>End Date</label>
              <input name="endDate" type="datetime-local" defaultValue={fmtDate(event?.endDate)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button type="submit" disabled={pending} style={{ flex: 1, ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: pending ? "rgba(255,255,255,0.1)" : "#fff", color: pending ? "rgba(255,255,255,0.3)" : "#000", border: "none", padding: "0.8rem", fontWeight: 700 }}>
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button type="button" onClick={close} style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.8rem 1.25rem" }}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
