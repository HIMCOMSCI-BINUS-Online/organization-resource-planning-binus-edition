"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin();

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function buildLinks() {
  const links = [];
  const liHandle = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_HANDLE;
  const liUrl = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL;
  const igHandle = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_HANDLE;
  const igUrl = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL;
  if (liHandle && liUrl)
    links.push({ label: "LinkedIn", handle: liHandle, href: liUrl, Icon: LinkedInIcon, scrambleChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/\\[]{}", });
  if (igHandle && igUrl)
    links.push({ label: "Instagram", handle: igHandle, href: igUrl, Icon: InstagramIcon, scrambleChars: "!@#$%^&*<>?~|abcdefghijklmnopqrstuvwxyz", });
  return links;
}

export default function SocialLinks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-social-item]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });
    },
    { scope: containerRef }
  );

  const scramble = (el: HTMLElement, original: string, chars: string) => {
    let iter = 0;
    const maxIter = original.length * 2;
    const interval = setInterval(() => {
      el.textContent = original
        .split("")
        .map((_, idx) => {
          if (idx < Math.floor(iter / 2)) return original[idx];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      iter++;
      if (iter >= maxIter) {
        clearInterval(interval);
        el.textContent = original;
      }
    }, 28);
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {/* Section label */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "1rem",
        }}
      >
        // find us online
      </p>

      {/* Link buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {buildLinks().map(({ label, handle, href, Icon, scrambleChars }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-social-item
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem 1.25rem",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#ffffff",
              textDecoration: "none",
              transition: "border-color 0.3s, background 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(255,255,255,0.9)";
              el.style.background = "rgba(255,255,255,0.04)";
              const labelEl = el.querySelector<HTMLElement>("[data-scramble]");
              if (labelEl) scramble(labelEl, label, scrambleChars);
              gsap.to(el, { x: 4, duration: 0.2, ease: "power2.out" });
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(255,255,255,0.5)";
              el.style.background = "transparent";
              gsap.to(el, { x: 0, duration: 0.4, ease: "elastic.out(1,0.6)" });
            }}
          >
            {/* Icon box */}
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#ffffff",
              }}
            >
              <Icon />
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span
                data-scramble
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "2px",
                }}
              >
                {handle}
              </span>
            </div>

            {/* Arrow */}
            <div
              style={{
                marginLeft: "auto",
                flexShrink: 0,
                color: "rgba(255,255,255,0.6)",
                transition: "color 0.3s, transform 0.3s",
              }}
            >
              <ArrowUpRightIcon />
            </div>

            {/* Sweep accent lines */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "1px",
                width: 0,
                background: "#fff",
                transition: "width 0.5s ease-out",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                height: "1px",
                width: 0,
                background: "#fff",
                transition: "width 0.5s ease-out",
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
