"use client";

import { Progress } from "@/components/ui/progress";
import { useProgressStore, useHydration } from "@/lib/stores";
import { CheckCircle, Award } from "lucide-react";

interface ModuleProgressCardProps {
  moduleId: string;
  totalCriteria: number;
}

export function ModuleProgressCard({ moduleId, totalCriteria }: ModuleProgressCardProps) {
  const hydrated = useHydration();
  const { getModuleProgress, isQuizPassed } = useProgressStore();

  if (!hydrated) return null;

  const progress = totalCriteria > 0 ? getModuleProgress(moduleId, totalCriteria) : 0;
  const quizPassed = isQuizPassed(moduleId);

  if (progress === 0 && !quizPassed) return null;

  // A module counts as completed once its knowledge check has been passed
  if (quizPassed) {
    return (
      <div className="mt-3 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
        <Award className="h-4 w-4" />
        <span>Completed{progress === 100 ? "" : " · Quiz passed"}</span>
        {progress === 100 && <CheckCircle className="h-4 w-4" />}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
