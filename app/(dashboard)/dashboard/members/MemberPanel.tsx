"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import { toggleMemberActive } from "@/app/actions/members";
import type { MemberRow } from "@/app/lib/queries";
import { useTransition, useState } from "react";

const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", color: value ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)", letterSpacing: "0.01em" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function MemberPanel({
  member,
  roles,
  onClose,
  onUpdated,
}: {
  member: MemberRow;
  roles: { id: string; name: string }[];
  onClose: () => void;
  onUpdated: (m: MemberRow) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "none" }
    );
    gsap.fromTo(
      panelRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.45, ease: "power4.out" }
    );
  }, []);

  function close() {
    gsap.to(panelRef.current, {
      x: "100%",
      duration: 0.35,
      ease: "power3.in",
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
  }

  function handleToggleActive() {
    startTransition(async () => {
      await toggleMemberActive(member.id, !member.isActive);
      onUpdated({ ...member, isActive: !member.isActive });
    });
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.6)",
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 95vw)",
          zIndex: 101,
          background: "#000",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#000",
            zIndex: 1,
          }}
        >
          <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            Member Profile
          </span>
          <button
            onClick={close}
            style={{
              ...MONO,
              fontSize: "16px",
              color: "rgba(255,255,255,0.3)",
              background: "transparent",
              border: "none",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            aria-label="Close"
          >
            <X size={16} style={{ display: "block" }} />
          </button>
        </div>

        {/* Avatar / name block */}
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              fontSize: "1.3rem",
              fontWeight: 900,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}
          >
            {member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              member.name.charAt(0).toUpperCase()
            )}
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", marginBottom: "0.25rem" }}>
            {member.name}
          </h2>
          <p style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            {member.memberId}
          </p>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                ...MONO,
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: member.role.name === "Super Admin" ? "#fff" : "rgba(255,255,255,0.4)",
                border: "1px solid",
                borderColor: member.role.name === "Super Admin" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                padding: "0.2rem 0.5rem",
              }}
            >
              {member.role.name}
            </span>
            <span
              style={{
                ...MONO,
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: member.isActive ? "rgba(180,255,180,0.7)" : "rgba(255,255,255,0.2)",
                border: "1px solid",
                borderColor: member.isActive ? "rgba(140,255,140,0.2)" : "rgba(255,255,255,0.07)",
                padding: "0.2rem 0.5rem",
              }}
            >
              {member.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
          <DetailField label="Email" value={member.email} />
          <DetailField label="Phone" value={member.phone} />
          <DetailField label="Division" value={member.division} />
          <DetailField label="Batch" value={member.batch} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              Bio
            </span>
            <p style={{ fontSize: "13px", color: member.bio ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
              {member.bio ?? "—"}
            </p>
          </div>
          <DetailField
            label="Member Since"
            value={new Date(member.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              flex: 1,
              ...MONO,
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "0.7rem",
              fontWeight: 700,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Edit
          </button>
          <button
            onClick={handleToggleActive}
            disabled={isPending}
            style={{
              flex: 1,
              ...MONO,
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "transparent",
              color: member.isActive ? "rgba(255,100,100,0.8)" : "rgba(140,255,140,0.7)",
              border: "1px solid",
              borderColor: member.isActive ? "rgba(255,100,100,0.2)" : "rgba(140,255,140,0.2)",
              padding: "0.7rem",
              transition: "all 0.2s",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {member.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditMemberModal
          member={member}
          roles={roles}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => { onUpdated(updated); setShowEditModal(false); }}
        />
      )}
    </>
  );
}

import AddEditMemberModal from "./AddEditMemberModal";

function EditMemberModal({
  member,
  roles,
  onClose,
  onSaved,
}: {
  member: MemberRow;
  roles: { id: string; name: string }[];
  onClose: () => void;
  onSaved: (m: MemberRow) => void;
}) {
  return (
    <AddEditMemberModal
      member={member}
      roles={roles}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
