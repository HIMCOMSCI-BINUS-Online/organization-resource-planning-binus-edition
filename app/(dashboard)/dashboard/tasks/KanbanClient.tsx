"use client";

import { useEffect, useState, useTransition } from "react";
import { moveTask, deleteTask } from "@/app/actions/tasks";
import type { KanbanBoard, TaskRow, MemberRow } from "@/app/lib/queries";
import TaskModal from "./TaskModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Edit2, Plus, Trash2 } from "lucide-react";

const COLUMNS: { status: TaskRow["status"]; label: string; color: string }[] = [
  { status: "TODO",        label: "To Do",       color: "bg-zinc-300 dark:bg-zinc-700" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-amber-400 dark:bg-amber-500" },
  { status: "REVIEW",      label: "Review",      color: "bg-blue-400 dark:bg-blue-500" },
  { status: "DONE",        label: "Done",        color: "bg-emerald-400 dark:bg-emerald-500" },
];

const PRIORITY_COLOR: Record<TaskRow["priority"], string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-zinc-400 dark:bg-zinc-600",
};

export default function KanbanClient({
  board: initialBoard,
  members,
}: {
  board: KanbanBoard;
  members: MemberRow[];
}) {
  const [board, setBoard] = useState(initialBoard);
  useEffect(() => { setBoard(initialBoard); }, [initialBoard]);
  const [dragOver, setDragOver] = useState<TaskRow["status"] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [, startTransition] = useTransition();

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("taskId", taskId);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    setDragOver(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  }

  function handleDrop(e: React.DragEvent, targetStatus: TaskRow["status"]) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    setDragOver(null);

    // Find and move in local state immediately
    let movedTask: TaskRow | undefined;
    const newBoard = { ...board };
    for (const col of Object.keys(newBoard) as TaskRow["status"][]) {
      const idx = newBoard[col].findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        movedTask = newBoard[col][idx];
        newBoard[col] = newBoard[col].filter((t) => t.id !== taskId);
        break;
      }
    }
    if (!movedTask || movedTask.status === targetStatus) return;
    movedTask = { ...movedTask, status: targetStatus };
    newBoard[targetStatus] = [movedTask, ...newBoard[targetStatus]];
    setBoard(newBoard);

    startTransition(() => { moveTask(taskId, targetStatus); });
  }

  function handleDelete(taskId: string, status: TaskRow["status"]) {
    setBoard((prev) => ({ ...prev, [status]: prev[status].filter((t) => t.id !== taskId) }));
    startTransition(() => { deleteTask(taskId); });
  }

  function openEdit(task: TaskRow) {
    setEditingTask(task);
    setShowModal(true);
  }

  const totalTasks = Object.values(board).flat().length;

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            ◆ Module 5
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Tasks
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tracking-wider text-muted-foreground">
            {totalTasks} total
          </span>
          <Button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="gap-2 font-mono uppercase tracking-wider text-xs"
          >
            <Plus size={16} />
            New Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col transition-colors min-h-[400px] ${
              dragOver === col.status ? "border-primary bg-muted/50" : "border-border"
            }`}
          >
            {/* Column header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="font-mono text-[10px] tracking-widest uppercase font-semibold">
                  {col.label}
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {board[col.status].length}
              </Badge>
            </div>

            {/* Cards */}
            <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto">
              {board[col.status].map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={() => openEdit(task)}
                  onDelete={() => handleDelete(task.id, task.status)}
                />
              ))}
              {board[col.status].length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <p className="font-mono text-xs text-muted-foreground tracking-wider border border-dashed rounded-lg px-4 py-8 w-full text-center">
                    Drop here
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          members={members}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}

function KanbanCard({
  task, onDragStart, onDragEnd, onEdit, onDelete,
}: {
  task: TaskRow;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_COLOR[task.priority]}`} />
          <p className="text-sm font-semibold leading-tight break-words">{task.title}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {task.description && (
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {task.assignee && (
              <Badge variant="outline" className="font-mono text-[9px] tracking-widest px-1.5 py-0">
                {task.assignee.name.split(" ")[0]}
              </Badge>
            )}
            {task.dueDate && (
              <div className={`flex items-center gap-1 font-mono text-[9px] ${isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                <CalendarDays size={10} />
                {new Date(task.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={onEdit}
            >
              <Edit2 size={10} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 size={10} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
