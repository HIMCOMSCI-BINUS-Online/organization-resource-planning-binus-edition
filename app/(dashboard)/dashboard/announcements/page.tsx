import { Suspense } from "react";
import { getAnnouncements } from "@/app/lib/queries";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <Suspense fallback={<AnnouncementsSkeleton />}>
        <AnnouncementsContent />
      </Suspense>
    </main>
  );
}

async function AnnouncementsContent() {
  const announcements = await getAnnouncements();
  return <AnnouncementsClient announcements={announcements} />;
}

function AnnouncementsSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "240px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: "100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1px" }} />
      ))}
    </div>
  );
}
