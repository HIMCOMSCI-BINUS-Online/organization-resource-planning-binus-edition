import { Suspense } from "react";
import { getReportStats } from "@/app/lib/queries";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent />
      </Suspense>
    </main>
  );
}

async function ReportsContent() {
  const stats = await getReportStats();
  return <ReportsClient stats={stats} />;
}

function ReportsSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "200px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: "160px", background: "#000" }} />
        ))}
      </div>
    </div>
  );
}
