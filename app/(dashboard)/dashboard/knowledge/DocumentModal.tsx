"use client";

import { useActionState, useEffect } from "react";
import { createDocument, updateDocument } from "@/app/actions/documents";
import type { DocumentFull } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function DocumentModal({
  doc,
  categories,
  onClose,
}: {
  doc: DocumentFull | null;
  categories: string[];
  onClose: () => void;
}) {
  const isEdit = !!doc;
  const serverAction = isEdit ? updateDocument.bind(null, doc.id) : createDocument;

  const [state, formAction, pending] = useActionState<FormState, FormData>(serverAction, undefined);

  useEffect(() => {
    if (state?.message === "ok") onClose();
  }, [state, onClose]);

  const errors = state?.errors ?? {};

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Document" : "New Document"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-5 py-4">
          {state?.message && state.message !== "ok" && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="title" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Title *</Label>
              <Input id="title" name="title" placeholder="Document title..." defaultValue={doc?.title} className="font-sans" />
              {errors.title && <span className="font-mono text-[10px] text-destructive">{errors.title[0]}</span>}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="category" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Category *</Label>
              <Input id="category" name="category" placeholder="e.g. SOP, Minutes..." defaultValue={doc?.category} list="category-list" className="font-sans" />
              <datalist id="category-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
              {errors.category && <span className="font-mono text-[10px] text-destructive">{errors.category[0]}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Content (Markdown) *</Label>
            <Textarea 
              id="content" 
              name="content" 
              placeholder="Write markdown content here..." 
              defaultValue={doc?.content} 
              rows={14} 
              className="font-mono text-sm leading-relaxed" 
            />
            {errors.content && <span className="font-mono text-[10px] text-destructive">{errors.content[0]}</span>}
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
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
