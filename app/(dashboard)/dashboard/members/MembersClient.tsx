"use client";

import { useRef, useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import type { MemberRow } from "@/app/lib/queries";
import MemberPanel from "./MemberPanel";

const cx: React.CSSProperties = {
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
  paddingRight: "clamp(1.25rem, 4vw, 3rem)",
  width: "100%",
};

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
};

type Status = "all" | "active" | "inactive";

export default function MembersClient({
  initialMembers,
  total,
  roles,
  initialSearch,
  initialRoleId,
  initialStatus,
  page,
}: {
  initialMembers: MemberRow[];
  total: number;
  roles: { id: string; name: string }[];
  initialSearch: string;
  initialRoleId: string;
  initialStatus: Status;
  page: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [roleId, setRoleId] = useState(initialRoleId);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(controlsRef.current, { y: 16, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(tableRef.current, { y: 12, opacity: 0, duration: 0.5 }, "-=0.25");
  }, []);

  const pushFilters = useCallback(
    (overrides: Partial<{ search: string; roleId: string; status: Status; page: number }>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const r = overrides.roleId ?? roleId;
      const st = overrides.status ?? status;
      const p = overrides.page ?? 1;
      if (s) params.set("search", s);
      if (r) params.set("roleId", r);
      if (st !== "all") params.set("status", st);
      if (p > 1) params.set("page", String(p));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [search, roleId, status, pathname, router]
  );

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => pushFilters({ search }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const perPage = 20;
  const totalPages = Math.ceil(total / perPage);

  const inputStyle: React.CSSProperties = {
    ...MONO,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    fontSize: "12px",
    letterSpacing: "0.04em",
    padding: "0.6rem 0.75rem",
    outline: "none",
    width: "100%",
  };

  const selectStyle: React.CSSProperties = {
    ...MONO,
    background: "#000",
    border: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.25)",
    color: "rgba(255,255,255,0.6)",
    fontSize: "11px",
    letterSpacing: "0.1em",
    padding: "0.6rem 0.75rem",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>
              Members
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              ...MONO,
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#000",
              background: "#fff",
              border: "none",
              padding: "0.65rem 1.25rem",
              fontWeight: 700,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + Add Member
          </button>
        </div>

        {/* Controls */}
        <div
          ref={controlsRef}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            alignItems: "end",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, ID, email, division..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <select
            value={roleId}
            onChange={(e) => { setRoleId(e.target.value); pushFilters({ roleId: e.target.value }); }}
            style={selectStyle}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { const v = e.target.value as Status; setStatus(v); pushFilters({ status: v }); }}
            style={selectStyle}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Results count */}
        <p style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)", marginBottom: "1rem" }}>
          {total} {total === 1 ? "member" : "members"} found
        </p>

        {/* Table */}
        <div ref={tableRef} style={{ border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.8fr",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {["Name / ID", "Email", "Division", "Role", "Status"].map((h) => (
              <span key={h} style={{ ...MONO, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {initialMembers.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ ...MONO, fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                No members found.
              </p>
            </div>
          ) : (
            initialMembers.map((member, idx) => (
              <MemberRow
                key={member.id}
                member={member}
                isLast={idx === initialMembers.length - 1}
                onSelect={() => setSelectedMember(member)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => pushFilters({ page: p })}
                style={{
                  ...MONO,
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  padding: "0.3rem 0.6rem",
                  background: p === page ? "#fff" : "transparent",
                  color: p === page ? "#000" : "rgba(255,255,255,0.3)",
                  border: "1px solid",
                  borderColor: p === page ? "#fff" : "rgba(255,255,255,0.1)",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedMember && (
        <MemberPanel
          member={selectedMember}
          roles={roles}
          onClose={() => setSelectedMember(null)}
          onUpdated={(updated) => setSelectedMember(updated)}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <MemberFormModal
          roles={roles}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function MemberRow({
  member,
  isLast,
  onSelect,
}: {
  member: MemberRow;
  isLast: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 1fr 1fr 0.8fr",
        padding: "0.85rem 1rem",
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
        textAlign: "left",
        transition: "background 0.15s",
        alignItems: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Name / ID */}
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", marginBottom: "2px" }}>
          {member.name}
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          {member.memberId}
        </p>
      </div>

      {/* Email */}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.02em" }}>
        {member.email}
      </span>

      {/* Division */}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
        {member.division ?? "—"}
      </span>

      {/* Role */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: member.role.name === "Super Admin" ? "#fff" : "rgba(255,255,255,0.4)",
          border: "1px solid",
          borderColor: member.role.name === "Super Admin" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
          padding: "0.15rem 0.4rem",
          display: "inline-block",
          width: "fit-content",
        }}
      >
        {member.role.name}
      </span>

      {/* Status */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: member.isActive ? "rgba(180,255,180,0.7)" : "rgba(255,255,255,0.2)",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: member.isActive ? "rgba(140,255,140,0.8)" : "rgba(255,255,255,0.15)",
          }}
        />
        {member.isActive ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

// Lazy-loaded add modal — inline to keep file count manageable
function MemberFormModal({
  roles,
  member,
  onClose,
}: {
  roles: { id: string; name: string }[];
  member?: MemberRow;
  onClose: () => void;
}) {
  return (
    <AddEditMemberModal roles={roles} member={member} onClose={onClose} />
  );
}

// Import the real modal (defined in its own file)
import AddEditMemberModal from "./AddEditMemberModal";
