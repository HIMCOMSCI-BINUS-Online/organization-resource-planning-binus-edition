"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/app/lib/dal";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Ledger", href: "/dashboard/ledger" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Knowledge", href: "/dashboard/knowledge" },
  { label: "Announce", href: "/dashboard/announcements" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Polls", href: "/dashboard/polls" },
  { label: "Assets", href: "/dashboard/assets" },
  { label: "Reports", href: "/dashboard/reports" },
];

const cx: React.CSSProperties = {
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
  paddingRight: "clamp(1.25rem, 4vw, 3rem)",
  width: "100%",
};

export default function DashboardNav({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          ...cx,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "52px",
        }}
      >
        {/* Left: brand + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link
            href="/dashboard"
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {process.env.NEXT_PUBLIC_ORG_NAME ?? "ORP"}
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                    padding: "0.35rem 0.75rem",
                    textDecoration: "none",
                    borderBottom: isActive
                      ? "1px solid rgba(255,255,255,0.6)"
                      : "1px solid transparent",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: user info + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.02em",
              }}
            >
              {user.name.split(" ")[0]}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              {user.role.name}
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "0.3rem 0.6rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.25)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              Exit
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
