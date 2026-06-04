"use client";

import { useActionState, useEffect } from "react";
import { createTask, updateTask } from "@/app/actions/tasks";
import type { TaskRow, MemberRow } from "@/app/lib/queries";
import type { FormState } from "@/app/lib/definitions";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TaskModal({
  task,
  members,
  onClose,
}: {
  task: TaskRow | null;
  members: MemberRow[];
  onClose: () => void;
}) {
  const isEdit = !!task;
  const serverAction = isEdit ? updateTask.bind(null, task.id) : createTask;

  const [state, formAction, pending] = useActionState<FormState, FormData>(serverAction, undefined);

  useEffect(() => {
    if (state?.message === "ok") onClose();
  }, [state, onClose]);

  const errors = state?.errors ?? {};
  const defaultDue = task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-5 py-4">
          {state?.message && state.message !== "ok" && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Title *</Label>
            <Input id="title" name="title" placeholder="Task title..." defaultValue={task?.title} className="font-sans" />
            {errors.title && <span className="font-mono text-[10px] text-destructive">{errors.title[0]}</span>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Description</Label>
            <Textarea id="description" name="description" placeholder="Optional details..." defaultValue={task?.description ?? ""} rows={3} className="font-sans" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Status</Label>
              <select 
                id="status" 
                name="status" 
                defaultValue={task?.status ?? "TODO"} 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-sans cursor-pointer"
              >
                <option value="TODO" className="bg-background text-foreground">To Do</option>
                <option value="IN_PROGRESS" className="bg-background text-foreground">In Progress</option>
                <option value="REVIEW" className="bg-background text-foreground">Review</option>
                <option value="DONE" className="bg-background text-foreground">Done</option>
              </select>
            </div>
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Priority</Label>
              <select 
                id="priority" 
                name="priority" 
                defaultValue={task?.priority ?? "MEDIUM"} 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-sans cursor-pointer"
              >
                <option value="LOW" className="bg-background text-foreground">Low</option>
                <option value="MEDIUM" className="bg-background text-foreground">Medium</option>
                <option value="HIGH" className="bg-background text-foreground">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Assignee */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assigneeId" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Assignee</Label>
              <select 
                id="assigneeId" 
                name="assigneeId" 
                defaultValue={task?.assignee?.id ?? ""} 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-sans cursor-pointer"
              >
                <option value="" className="bg-background text-foreground">Unassigned</option>
                {members.map((m) => <option key={m.id} value={m.id} className="bg-background text-foreground">{m.name}</option>)}
              </select>
            </div>
            {/* Due date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={defaultDue} className="font-sans" />
            </div>
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
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
