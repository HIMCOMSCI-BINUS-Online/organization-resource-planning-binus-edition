import { Suspense } from "react";
import { getKanbanBoard } from "@/app/lib/queries";
import { getMembers } from "@/app/lib/queries";
import KanbanClient from "./KanbanClient";

export default async function TasksPage() {
  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanContent />
      </Suspense>
    </main>
  );
}

async function KanbanContent() {
  const [board, { members }] = await Promise.all([
    getKanbanBoard(),
    getMembers({ isActive: true, perPage: 100 }),
  ]);

  return <KanbanClient board={board} members={members} />;
}

function KanbanSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", marginLeft: "auto", marginRight: "auto", paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "200px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", padding: "1rem" }}>
            <div style={{ height: "10px", width: "80px", background: "rgba(255,255,255,0.06)", marginBottom: "1rem" }} />
            {Array.from({ length: 3 - i }).map((_, j) => (
              <div key={j} style={{ height: "72px", background: "rgba(255,255,255,0.04)", marginBottom: "0.5rem" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
