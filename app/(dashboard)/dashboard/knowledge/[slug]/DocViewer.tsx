"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteDocument } from "@/app/actions/documents";
import type { DocumentFull } from "@/app/lib/queries";
import DocumentModal from "../DocumentModal";

const cx: React.CSSProperties = {
  maxWidth: "860px", marginLeft: "auto", marginRight: "auto",
  paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", width: "100%",
};
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function DocViewer({
  doc,
  categories,
}: {
  doc: DocumentFull;
  categories: string[];
}) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, startDelete] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(containerRef.current, { y: 24, opacity: 0, duration: 0.6, ease: "power4.out" });
  }, []);

  function handleDelete() {
    if (!confirm("Delete this document?")) return;
    startDelete(async () => {
      await deleteDocument(doc.id, doc.slug);
      router.push("/dashboard/knowledge");
    });
  }

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        <div ref={containerRef}>
          {/* Back */}
          <Link
            href="/dashboard/knowledge"
            style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "2rem", transition: "color 0.15s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)")}
          >
            <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.4rem" }} />Knowledge
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ ...MONO, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem" }}>{doc.category}</p>
            <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, marginBottom: "1rem" }}>{doc.title}</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>By {doc.author.name}</span>
                <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>
                  Updated {new Date(doc.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowEdit(true)}
                  style={{ ...MONO, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.4rem 0.8rem", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ ...MONO, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", background: "transparent", color: deleting ? "rgba(255,80,80,0.2)" : "rgba(255,80,80,0.5)", border: "1px solid rgba(255,80,80,0.15)", padding: "0.4rem 0.8rem", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { if (!deleting) { e.currentTarget.style.color = "rgba(255,80,80,0.9)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.4)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = deleting ? "rgba(255,80,80,0.2)" : "rgba(255,80,80,0.5)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.15)"; }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Markdown body */}
          <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: "14px" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginTop: "2rem", marginBottom: "0.75rem", lineHeight: 1.2 }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginTop: "1.75rem", marginBottom: "0.6rem", lineHeight: 1.3 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>{children}</h3>,
                p: ({ children }) => <p style={{ marginBottom: "1rem" }}>{children}</p>,
                ul: ({ children }) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: "0.3rem" }}>{children}</li>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid rgba(255,255,255,0.15)", paddingLeft: "1rem", marginLeft: 0, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>{children}</blockquote>,
                code: ({ children, className }) => {
                  const isBlock = className?.startsWith("language-");
                  return isBlock
                    ? <code style={{ display: "block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: "12px", overflowX: "auto", marginBottom: "1rem", lineHeight: 1.6 }}>{children}</code>
                    : <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px", background: "rgba(255,255,255,0.07)", padding: "0.1em 0.4em", color: "rgba(255,255,255,0.85)" }}>{children}</code>;
                },
                pre: ({ children }) => <pre style={{ marginBottom: "1rem" }}>{children}</pre>,
                hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "2rem 0" }} />,
                a: ({ href, children }) => <a href={href} style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: "3px" }}>{children}</a>,
                table: ({ children }) => <div style={{ overflowX: "auto", marginBottom: "1rem" }}><table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{children}</table></div>,
                th: ({ children }) => <th style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "0.5rem 0.75rem", textAlign: "left", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "10px" }}>{children}</th>,
                td: ({ children }) => <td style={{ border: "1px solid rgba(255,255,255,0.07)", padding: "0.5rem 0.75rem" }}>{children}</td>,
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {showEdit && (
        <DocumentModal
          doc={doc}
          categories={categories}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
