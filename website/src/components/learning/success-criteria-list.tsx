"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useProgressStore, useHydration } from "@/lib/stores";
import { cn } from "@/lib/utils/cn";

interface SuccessCriterion {
  id: string;
  text: string;
}

interface SuccessCriteriaListProps {
  moduleId: string;
  criteria: SuccessCriterion[];
}

export function SuccessCriteriaList({ moduleId, criteria }: SuccessCriteriaListProps) {
  const hydrated = useHydration();
  const { completedCriteria, toggleCriterion, getModuleProgress } = useProgressStore();

  const completed = hydrated ? (completedCriteria[moduleId] ?? []) : [];
  const progress = hydrated ? getModuleProgress(moduleId, criteria.length) : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Progress bar */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Checkboxes */}
        <ul className="space-y-3">
          {criteria.map((sc) => {
            const isChecked = completed.includes(sc.id);
            return (
              <li key={sc.id} className="flex items-center gap-3">
                <Checkbox
                  id={sc.id}
                  checked={isChecked}
                  onCheckedChange={() => toggleCriterion(moduleId, sc.id)}
                />
                <label
                  htmlFor={sc.id}
                  className={cn(
                    "text-sm cursor-pointer",
                    isChecked && "line-through text-[var(--muted-foreground)]"
                  )}
                >
                  {sc.text}
                </label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
