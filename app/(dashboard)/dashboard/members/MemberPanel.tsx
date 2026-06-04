"use client";

import { toggleMemberActive } from "@/app/actions/members";
import type { MemberRow } from "@/app/lib/queries";
import { useTransition, useState } from "react";
import { Edit2, Shield, User, Clock, Phone, Mail, FileText } from "lucide-react";
import AddEditMemberModal from "./AddEditMemberModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function DetailField({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {Icon && <Icon className="text-muted-foreground mt-0.5" size={16} />}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <span className={`text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value ?? "—"}
        </span>
      </div>
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
  const [isPending, startTransition] = useTransition();
  const [showEditModal, setShowEditModal] = useState(false);

  function handleToggleActive() {
    startTransition(async () => {
      await toggleMemberActive(member.id, !member.isActive);
      onUpdated({ ...member, isActive: !member.isActive });
    });
  }

  return (
    <>
      <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Member Profile</SheetTitle>
            <SheetDescription className="sr-only">Detailed view of member information.</SheetDescription>
          </SheetHeader>

          {/* Avatar / name block */}
          <div className="px-6 py-8 border-b bg-muted/20">
            <Avatar className="w-20 h-20 mb-5 border">
              {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
              <AvatarFallback className="text-2xl font-black text-muted-foreground bg-muted">
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-black tracking-tight mb-1">
              {member.name}
            </h2>
            <p className="font-mono text-xs text-muted-foreground tracking-wider mb-4">
              {member.memberId}
            </p>

            <div className="flex gap-2 flex-wrap">
              <Badge variant={member.role.name === "Super Admin" ? "default" : "secondary"} className="font-mono text-[10px] tracking-widest uppercase">
                {member.role.name}
              </Badge>
              <Badge variant={member.isActive ? "outline" : "secondary"} className="font-mono text-[10px] tracking-widest uppercase gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="p-3 flex flex-col flex-1 overflow-y-auto">
            <DetailField label="Email" value={member.email} icon={Mail} />
            <DetailField label="Phone" value={member.phone} icon={Phone} />
            <DetailField label="Division" value={member.division} icon={User} />
            <DetailField label="Batch" value={member.batch} icon={Shield} />
            
            <div className="flex items-start gap-3 p-3 rounded-lg mt-2">
              <FileText className="text-muted-foreground mt-0.5 shrink-0" size={16} />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  Bio
                </span>
                <p className={`text-sm leading-relaxed ${member.bio ? "text-foreground" : "text-muted-foreground"}`}>
                  {member.bio ?? "—"}
                </p>
              </div>
            </div>

            <DetailField
              label="Member Since"
              value={new Date(member.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              icon={Clock}
            />
          </div>

          {/* Actions */}
          <SheetFooter className="p-6 border-t bg-muted/10 sm:justify-start">
            <div className="flex w-full gap-3">
              <Button
                onClick={() => setShowEditModal(true)}
                className="flex-1 font-mono text-xs tracking-wider uppercase font-bold"
              >
                <Edit2 className="mr-2" size={14} />
                Edit Profile
              </Button>
              <Button
                variant={member.isActive ? "destructive" : "outline"}
                onClick={handleToggleActive}
                disabled={isPending}
                className="flex-1 font-mono text-xs tracking-wider uppercase font-bold"
              >
                {member.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
