import { Suspense } from "react";
import { getLedgerEntries, getLedgerCategories } from "@/app/lib/queries";
import LedgerClient from "./LedgerClient";
import LedgerSkeleton from "./LedgerSkeleton";

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const type = params.type === "INCOME" ? "INCOME" : params.type === "EXPENSE" ? "EXPENSE" : undefined;
  const category = params.category ?? "";
  const page = Number(params.page ?? 1);

  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <Suspense fallback={<LedgerSkeleton />}>
        <LedgerContent search={search} type={type} category={category} page={page} />
      </Suspense>
    </main>
  );
}

async function LedgerContent({
  search, type, category, page,
}: {
  search: string;
  type?: "INCOME" | "EXPENSE";
  category: string;
  page: number;
}) {
  const [summary, categories] = await Promise.all([
    getLedgerEntries({ search, type, category: category || undefined, page }),
    getLedgerCategories(),
  ]);

  return (
    <LedgerClient
      summary={summary}
      categories={categories}
      initialSearch={search}
      initialType={type ?? "ALL"}
      initialCategory={category}
      page={page}
    />
  );
}
