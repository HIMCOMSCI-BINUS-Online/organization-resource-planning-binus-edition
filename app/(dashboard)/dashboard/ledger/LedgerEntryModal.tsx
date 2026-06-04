"use client";

import { useActionState, useEffect } from "react";
import { createLedgerEntry, updateLedgerEntry } from "@/app/actions/ledger";
import type { LedgerEntryRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function Field({ id, label, type = "text", placeholder, defaultValue, required, errors, list }: {
  id: string; label: string; type?: string; placeholder?: string;
  defaultValue?: string; required?: boolean; errors?: string[]; list?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        {label}{required && " *"}
      </Label>
      <Input 
        id={id} 
        name={id} 
        type={type} 
        placeholder={placeholder} 
        defaultValue={defaultValue} 
        list={list}
        className="font-sans"
      />
      {errors && <span className="font-mono text-[10px] text-destructive">{errors[0]}</span>}
    </div>
  );
}

export default function LedgerEntryModal({ entry, categories, onClose }: {
  entry: LedgerEntryRow | null; categories: string[]; onClose: () => void;
}) {
  const isEdit = !!entry;
  const action = isEdit ? updateLedgerEntry.bind(null, entry.id) : createLedgerEntry;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  useEffect(() => { if (state?.message === "ok") onClose(); }, [state, onClose]);

  const errors = state?.errors ?? {};
  const defaultDate = entry ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Entry" : "New Entry"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-5 py-4">
          {state?.message && state.message !== "ok" && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="date" label="Date" type="date" defaultValue={defaultDate} required errors={errors.date} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Type *</Label>
              <select 
                id="type" 
                name="type" 
                defaultValue={entry?.type ?? "INCOME"} 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-sans cursor-pointer"
              >
                <option value="INCOME" className="bg-background text-foreground">Income</option>
                <option value="EXPENSE" className="bg-background text-foreground">Expense</option>
              </select>
              {errors.type && <span className="font-mono text-[10px] text-destructive">{errors.type[0]}</span>}
            </div>
          </div>

          <Field id="title" label="Title" placeholder="e.g. Iuran Anggota Bulan Juni" defaultValue={entry?.title} required errors={errors.title} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Field id="category" label="Category" placeholder="e.g. Iuran, Konsumsi" defaultValue={entry?.category} errors={errors.category} list="cat-list" required />
              <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <Field id="amount" label="Amount (IDR)" type="number" placeholder="e.g. 150000" defaultValue={entry?.amount.toString()} required errors={errors.amount} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Optional notes..." 
              defaultValue={entry?.description ?? ""} 
              rows={2} 
              className="font-sans" 
            />
          </div>

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
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
