import { notFound } from "next/navigation";
import { getDocumentBySlug, getDocumentCategories } from "@/app/lib/queries";
import DocViewer from "./DocViewer";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doc, categories] = await Promise.all([
    getDocumentBySlug(slug),
    getDocumentCategories(),
  ]);
  if (!doc) notFound();

  return (
    <main
      className="relative grid-bg"
      style={{ minHeight: "calc(100vh - 52px)", paddingTop: "2.5rem", paddingBottom: "4rem" }}
    >
      <div className="noise-overlay" />
      <DocViewer doc={doc} categories={categories} />
    </main>
  );
}
