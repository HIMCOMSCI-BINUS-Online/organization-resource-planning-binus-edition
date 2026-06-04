"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteDocument } from "@/app/actions/documents";
import type { DocumentFull } from "@/app/lib/queries";
import DocumentModal from "../DocumentModal";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocViewer({
  doc,
  categories,
}: {
  doc: DocumentFull;
  categories: string[];
}) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this document?")) return;
    startDelete(async () => {
      await deleteDocument(doc.id, doc.slug);
      router.push("/dashboard/knowledge");
    });
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <Link 
        href="/dashboard/knowledge"
        className={buttonVariants({ variant: "ghost" }) + " font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground mb-4 pl-0"}
      >
        <ArrowLeft size={14} className="mr-2" />
        Knowledge
      </Link>

      {/* Header */}
      <div className="pb-8 border-b border-border">
        <Badge variant="secondary" className="font-mono text-[10px] tracking-widest uppercase mb-4">
          {doc.category}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
          {doc.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-mono text-xs text-muted-foreground">
              By {doc.author.name}
            </span>
            <span className="font-mono text-xs text-muted-foreground opacity-75">
              Updated {new Date(doc.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="font-mono text-[10px] tracking-widest uppercase"
            >
              <Edit2 size={12} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="font-mono text-[10px] tracking-widest uppercase"
            >
              <Trash2 size={12} className="mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Markdown body */}
      <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:underline-offset-4 prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-black tracking-tight mt-10 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4 border-b border-border/50 pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3">{children}</h3>,
            p: ({ children }) => <p className="leading-relaxed mb-4 text-muted-foreground">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">{children}</blockquote>,
            code: ({ children, className }) => {
              const isBlock = className?.startsWith("language-");
              return isBlock
                ? <code className="block bg-muted border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">{children}</code>
                : <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-foreground">{children}</code>;
            },
            pre: ({ children }) => <pre className="mb-4">{children}</pre>,
            hr: () => <hr className="my-8 border-border" />,
            a: ({ href, children }) => <a href={href} className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">{children}</a>,
            table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm font-mono border-collapse">{children}</table></div>,
            th: ({ children }) => <th className="border border-border p-2 text-left bg-muted/50 text-muted-foreground tracking-wider uppercase text-xs">{children}</th>,
            td: ({ children }) => <td className="border border-border p-2 text-muted-foreground">{children}</td>,
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>

      {showEdit && (
        <DocumentModal
          doc={doc}
          categories={categories}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
