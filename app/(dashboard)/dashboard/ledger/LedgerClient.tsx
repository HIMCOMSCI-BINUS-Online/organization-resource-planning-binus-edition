"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { deleteLedgerEntry } from "@/app/actions/ledger";
import type { LedgerSummary, LedgerEntryRow } from "@/app/lib/queries";
import LedgerEntryModal from "./LedgerEntryModal";
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

type TypeFilter = "ALL" | "INCOME" | "EXPENSE";

export default function LedgerClient({
  summary,
  categories,
  initialSearch,
  initialType,
  initialCategory,
  page,
}: {
  summary: LedgerSummary;
  categories: string[];
  initialSearch: string;
  initialType: TypeFilter;
  initialCategory: string;
  page: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isPending, startDelete] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntryRow | null>(null);

  const pushFilters = useCallback(
    (overrides: Partial<{ search: string; type: TypeFilter; category: string; page: number }>) => {
      const params = new URLSearchParams();
      const s = overrides.search ?? search;
      const t = overrides.type ?? typeFilter;
      const c = overrides.category ?? categoryFilter;
      const p = overrides.page ?? 1;
      if (s) params.set("search", s);
      if (t !== "ALL") params.set("type", t);
      if (c && c !== "ALL") params.set("category", c);
      if (p > 1) params.set("page", String(p));
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [search, typeFilter, categoryFilter, pathname, router]
  );

  useEffect(() => {
    const t = setTimeout(() => pushFilters({ search }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const perPage = 25;
  const totalPages = Math.ceil(summary.total / perPage);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            ◆ Module 4
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Ledger
          </h1>
        </div>
        <Button
          onClick={() => { setEditingEntry(null); setShowModal(true); }}
          className="gap-2 font-mono uppercase tracking-wider text-xs"
        >
          <Plus size={16} />
          Add Entry
        </Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Total Income
            </CardTitle>
            <TrendingUp size={16} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              <span className="text-xl mr-1">Rp</span>
              {formatIDR(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Total Expense
            </CardTitle>
            <TrendingDown size={16} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
              <span className="text-xl mr-1">Rp</span>
              {formatIDR(summary.totalExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border bg-card">
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none ${summary.balance >= 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Balance
            </CardTitle>
            <Wallet size={16} className={summary.balance >= 0 ? "text-muted-foreground" : "text-red-400"} />
          </CardHeader>
          <CardContent className="relative z-10">
            <p className={`text-3xl font-black tracking-tight ${summary.balance >= 0 ? "text-foreground" : "text-red-600 dark:text-red-400"}`}>
              <span className="text-2xl mr-1 opacity-70">Rp</span>
              {formatIDR(summary.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono"
          />
        </div>
        
        <div className="flex gap-4">
          <Select 
            value={typeFilter} 
            onValueChange={(val) => { 
              const v = (val || "ALL") as TypeFilter;
              setTypeFilter(v); 
              pushFilters({ type: v }); 
            }}
          >
            <SelectTrigger className="w-[140px] font-mono">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={categoryFilter || "ALL"} 
            onValueChange={(val) => { 
              const newCategory = (val === "ALL" || !val) ? "" : val;
              setCategoryFilter(newCategory); 
              pushFilters({ category: newCategory }); 
            }}
          >
            <SelectTrigger className="w-[160px] font-mono">
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
      </div>

      <div className="space-y-4">
        <p className="font-mono text-xs tracking-wider text-muted-foreground px-1">
          {summary.total} {summary.total === 1 ? "entry" : "entries"}
        </p>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Date</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Title</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase hidden lg:table-cell">Category</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase">Amount</TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest uppercase hidden lg:table-cell">Type</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="font-mono text-sm text-muted-foreground tracking-wider">
                      No entries found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                summary.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground tracking-wider">
                      {new Date(entry.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-bold mb-0.5">{entry.title}</p>
                      {entry.description && (
                        <p className="font-mono text-[10px] text-muted-foreground max-w-[250px] truncate">
                          {entry.description}
                        </p>
                      )}
                      <div className="flex lg:hidden items-center gap-2 mt-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{entry.category}</span>
                        <Badge variant={entry.type === "INCOME" ? "outline" : "destructive"} className="font-mono text-[9px] tracking-widest uppercase border-dashed">
                          {entry.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                      {entry.category}
                    </TableCell>
                    <TableCell className={`font-bold ${entry.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {entry.type === "INCOME" ? "+" : "-"}Rp {formatIDR(entry.amount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={entry.type === "INCOME" ? "outline" : "destructive"} className="font-mono text-[9px] tracking-widest uppercase border-dashed">
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => { setEditingEntry(entry); setShowModal(true); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isPending}
                          onClick={() => startDelete(async () => { await deleteLedgerEntry(entry.id); })}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 items-center justify-center pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="w-8 h-8 font-mono text-xs"
                onClick={() => pushFilters({ page: p })}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <LedgerEntryModal
          entry={editingEntry}
          categories={categories}
          onClose={() => { setShowModal(false); setEditingEntry(null); }}
        />
      )}
    </div>
  );
}
