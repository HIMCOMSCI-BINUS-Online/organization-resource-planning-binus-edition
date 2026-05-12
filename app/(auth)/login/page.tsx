"use client";

import { useActionState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { login } from "@/app/actions/auth";
import type { FormState } from "@/app/lib/definitions";

const cx: React.CSSProperties = {
  maxWidth: "420px",
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

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(logoRef.current, { y: 30, opacity: 0, duration: 0.8, delay: 0.1 })
      .from(formRef.current, { y: 24, opacity: 0, duration: 0.7 }, "-=0.4")
      .from(footerRef.current, { opacity: 0, duration: 0.5 }, "-=0.2");
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid-bg"
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div className="noise-overlay" />

      <div style={cx}>
        {/* Logo / brand */}
        <div ref={logoRef} style={{ marginBottom: "3rem", textAlign: "center" }}>
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
            ORP — Organization Resource Planning
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {process.env.NEXT_PUBLIC_ORG_NAME ?? "ORP"}
          </h1>
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.15)",
              margin: "1rem auto 0",
              width: "60px",
            }}
          />
        </div>

        {/* Form */}
        <form ref={formRef} action={action} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "0.5rem",
            }}
          >
            $ sign_in --secure
          </p>

          {state?.message && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "rgba(255,80,80,0.9)",
                border: "1px solid rgba(255,80,80,0.2)",
                padding: "0.6rem 0.75rem",
                letterSpacing: "0.02em",
              }}
            >
              {state.message}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label
              htmlFor="email"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@binus.ac.id"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.3)")}
            />
            {state?.errors?.email && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,80,80,0.8)" }}>
                {state.errors.email[0]}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.7)")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.3)")}
            />
            {state?.errors?.password && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,80,80,0.8)" }}>
                {state.errors.password[0]}
              </span>
            )}
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
              if (!pending) {
                e.currentTarget.style.background = "rgba(255,255,255,0.88)";
              }
            }}
            onMouseLeave={(e) => {
              if (!pending) {
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            {pending ? "Authenticating..." : "Sign In →"}
          </button>
        </form>

        {/* Footer */}
        <div
          ref={footerRef}
          style={{
            marginTop: "2.5rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.15)",
            }}
          >
            © {process.env.NEXT_PUBLIC_ORG_NAME ?? "ORP"} — ORP v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
