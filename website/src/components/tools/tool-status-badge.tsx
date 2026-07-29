import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleAlert } from "lucide-react";
import type { ToolStatus } from "@/lib/content/types";

interface ToolStatusBadgeProps {
  status: ToolStatus;
  note?: string;
}

/**
 * Surfaces whether a tool is still actively developed. Adopting an unmaintained
 * recon tool is a real risk, so this is deliberately visible rather than buried.
 */
export function ToolStatusBadge({ status, note }: ToolStatusBadgeProps) {
  if (status === "unknown") return null;

  const isActive = status === "active";

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={
          isActive
            ? "border-green-500/50 text-green-700 dark:text-green-400"
            : "border-amber-500/50 text-amber-700 dark:text-amber-400"
        }
        title={note}
      >
        {isActive ? (
          <CircleCheck className="mr-1 h-3 w-3" />
        ) : (
          <CircleAlert className="mr-1 h-3 w-3" />
        )}
        {isActive ? "Actively maintained" : "Legacy"}
      </Badge>
    </span>
  );
}
