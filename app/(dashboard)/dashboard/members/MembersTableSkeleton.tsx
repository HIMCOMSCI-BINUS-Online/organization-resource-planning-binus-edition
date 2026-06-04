export default function MembersTableSkeleton() {
  return (
    <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3" />
          <div className="h-10 md:h-12 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-11 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="flex gap-4">
          <div className="h-11 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-11 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Results count */}
      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none mb-6">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr] gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr] gap-2 md:gap-4 p-4 md:items-center">
              <div>
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="h-2 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="hidden md:block h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="hidden md:block h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="hidden md:block h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              <div className="hidden md:block h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
