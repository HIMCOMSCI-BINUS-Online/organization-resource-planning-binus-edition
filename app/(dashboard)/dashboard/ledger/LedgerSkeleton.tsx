export default function LedgerSkeleton() {
  return (
    <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3" />
          <div className="h-10 md:h-12 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden mb-10 border border-zinc-200 dark:border-zinc-800">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-100 dark:bg-zinc-900 p-6 md:p-8">
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-6" />
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-11 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-11 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-11 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      {/* Results count */}
      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none mb-6">
        <div className="hidden lg:grid grid-cols-[1fr_2.5fr_1fr_1.5fr_1fr_auto] gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr_1.5fr_1fr_auto] gap-3 lg:gap-4 p-4 lg:items-center">
              <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div>
                <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="hidden lg:block h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="hidden lg:block h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              <div className="hidden lg:flex gap-2">
                <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
