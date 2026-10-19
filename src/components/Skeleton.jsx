/**
 * Apple / Mobbin-Style Minimal Skeletons with Continuous Shimmer Waves
 */

export function ItemCardSkeleton({ delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fadeIn rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
    >
      {/* Photo Area Skeleton */}
      <div className="relative w-full aspect-[4/3] shimmer-bg">
        {/* Status Pill Placeholder */}
        <div className="absolute top-2.5 right-2.5">
          <div className="w-24 h-5 rounded-full shimmer-bg opacity-75 border border-white/40 dark:border-slate-700/40" />
        </div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Title */}
          <div className="h-4 w-4/5 rounded-md shimmer-bg" />
          {/* Category */}
          <div className="h-3 w-2/5 rounded-md shimmer-bg opacity-70" />

          {/* Meta rows */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full shimmer-bg shrink-0 opacity-60" />
              <div className="h-3 w-3/5 rounded-md shimmer-bg opacity-70" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full shimmer-bg shrink-0 opacity-60" />
              <div className="h-3 w-2/5 rounded-md shimmer-bg opacity-70" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="h-3 w-24 rounded-md shimmer-bg opacity-60" />
          <div className="h-3 w-12 rounded-md shimmer-bg opacity-60" />
        </div>
      </div>
    </div>
  );
}

export function LostReportCardSkeleton({ delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fadeIn p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-24 rounded-full shimmer-bg" />
          <div className="h-5 w-20 rounded-full shimmer-bg opacity-80" />
        </div>

        {/* Thumb + Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-xl shimmer-bg shrink-0" />
          <div className="space-y-2 flex-1 pt-1">
            <div className="h-4 w-3/4 rounded-md shimmer-bg" />
            <div className="h-3 w-1/3 rounded-md shimmer-bg opacity-70" />
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-3/5 rounded-md shimmer-bg opacity-70" />
          <div className="h-3 w-2/5 rounded-md shimmer-bg opacity-70" />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="h-3 w-20 rounded-md shimmer-bg opacity-60" />
        <div className="h-3 w-20 rounded-md shimmer-bg opacity-60" />
      </div>
    </div>
  );
}

export function FeedSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ItemCardSkeleton key={idx} delay={idx * 50} />
      ))}
    </div>
  );
}

export function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      {/* Header bar skeleton */}
      <div className="w-full h-18 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-6 w-28 rounded-md shimmer-bg" />
          <div className="hidden md:flex items-center gap-3">
            <div className="h-5 w-16 rounded-full shimmer-bg opacity-70" />
            <div className="h-5 w-24 rounded-full shimmer-bg opacity-70" />
            <div className="h-5 w-24 rounded-full shimmer-bg opacity-70" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full shimmer-bg opacity-80" />
          <div className="w-8 h-8 rounded-full shimmer-bg opacity-80" />
          <div className="w-9 h-9 rounded-full shimmer-bg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="w-full bg-slate-950 px-5 sm:px-8 pt-12 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-3 w-48 rounded-md shimmer-bg opacity-50" />
          <div className="h-10 sm:h-12 w-3/4 sm:w-1/2 rounded-xl shimmer-bg opacity-40" />
          <div className="h-4 w-4/5 sm:w-1/3 rounded-md shimmer-bg opacity-30" />
          <div className="pt-3 flex gap-3">
            <div className="h-10 w-36 rounded-full shimmer-bg opacity-40" />
            <div className="h-10 w-36 rounded-full shimmer-bg opacity-20" />
          </div>
          <div className="pt-2 flex items-center gap-4">
            <div className="h-3 w-24 rounded-md shimmer-bg opacity-30" />
            <div className="h-3 w-24 rounded-md shimmer-bg opacity-30" />
            <div className="h-3 w-24 rounded-md shimmer-bg opacity-30" />
          </div>
        </div>
      </div>

      {/* Floating search bar skeleton */}
      <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 -mt-7">
        <div className="h-14 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg shimmer-bg" />
      </div>

      {/* Feed cards skeleton */}
      <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 mt-8">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="h-4 w-28 rounded-md shimmer-bg" />
          <div className="h-4 w-20 rounded-md shimmer-bg opacity-70" />
          <div className="h-4 w-24 rounded-md shimmer-bg opacity-70" />
        </div>
        <div className="flex items-center gap-2 py-2 mb-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-24 rounded-full shimmer-bg shrink-0 opacity-70" />
          ))}
        </div>
        <FeedSkeletonGrid count={6} />
      </div>
    </div>
  );
}
