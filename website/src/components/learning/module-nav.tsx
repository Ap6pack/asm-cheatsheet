import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ModuleNavLink {
  id: number;
  title: string;
}

interface ModuleNavProps {
  prev?: ModuleNavLink;
  next?: ModuleNavLink;
}

export function ModuleNav({ prev, next }: ModuleNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Module navigation"
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
    >
      {prev ? (
        <Link
          href={`/learn/module-${prev.id}`}
          className="group flex flex-1 items-center gap-3 rounded-lg border border-[var(--border)] p-4 transition-colors hover:border-[var(--primary)]"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
          <div className="min-w-0">
            <p className="text-xs text-[var(--muted-foreground)]">
              Previous · Module {prev.id}
            </p>
            <p className="truncate font-medium group-hover:text-[var(--primary)]">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/learn/module-${next.id}`}
          className="group flex flex-1 items-center justify-end gap-3 rounded-lg border border-[var(--border)] p-4 text-right transition-colors hover:border-[var(--primary)]"
        >
          <div className="min-w-0">
            <p className="text-xs text-[var(--muted-foreground)]">
              Next · Module {next.id}
            </p>
            <p className="truncate font-medium group-hover:text-[var(--primary)]">
              {next.title}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
