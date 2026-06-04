"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.06,
        ease: "none",
      });
    };

    // Laggy ring follow with RAF
    const animate = () => {
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
      gsap.set(ring, { x: ringPos.current.x, y: ringPos.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Scale ring on hoverable elements
    const onEnter = () => {
      gsap.to(ring, { scale: 2.5, opacity: 0.6, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 0.4, duration: 0.3, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    const attachListeners = () => {
      document
        .querySelectorAll("a, button, [data-cursor-hover]")
        .forEach((el) => {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
    };

    // Observe DOM mutations to re-attach on new elements
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", onMove);
    attachListeners();

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fff",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed z-[9998] pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.7)",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
