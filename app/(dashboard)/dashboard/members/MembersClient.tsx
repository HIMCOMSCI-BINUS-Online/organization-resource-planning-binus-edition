"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { MemberRow } from "@/app/lib/queries";
import MemberPanel from "./MemberPanel";
import { Plus, Search, Filter } from "lucide-react";
import AddEditMemberModal from "./AddEditMemberModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const pushFilters = useCallback(
    (overrides: Partial<{ search: string; roleId: string; status: Status; page: number }>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const r = overrides.roleId ?? roleId;
      const st = overrides.status ?? status;
      const p = overrides.page ?? 1;
      if (s) params.set("search", s);
      if (r && r !== "all") params.set("roleId", r);
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

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            ◆ Directory
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Members
          </h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 font-mono uppercase tracking-wider text-xs">
          <Plus size={16} />
          Add Member
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, ID, email, division..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono"
          />
        </div>
        
        <div className="flex gap-4">
          <Select 
            value={roleId || "all"} 
            onValueChange={(val) => { 
              const newRole = (val === "all" || !val) ? "" : val;
              setRoleId(newRole); 
              pushFilters({ roleId: newRole }); 
            }}
          >
            <SelectTrigger className="w-[180px] font-mono">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={status} 
            onValueChange={(val) => { 
              const v = (val || "all") as Status;
              setStatus(v); 
              pushFilters({ status: v }); 
            }}
          >
            <SelectTrigger className="w-[140px] font-mono">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <p className="font-mono text-xs tracking-wider text-muted-foreground px-1">
          {total} {total === 1 ? "member" : "members"} found
        </p>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Name / ID</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Email</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase hidden md:table-cell">Division</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase hidden md:table-cell">Role</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="font-mono text-sm text-muted-foreground tracking-wider">
                      No members found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                initialMembers.map((member) => (
                  <TableRow 
                    key={member.id} 
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setSelectedMember(member)}
                  >
                    <TableCell>
                      <p className="text-sm font-bold mb-0.5">{member.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">{member.memberId}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                      {member.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">
                      {member.division ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={member.role.name === "Super Admin" ? "default" : "secondary"} className="font-mono text-[9px] tracking-widest uppercase">
                        {member.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? "outline" : "secondary"} className="font-mono text-[9px] tracking-widest uppercase gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 items-center justify-center pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="w-8 h-8 font-mono text-xs"
                onClick={() => pushFilters({ page: p })}
              >
                {p}
              </Button>
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

// Lazy-loaded add modal
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
