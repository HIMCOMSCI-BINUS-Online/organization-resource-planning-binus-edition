import { Suspense } from "react";
import { getCurrentUser } from "@/app/lib/dal";
import { getDashboardStats } from "@/app/lib/queries";
import DashboardOverview from "./DashboardOverview";
import StatsSkeleton from "./StatsSkeleton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "3rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardContent userName={user!.name} />
      </Suspense>
    </main>
  );
}

async function DashboardContent({ userName }: { userName: string }) {
  const stats = await getDashboardStats();
  return <DashboardOverview stats={stats} userName={userName} />;
}
