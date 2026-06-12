"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";

interface ContinueLearningProps {
  /** Modules in curriculum order */
  modules: { id: string; title: string }[];
}

/**
 * Points the learner at the next module to work on: the first module they
 * started (or made criteria progress on) without passing its quiz, falling
 * back to the first unpassed module. Hidden until the user has any progress,
 * matching the privacy-first pattern of the other dashboard components.
 */
export function ContinueLearning({ modules }: ContinueLearningProps) {
  const hydrated = useHydration();
  const { moduleStarted, completedCriteria, quizResults, isQuizPassed } =
    useProgressStore();

  if (!hydrated) return null;

  const hasAnyProgress =
    Object.values(moduleStarted).some(Boolean) ||
    Object.values(completedCriteria).some((c) => c.length > 0) ||
    Object.keys(quizResults).length > 0;

  if (!hasAnyProgress) return null;

  const inProgress = modules.find(
    (m) =>
      !isQuizPassed(m.id) &&
      (moduleStarted[m.id] || (completedCriteria[m.id]?.length ?? 0) > 0)
  );
  const upNext = inProgress ?? modules.find((m) => !isQuizPassed(m.id));

  if (!upNext) return null; // everything passed — nothing to point at

  return (
    <Card className="border-[var(--primary)]/40">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            {inProgress ? "Continue learning" : "Up next"}
          </p>
          <p className="font-medium">{upNext.title}</p>
        </div>
        <Button asChild>
          <Link href={`/learn/${upNext.id}`}>
            <Play className="mr-1.5 h-4 w-4" />
            {inProgress ? "Resume" : "Start"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
