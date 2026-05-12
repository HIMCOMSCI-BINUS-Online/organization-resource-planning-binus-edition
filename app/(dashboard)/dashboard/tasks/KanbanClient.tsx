"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { gsap } from "gsap";
import { moveTask, deleteTask } from "@/app/actions/tasks";
import type { KanbanBoard, TaskRow, MemberRow } from "@/app/lib/queries";
import TaskModal from "./TaskModal";

const cx: React.CSSProperties = {
  maxWidth: "1280px", marginLeft: "auto", marginRight: "auto",
  paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", width: "100%",
};
const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const COLUMNS: { status: TaskRow["status"]; label: string; color: string }[] = [
  { status: "TODO",        label: "To Do",       color: "rgba(255,255,255,0.25)" },
  { status: "IN_PROGRESS", label: "In Progress", color: "rgba(255,200,80,0.7)" },
  { status: "REVIEW",      label: "Review",      color: "rgba(100,180,255,0.7)" },
  { status: "DONE",        label: "Done",        color: "rgba(140,255,140,0.7)" },
];

const PRIORITY_COLOR: Record<TaskRow["priority"], string> = {
  HIGH: "rgba(255,100,100,0.8)",
  MEDIUM: "rgba(255,200,80,0.7)",
  LOW: "rgba(255,255,255,0.25)",
};

export default function KanbanClient({
  board: initialBoard,
  members,
}: {
  board: KanbanBoard;
  members: MemberRow[];
}) {
  const [board, setBoard] = useState(initialBoard);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskRow["status"] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [, startTransition] = useTransition();

  const headerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(headerRef.current, { y: 24, opacity: 0, duration: 0.7 })
      .from(
        columnsRef.current ? Array.from(columnsRef.current.children) : [],
        { y: 18, opacity: 0, stagger: 0.08, duration: 0.5 },
        "-=0.35"
      );
  }, []);

  // Animate new card in
  function animateCard(el: HTMLElement | null) {
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("taskId", taskId);
    setDragging(taskId);
    if (e.currentTarget instanceof HTMLElement) {
      gsap.to(e.currentTarget, { opacity: 0.4, scale: 0.97, duration: 0.2 });
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    setDragging(null);
    setDragOver(null);
    if (e.currentTarget instanceof HTMLElement) {
      gsap.to(e.currentTarget, { opacity: 1, scale: 1, duration: 0.2 });
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
    <div style={{ position: "relative", zIndex: 10 }}>
      <div style={cx}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>Tasks</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>{totalTasks} total</span>
            <button
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", background: "#fff", border: "none", padding: "0.65rem 1.25rem", fontWeight: 700, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Board */}
        <div
          ref={columnsRef}
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", alignItems: "start" }}
        >
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              style={{
                background: dragOver === col.status ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                border: "1px solid",
                borderColor: dragOver === col.status ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
                minHeight: "200px",
                transition: "all 0.15s",
              }}
            >
              {/* Column header */}
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                  <span style={{ ...MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{col.label}</span>
                </div>
                <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{board[col.status].length}</span>
              </div>

              {/* Cards */}
              <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {board[col.status].map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onMount={animateCard}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={() => openEdit(task)}
                    onDelete={() => handleDelete(task.id, task.status)}
                  />
                ))}
                {board[col.status].length === 0 && (
                  <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.1)", textAlign: "center", padding: "1.5rem 0", letterSpacing: "0.1em" }}>Drop here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          members={members}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSaved={(saved) => {
            setBoard((prev) => {
              const newBoard = { ...prev };
              if (editingTask) {
                newBoard[editingTask.status] = prev[editingTask.status].filter((t) => t.id !== saved.id);
              }
              newBoard[saved.status] = [saved, ...newBoard[saved.status].filter((t) => t.id !== saved.id)];
              return newBoard;
            });
          }}
        />
      )}
    </div>
  );
}

function KanbanCard({
  task, onMount, onDragStart, onDragEnd, onEdit, onDelete,
}: {
  task: TaskRow;
  onMount: (el: HTMLElement | null) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { onMount(ref.current); }, []);  // eslint-disable-line

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      style={{
        background: "#000",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "0.85rem",
        cursor: "grab",
        transition: "border-color 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.2)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)")}
    >
      {/* Priority dot + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: PRIORITY_COLOR[task.priority], flexShrink: 0, marginTop: "5px" }} />
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", lineHeight: 1.4, letterSpacing: "-0.01em" }}>{task.title}</p>
      </div>

      {task.description && (
        <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: "0.5rem", marginLeft: "1rem" }}>{task.description.slice(0, 80)}{task.description.length > 80 ? "…" : ""}</p>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginLeft: "1rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {task.assignee && (
            <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)", padding: "0.1rem 0.4rem" }}>
              {task.assignee.name.split(" ")[0]}
            </span>
          )}
          {task.dueDate && (
            <span style={{ ...MONO, fontSize: "9px", color: isOverdue ? "rgba(255,100,100,0.8)" : "rgba(255,255,255,0.2)" }}>
              {new Date(task.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <button onClick={onEdit} style={{ ...MONO, fontSize: "9px", color: "rgba(255,255,255,0.2)", background: "transparent", border: "none", padding: "0.15rem 0.3rem", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}><Pencil size={12} /></button>
          <button onClick={onDelete} style={{ ...MONO, fontSize: "9px", color: "rgba(255,80,80,0.3)", background: "transparent", border: "none", padding: "0.15rem 0.3rem", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.9)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,80,80,0.3)")}><X size={12} /></button>
        </div>
      </div>
    </div>
  );
}
