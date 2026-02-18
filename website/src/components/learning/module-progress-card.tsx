"use client";

import { Progress } from "@/components/ui/progress";
import { useProgressStore, useHydration } from "@/lib/stores";
import { CheckCircle } from "lucide-react";

interface ModuleProgressCardProps {
  moduleId: string;
  totalCriteria: number;
}

export function ModuleProgressCard({ moduleId, totalCriteria }: ModuleProgressCardProps) {
  const hydrated = useHydration();
  const { getModuleProgress, isModuleComplete } = useProgressStore();

  if (!hydrated || totalCriteria === 0) return null;

  const progress = getModuleProgress(moduleId, totalCriteria);
  const complete = isModuleComplete(moduleId, totalCriteria);

  if (progress === 0) return null;

  return (
    <div className="mt-3">
      {complete ? (
        <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>Completed</span>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
