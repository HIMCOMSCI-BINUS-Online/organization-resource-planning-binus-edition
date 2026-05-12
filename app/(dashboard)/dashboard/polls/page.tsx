import { Suspense } from "react";
import { getPolls } from "@/app/lib/queries";
import PollsClient from "./PollsClient";

export default async function PollsPage() {
  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <Suspense fallback={<PollsSkeleton />}>
        <PollsContent />
      </Suspense>
    </main>
  );
}

async function PollsContent() {
  const polls = await getPolls();
  return <PollsClient polls={polls} />;
}

function PollsSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "180px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: "90px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1px" }} />
      ))}
    </div>
  );
}
