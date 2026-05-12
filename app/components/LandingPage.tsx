"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import SocialLinks from "./SocialLinks";

gsap.registerPlugin(ScrollTrigger);

const ORG = process.env.NEXT_PUBLIC_ORG_NAME ?? "ORP";
const TAGLINE = process.env.NEXT_PUBLIC_ORG_TAGLINE ?? "Organization Resource Planning";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const cx: React.CSSProperties = {
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.5rem,5vw,4rem)",
  paddingRight: "clamp(1.5rem,5vw,4rem)",
  width: "100%",
};

const MODULES = [
  {
    index: "01",
    title: "Member Directory",
    description: "Centralized member registry with roles, divisions, and full profile management. Filter, search, and manage your entire organization in one place.",
  },
  {
    index: "02",
    title: "Financial Ledger",
    description: "Track income and expenses with categorized entries, running balance, and a live financial overview for complete fiscal transparency.",
  },
  {
    index: "03",
    title: "Task Board",
    description: "Kanban-style task management with priority levels, assignees, and due dates. Drag and drop cards across To Do, In Progress, Review, and Done.",
  },
  {
    index: "04",
    title: "Knowledge Base",
    description: "Internal document vault with full Markdown support. Organize SOPs, meeting minutes, guides, and references by category.",
  },
  {
    index: "05",
    title: "Events & Calendar",
    description: "Schedule meetings, events, and deadlines. Keep every member aligned on what's happening and when.",
    badge: "Coming Soon",
  },
  {
    index: "06",
    title: "Announcements",
    description: "Broadcast important updates to your organization instantly. Pin critical notices and set expiry dates to keep information relevant.",
    badge: "Coming Soon",
  },
];

const STATS = [
  { value: "6", label: "Core Modules" },
  { value: "5", label: "Role Levels" },
  { value: "100%", label: "Open Source" },
  { value: "∞", label: "Organizations" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headlineRef.current, { y: 60, opacity: 0, duration: 1, delay: 0.1 })
      .from(subRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
      .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.7 }, "-=0.4");

    // Stats on scroll
    if (statsRef.current) {
      gsap.from(Array.from(statsRef.current.children), {
        y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
      });
    }

    // Module cards on scroll
    if (modulesRef.current) {
      gsap.from(Array.from(modulesRef.current.children), {
        y: 50, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: modulesRef.current, start: "top 75%" },
      });
    }

    // Footer
    if (footerRef.current) {
      gsap.from(footerRef.current, {
        opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      });
    }

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <div className="noise-overlay" />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          background: "rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ ...cx, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", paddingBottom: "1rem" }}>
          <span style={{ ...MONO, fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "#fff" }}>
            {ORG}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a
              href="https://github.com/HIMCOMSCI-BINUS-Online/organization-resource-planning"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...MONO, fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              GitHub
            </a>
            <Link
              href="/login"
              style={{
                ...MONO, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#000", background: "#fff", padding: "0.5rem 1.25rem",
                textDecoration: "none", fontWeight: 700, transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ ...cx, paddingTop: "clamp(5rem,12vw,9rem)", paddingBottom: "clamp(4rem,8vw,7rem)", position: "relative", zIndex: 10 }}>
        <p style={{ ...MONO, fontSize: "11px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1.75rem" }}>
          Open Source — Built for Non-Profits
        </p>

        <h1
          ref={headlineRef}
          style={{
            fontSize: "clamp(3rem,8vw,6.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            color: "#fff",
            maxWidth: "900px",
            marginBottom: "2rem",
          }}
        >
          Run your organization.<br />
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Not your spreadsheets.</span>
        </h1>

        <p
          ref={subRef}
          style={{
            fontSize: "clamp(1rem,2vw,1.2rem)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.75,
            maxWidth: "580px",
            marginBottom: "2.5rem",
            fontWeight: 300,
          }}
        >
          ORP is a free, self-hostable internal management platform built for non-profit organizations —
          members, finances, tasks, and knowledge, all in one place.
        </p>

        <div ref={ctaRef} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/onboarding"
            style={{
              ...MONO, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
              color: "#000", background: "#fff", padding: "0.9rem 2rem",
              textDecoration: "none", fontWeight: 700, transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Get Started →
          </Link>
          <Link
            href="/login"
            style={{
              ...MONO, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)", background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)", padding: "0.9rem 2rem",
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "#fff"; el.style.borderColor = "rgba(255,255,255,0.4)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "rgba(255,255,255,0.5)"; el.style.borderColor = "rgba(255,255,255,0.15)"; }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 10 }}>
        <div
          ref={statsRef}
          style={{ ...cx, display: "grid", gridTemplateColumns: "repeat(4,1fr)", paddingTop: "2.5rem", paddingBottom: "2.5rem" }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                padding: "0 1rem",
              }}
            >
              <p style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: "0.4rem" }}>
                {s.value}
              </p>
              <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODULES ── */}
      <section style={{ ...cx, paddingTop: "clamp(4rem,8vw,7rem)", paddingBottom: "clamp(4rem,8vw,7rem)", position: "relative", zIndex: 10 }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1rem" }}>
            What's included
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1 }}>
            Everything your<br />organization needs.
          </h2>
        </div>

        <div
          ref={modulesRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {MODULES.map((m) => (
            <ModuleCard key={m.index} {...m} />
          ))}
        </div>
      </section>

      {/* ── OPEN SOURCE CTA ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 10 }}>
        <div style={{ ...cx, paddingTop: "clamp(4rem,7vw,6rem)", paddingBottom: "clamp(4rem,7vw,6rem)" }}>
          <div style={{ maxWidth: "680px" }}>
            <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1rem" }}>
              Free & Open Source
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.15, marginBottom: "1.5rem" }}>
              Built for organizations<br />that can&apos;t afford enterprise software.
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: "2rem", fontWeight: 300 }}>
              Deploy to Vercel and Supabase in minutes — both have generous free tiers.
              No vendor lock-in, no subscriptions, no hidden costs.
              Fork it, customize it, make it yours.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/onboarding"
                style={{
                  ...MONO, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
                  color: "#000", background: "#fff", padding: "0.85rem 1.75rem",
                  textDecoration: "none", fontWeight: 700, transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
              >
                Deploy Now →
              </Link>
              <a
                href="https://github.com/HIMCOMSCI-BINUS-Online/organization-resource-planning"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...MONO, fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)", background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)", padding: "0.85rem 1.75rem",
                  textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = "#fff"; el.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = "rgba(255,255,255,0.5)"; el.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        ref={footerRef}
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 10 }}
      >
        <div style={{ ...cx, paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "start", flexWrap: "wrap" }}>
            {/* Left */}
            <div>
              <p style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginBottom: "0.4rem" }}>
                {ORG}
              </p>
              <p style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem" }}>
                {TAGLINE}
              </p>
              <div style={{ maxWidth: "340px" }}>
                <SocialLinks />
              </div>
            </div>

            {/* Right — links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", paddingTop: "0.2rem" }}>
              {[
                { label: "Dashboard", href: "/login" },
                { label: "Get Started", href: "/onboarding" },
                { label: "GitHub", href: "https://github.com/HIMCOMSCI-BINUS-Online/organization-resource-planning" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  style={{ ...MONO, fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "2rem", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
              © {new Date().getFullYear()} {ORG} — MIT License
            </span>
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
              Built with Next.js · Prisma · Supabase · Vercel
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ModuleCard({
  index, title, description, badge,
}: {
  index: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        background: "#000",
        padding: "2rem 1.75rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#000")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
          {index}
        </span>
        {badge && (
          <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.5rem" }}>
            {badge}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: "0.75rem", lineHeight: 1.3 }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
        {description}
      </p>
    </div>
  );
}
