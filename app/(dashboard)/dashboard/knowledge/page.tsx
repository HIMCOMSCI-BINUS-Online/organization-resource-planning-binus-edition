import { Suspense } from "react";
import { getDocuments, getDocumentCategories } from "@/app/lib/queries";
import KnowledgeClient from "./KnowledgeClient";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category ?? "";

  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <Suspense fallback={<KnowledgeSkeleton />}>
        <KnowledgeContent search={search} category={category} />
      </Suspense>
    </main>
  );
}

async function KnowledgeContent({ search, category }: { search: string; category: string }) {
  const [docs, categories] = await Promise.all([
    getDocuments({ search, category: category || undefined }),
    getDocumentCategories(),
  ]);
  return <KnowledgeClient docs={docs} categories={categories} initialSearch={search} initialCategory={category} />;
}

function KnowledgeSkeleton() {
  return (
    <div style={{ maxWidth: "1280px", marginLeft: "auto", marginRight: "auto", paddingLeft: "clamp(1.25rem,4vw,3rem)", paddingRight: "clamp(1.25rem,4vw,3rem)", position: "relative", zIndex: 10 }}>
      <div style={{ height: "42px", width: "220px", background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "#000", padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ height: "10px", width: "70px", background: "rgba(255,255,255,0.06)", marginBottom: "0.75rem" }} />
            <div style={{ height: "18px", width: "80%", background: "rgba(255,255,255,0.06)", marginBottom: "0.5rem" }} />
            <div style={{ height: "10px", width: "50%", background: "rgba(255,255,255,0.04)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
