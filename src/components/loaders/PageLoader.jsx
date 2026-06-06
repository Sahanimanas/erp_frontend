/**
 * PageLoader.jsx
 * Full-page skeleton shown while a lazy route chunk is loading.
 */
export default function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 animate-pulse">
      {/* Welcome banner skeleton */}
      <div className="h-24 rounded-xl bg-slate-200 w-full" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 h-64 rounded-xl bg-slate-200" />
        <div className="lg:col-span-3 h-64 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

/**
 * TableSkeleton — used inside pages while data is fetching
 */
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-8 bg-slate-200 rounded w-full" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-11 bg-slate-100 rounded w-full" />
      ))}
    </div>
  );
}

/**
 * SpinnerLoader — inline spinner for button loading states
 */
export function SpinnerLoader({ size = 16, className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
