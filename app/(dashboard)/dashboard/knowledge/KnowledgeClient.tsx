"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DocumentRow } from "@/app/lib/queries";
import DocumentModal from "./DocumentModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Plus, FileText } from "lucide-react";

export default function KnowledgeClient({
  docs,
  categories,
  initialSearch,
  initialCategory,
}: {
  docs: DocumentRow[];
  categories: string[];
  initialSearch: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "ALL") params.set("category", category);
      startTransition(() => {
        router.push(`/dashboard/knowledge?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, category, router]);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            ◆ Module 6
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Knowledge Base
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tracking-wider text-muted-foreground">
            {docs.length} docs
          </span>
          <Button
            onClick={() => setShowModal(true)}
            className="gap-2 font-mono uppercase tracking-wider text-xs"
          >
            <Plus size={16} />
            New Doc
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono"
          />
        </div>
        <Select 
          value={category || "ALL"} 
          onValueChange={(val) => setCategory(val === "ALL" || !val ? "" : val)}
        >
          <SelectTrigger className="w-full sm:w-[200px] font-mono">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {docs.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl">
          <p className="font-mono text-sm text-muted-foreground tracking-wider">
            No documents found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docs.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {showModal && (
        <DocumentModal
          doc={null}
          categories={categories}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function DocCard({ doc }: { doc: DocumentRow }) {
  return (
    <Link href={`/dashboard/knowledge/${doc.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors shadow-sm cursor-pointer overflow-hidden group">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between mb-2">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground group-hover:text-primary transition-colors">
              {doc.category}
            </span>
            <FileText size={14} className="text-muted-foreground opacity-50" />
          </div>
          <p className="text-base font-bold leading-tight line-clamp-2">
            {doc.title}
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-0 mt-auto">
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <span className="font-mono text-[10px] text-muted-foreground">
              {doc.author.name.split(" ")[0]}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {new Date(doc.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
