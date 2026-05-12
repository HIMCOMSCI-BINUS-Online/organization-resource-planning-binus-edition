import { Suspense } from "react";
import { getEvents } from "@/app/lib/queries";
import EventsClient from "./EventsClient";

export default async function EventsPage() {
  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <Suspense fallback={<EventsSkeleton />}>
        <EventsContent />
      </Suspense>
    </main>
  );
}

async function EventsContent() {
  const events = await getEvents();
  return <EventsClient events={events} />;
}

function EventsSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "200px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: "140px", background: "#000" }} />
        ))}
      </div>
    </div>
  );
}
