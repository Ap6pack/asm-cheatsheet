import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-8 text-center">
      {Icon && (
        <Icon className="mx-auto h-10 w-10 text-[var(--muted-foreground)] opacity-40 mb-3" />
      )}
      <h3 className="font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
