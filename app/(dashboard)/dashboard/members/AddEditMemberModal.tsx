"use client";

import { useRef, useEffect, useActionState, startTransition } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import { createMember, updateMember } from "@/app/actions/members";
import type { MemberRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  borderBottom: "1px solid rgba(255,255,255,0.25)",
  color: "#fff",
  ...MONO,
  fontSize: "13px",
  letterSpacing: "0.04em",
  padding: "0.7rem 0.65rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#111",
  cursor: "pointer",
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required,
  errors,
  as: As = "input",
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  errors?: string[];
  as?: "input" | "textarea";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label htmlFor={id} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>
        {label}{required && " *"}
      </label>
      {As === "textarea" ? (
        <textarea
          id={id}
          name={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
          onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.6)")}
          onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")}
        />
      )}
      {errors && (
        <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{errors[0]}</span>
      )}
    </div>
  );
}

export default function AddEditMemberModal({
  member,
  roles,
  onClose,
  onSaved,
}: {
  member?: MemberRow;
  roles: { id: string; name: string }[];
  onClose: () => void;
  onSaved?: (m: MemberRow) => void;
}) {
  const isEdit = !!member;

  const boundUpdateMember = member
    ? updateMember.bind(null, member.id)
    : createMember;

  const [state, action, pending] = useActionState<FormState, FormData>(
    boundUpdateMember,
    undefined
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      modalRef.current,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power4.out" }
    );
  }, []);

  // Close on success
  useEffect(() => {
    if (state?.message === "ok") onClose();
  }, [state, onClose]);

  function close() {
    gsap.to(modalRef.current, { y: 16, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: onClose });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  }

  const errors = state?.errors ?? {};

  return (
    <>
      <div
        ref={overlayRef}
        onClick={close}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)" }}
      />
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          width: "min(600px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#000",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Modal header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#000", zIndex: 1 }}>
          <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            {isEdit ? "Edit Member" : "Add Member"}
          </span>
          <button
            onClick={close}
            style={{ ...MONO, fontSize: "16px", color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", lineHeight: 1, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            <X size={16} style={{ display: "block" }} />
          </button>
        </div>

        <form
          action={action}
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {state?.message && state.message !== "ok" && (
            <div style={{ ...MONO, fontSize: "12px", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.2)", padding: "0.6rem 0.75rem" }}>
              {state.message}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field id="memberId" label="Member ID" placeholder="e.g. USR-001" defaultValue={member?.memberId} required errors={errors.nim} />
            <Field id="name" label="Full Name" placeholder="Full name" defaultValue={member?.name} required errors={errors.name} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field id="email" label="Email" type="email" placeholder="you@binus.ac.id" defaultValue={member?.email} required errors={errors.email} />
            <Field id="phone" label="Phone" type="tel" placeholder="+62..." defaultValue={member?.phone ?? ""} errors={errors.phone} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field id="division" label="Division" placeholder="e.g. Tech, Creative" defaultValue={member?.division ?? ""} />
            <Field id="batch" label="Batch" placeholder="e.g. 2023" defaultValue={member?.batch ?? ""} />
          </div>

          {/* Role select */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="roleId" style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Role *
            </label>
            <select
              id="roleId"
              name="roleId"
              defaultValue={member?.role.id ?? ""}
              style={selectStyle}
            >
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.roleId && (
              <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,80,80,0.8)" }}>{errors.roleId[0]}</span>
            )}
          </div>

          <Field
            id="bio"
            label="Bio"
            placeholder="Short bio or description..."
            defaultValue={member?.bio ?? ""}
            as="textarea"
          />

          <Field
            id="password"
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            placeholder="••••••••"
            required={!isEdit}
            errors={errors.password}
          />

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                flex: 1,
                ...MONO,
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: pending ? "rgba(255,255,255,0.1)" : "#fff",
                color: pending ? "rgba(255,255,255,0.3)" : "#000",
                border: "none",
                padding: "0.8rem",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Member"}
            </button>
            <button
              type="button"
              onClick={close}
              style={{
                ...MONO,
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: "transparent",
                color: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0.8rem 1.25rem",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
