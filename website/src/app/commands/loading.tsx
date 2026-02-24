export default function CommandsLoading() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-8 w-56 bg-[var(--muted)] rounded animate-pulse" />
        <div className="mt-2 h-5 w-80 bg-[var(--muted)] rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-[var(--muted)] rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-7 w-40 bg-[var(--muted)] rounded animate-pulse mb-3" />
            <div className="h-24 w-full bg-[var(--muted)] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
