"use client";

import { useActionState, useEffect } from "react";
import { createMember, updateMember } from "@/app/actions/members";
import type { MemberRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required,
  errors,
  as: As = "input",
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  errors?: string[];
  as?: "input" | "textarea";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        {label}{required && " *"}
      </Label>
      {As === "textarea" ? (
        <Textarea
          id={id}
          name={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={3}
          className="font-sans"
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="font-sans"
        />
      )}
      {errors && (
        <span className="font-mono text-[10px] text-destructive">{errors[0]}</span>
      )}
    </div>
  );
}

export default function AddEditMemberModal({
  member,
  roles,
  onClose,
}: {
  member?: MemberRow;
  roles: { id: string; name: string }[];
  onClose: () => void;
  onSaved?: (m: MemberRow) => void;
}) {
  const isEdit = !!member;

  const boundUpdateMember = member
    ? updateMember.bind(null, member.id)
    : createMember;

  const [state, action, pending] = useActionState<FormState, FormData>(
    boundUpdateMember,
    undefined
  );

  // Close on success
  useEffect(() => {
    if (state?.message === "ok") onClose();
  }, [state, onClose]);

  const errors = state?.errors ?? {};

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Member" : "Add Member"}</DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-5 py-4">
          {state?.message && state.message !== "ok" && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="memberId" label="Member ID" placeholder="e.g. USR-001" defaultValue={member?.memberId} required errors={errors.nim} />
            <Field id="name" label="Full Name" placeholder="Full name" defaultValue={member?.name} required errors={errors.name} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="email" label="Email" type="email" placeholder="you@example.com" defaultValue={member?.email} required errors={errors.email} />
            <Field id="phone" label="Phone" type="tel" placeholder="+62..." defaultValue={member?.phone ?? ""} errors={errors.phone} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="division" label="Division" placeholder="e.g. Tech, Creative" defaultValue={member?.division ?? ""} />
            <Field id="batch" label="Batch" placeholder="e.g. 2023" defaultValue={member?.batch ?? ""} />
          </div>

          {/* Role select */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roleId" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Role *
            </Label>
            <select
              id="roleId"
              name="roleId"
              defaultValue={member?.role.id ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" className="bg-background text-foreground">Select a role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-background text-foreground">{r.name}</option>
              ))}
            </select>
            {errors.roleId && (
              <span className="font-mono text-[10px] text-destructive">{errors.roleId[0]}</span>
            )}
          </div>

          <Field
            id="bio"
            label="Bio"
            placeholder="Short bio or description..."
            defaultValue={member?.bio ?? ""}
            as="textarea"
          />

          <Field
            id="password"
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            placeholder="••••••••"
            required={!isEdit}
            errors={errors.password}
          />

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-mono text-xs tracking-wider uppercase font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="font-mono text-xs tracking-wider uppercase font-bold"
            >
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
