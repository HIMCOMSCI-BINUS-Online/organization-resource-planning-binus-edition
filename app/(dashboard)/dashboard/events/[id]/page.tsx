import { notFound } from "next/navigation";
import { getEventById, getMembers } from "@/app/lib/queries";
import AttendanceManager from "./AttendanceManager";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, { members }] = await Promise.all([
    getEventById(id),
    getMembers({ isActive: true, perPage: 200 }),
  ]);
  if (!event) notFound();

  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <AttendanceManager event={event} members={members} />
    </main>
  );
}
