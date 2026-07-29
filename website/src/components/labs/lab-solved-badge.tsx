"use client";

import { CheckCircle } from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";

/** Shows a "Replayed" badge on a lab card once the learner has finished it. */
export function LabSolvedBadge({ slug }: { slug: string }) {
  const hydrated = useHydration();
  const isLabComplete = useProgressStore((s) => s.isLabComplete);

  if (!hydrated || !isLabComplete(slug)) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
      <CheckCircle className="h-3.5 w-3.5" />
      Replayed
    </span>
  );
}
