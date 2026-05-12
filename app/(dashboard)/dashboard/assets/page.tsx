import { Suspense } from "react";
import { getAssets, getAssetCategories, getMembers } from "@/app/lib/queries";
import AssetsClient from "./AssetsClient";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="relative grid-bg" style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      <div className="noise-overlay" />
      <Suspense fallback={<AssetsSkeleton />}>
        <AssetsContent category={params.category ?? ""} status={params.status ?? ""} />
      </Suspense>
    </main>
  );
}

async function AssetsContent({ category, status }: { category: string; status: string }) {
  const [assets, categories, { members }] = await Promise.all([
    getAssets({ category: category || undefined, status: status || undefined }),
    getAssetCategories(),
    getMembers({ isActive: true, perPage: 200 }),
  ]);
  return <AssetsClient assets={assets} categories={categories} members={members} initialCategory={category} initialStatus={status} />;
}

function AssetsSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "200px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: "120px", background: "#000" }} />
        ))}
      </div>
    </div>
  );
}
