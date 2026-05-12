"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { DashboardStats } from "@/app/lib/queries";

const cx: React.CSSProperties = {
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
  paddingRight: "clamp(1.25rem, 4vw, 3rem)",
  width: "100%",
};

function AnimatedNumber({ value, label, sub }: { value: number; label: string; sub?: string }) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.4,
      ease: "power3.out",
      delay: 0.2,
      onUpdate() {
        el.textContent = Math.round(obj.val).toString();
      },
    });
  }, [value]);

  return (
    <div
      style={{
        background: "#000",
        padding: "1.75rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "1rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "#fff",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        <span ref={numRef}>0</span>
      </p>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

const MODULE_LINKS = [
  {
    label: "Member Directory",
    description: "Browse, filter, and manage all organization members.",
    href: "/dashboard/members",
    ready: true,
  },
  {
    label: "Financial Ledger",
    description: "Income & expense tracker with live balance calculation.",
    href: "/dashboard/ledger",
    ready: false,
  },
  {
    label: "Kanban Board",
    description: "Project and task management across departments.",
    href: "/dashboard/tasks",
    ready: false,
  },
  {
    label: "Knowledge Base",
    description: "Internal rules, event records, and documentation vault.",
    href: "/dashboard/knowledge",
    ready: false,
  },
];

export default function DashboardOverview({
  stats,
  userName,
}: {
  stats: DashboardStats;
  userName: string;
}) {
  const greetRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(greetRef.current, { y: 28, opacity: 0, duration: 0.8 })
      .from(dividerRef.current, { scaleX: 0, transformOrigin: "left", duration: 0.6 }, "-=0.4")
      .from(
        statsRef.current ? Array.from(statsRef.current.children) : [],
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.09 },
        "-=0.3"
      )
      .from(
        modulesRef.current ? Array.from(modulesRef.current.children) : [],
        { y: 16, opacity: 0, duration: 0.45, stagger: 0.07 },
        "-=0.2"
      )
      .from(activityRef.current, { y: 12, opacity: 0, duration: 0.4 }, "-=0.2");
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        {/* Greeting */}
        <div ref={greetRef} style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
              marginBottom: "0.5rem",
            }}
          >
            Overview
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Welcome, {firstName}.
          </h1>
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            marginBottom: "2.5rem",
          }}
        />

        {/* Stat cards */}
        <div
          ref={statsRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.07)",
            marginBottom: "3rem",
          }}
        >
          <AnimatedNumber
            value={stats.totalMembers}
            label="Total Members"
            sub="registered accounts"
          />
          <AnimatedNumber
            value={stats.activeMembers}
            label="Active Members"
            sub="currently active"
          />
          <AnimatedNumber
            value={stats.totalRoles}
            label="Roles"
            sub="permission groups"
          />
          <div
            style={{
              background: "#000",
              padding: "1.75rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: "1rem",
              }}
            >
              Newest Member
            </p>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: stats.newestMember ? "#fff" : "rgba(255,255,255,0.2)",
                marginBottom: "0.5rem",
              }}
            >
              {stats.newestMember?.name ?? "—"}
            </p>
            {stats.newestMember && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: "0.1em",
                }}
              >
                {new Date(stats.newestMember.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Module grid */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
            marginBottom: "1.25rem",
          }}
        >
          Modules
        </p>

        <div
          ref={modulesRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.07)",
            marginBottom: "3rem",
          }}
        >
          {MODULE_LINKS.map((m) => {
            const inner = (
              <div
                style={{
                  background: "#000",
                  padding: "1.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  height: "100%",
                  transition: "background 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) =>
                  m.ready && ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "#000")
                }
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: m.ready ? "#fff" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {m.label}
                  </p>
                  {m.ready && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        padding: "0.15rem 0.4rem",
                      }}
                    >
                      Live
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: m.ready ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
                    lineHeight: 1.6,
                  }}
                >
                  {m.description}
                </p>
                {!m.ready && (
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.12)",
                      marginTop: "auto",
                    }}
                  >
                    Coming next
                  </p>
                )}
              </div>
            );

            return m.ready ? (
              <Link key={m.href} href={m.href} style={{ textDecoration: "none", display: "block" }}>
                {inner}
              </Link>
            ) : (
              <div key={m.href}>{inner}</div>
            );
          })}
        </div>

        {/* Recent activity placeholder */}
        <div ref={activityRef}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
              marginBottom: "1.25rem",
            }}
          >
            Recent Activity
          </p>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.15)",
                letterSpacing: "0.1em",
              }}
            >
              Activity feed will populate as data is added across modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
