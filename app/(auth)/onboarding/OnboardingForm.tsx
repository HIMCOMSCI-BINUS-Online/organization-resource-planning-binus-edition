"use client";

import { useActionState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { setupSuperAdmin } from "@/app/actions/auth";
import type { FormState } from "@/app/lib/definitions";

const cx: React.CSSProperties = {
  maxWidth: "480px",
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.5rem, 5vw, 2.5rem)",
  paddingRight: "clamp(1.5rem, 5vw, 2.5rem)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.12)",
  borderBottom: "1px solid rgba(255,255,255,0.3)",
  color: "#fff",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  letterSpacing: "0.05em",
  padding: "0.85rem 0.75rem",
  outline: "none",
  transition: "border-color 0.2s",
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  errors,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  errors?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.3)")}
      />
      {errors && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,80,80,0.8)" }}>
          {errors[0]}
        </span>
      )}
    </div>
  );
}

export default function OnboardingForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    setupSuperAdmin,
    undefined
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 30, opacity: 0, duration: 0.9, delay: 0.1 })
      .from(stepRef.current, { y: 16, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(formRef.current, { y: 20, opacity: 0, duration: 0.7 }, "-=0.3");
  }, []);

  const errors = state?.errors as Record<string, string[]> | undefined;

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "2rem",
        paddingBottom: "2rem",
        position: "relative",
      }}
    >
      <div className="noise-overlay" />

      <div style={cx}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "0.75rem",
            }}
          >
            First Boot — System Initialization
          </p>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            Create Super Admin
          </h1>
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.12)",
              margin: "1rem 0",
              width: "100%",
            }}
          />
        </div>

        {/* Step label */}
        <div ref={stepRef} style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            $ init --role=&quot;Super Admin&quot; --seed-roles
          </p>
        </div>

        {state?.message && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "rgba(255,80,80,0.9)",
              border: "1px solid rgba(255,80,80,0.2)",
              padding: "0.6rem 0.75rem",
              marginBottom: "1rem",
            }}
          >
            {state.message}
          </div>
        )}

        <form
          ref={formRef}
          action={action}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <Field
            id="memberId"
            label="Member ID"
            placeholder="e.g. 2501234567"
            autoComplete="off"
            errors={errors?.memberId}
          />
          <Field
            id="name"
            label="Full Name"
            placeholder="Your full name"
            autoComplete="name"
            errors={errors?.name}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@binus.ac.id"
            autoComplete="email"
            errors={errors?.email}
          />

          {/* Password row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Field
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              errors={errors?.password}
            />
            <Field
              id="confirmPassword"
              label="Confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              errors={errors?.confirmPassword}
            />
          </div>

          {/* Roles that will be seeded */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
                marginBottom: "0.5rem",
              }}
            >
              Roles that will be seeded
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {["Super Admin", "Secretary", "Bendahara", "Pengajar", "Member"].map((r) => (
                <span
                  key={r}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: r === "Super Admin" ? "#fff" : "rgba(255,255,255,0.3)",
                    border: "1px solid",
                    borderColor: r === "Super Admin" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
                    padding: "0.2rem 0.5rem",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.85rem",
              background: pending ? "rgba(255,255,255,0.05)" : "#fff",
              color: pending ? "rgba(255,255,255,0.3)" : "#000",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.3)",
              transition: "all 0.2s",
              cursor: pending ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!pending) e.currentTarget.style.background = "rgba(255,255,255,0.88)";
            }}
            onMouseLeave={(e) => {
              if (!pending) e.currentTarget.style.background = "#fff";
            }}
          >
            {pending ? "Initializing System..." : "Initialize ORP →"}
          </button>
        </form>
      </div>
    </div>
  );
}
