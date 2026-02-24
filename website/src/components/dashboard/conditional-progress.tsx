"use client";

import { useProgressStore, useBookmarksStore, useHydration } from "@/lib/stores";
import { ProgressOverview } from "./progress-overview";
import { BookmarksList } from "./bookmarks-list";

interface ConditionalProgressProps {
  totalModules: number;
  totalWorkflows: number;
  totalScenarios: number;
}

export function ConditionalProgress({
  totalModules,
  totalWorkflows,
  totalScenarios,
}: ConditionalProgressProps) {
  const hydrated = useHydration();
  const { moduleStarted, workflowProgress, scenarioProgress } =
    useProgressStore();
  const { bookmarks } = useBookmarksStore();

  if (!hydrated) return null;

  const hasProgress =
    Object.values(moduleStarted).some(Boolean) ||
    Object.keys(workflowProgress).length > 0 ||
    Object.keys(scenarioProgress).length > 0;
  const hasBookmarks = bookmarks.length > 0;

  if (!hasProgress && !hasBookmarks) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Your Progress</h2>
      {hasProgress && (
        <ProgressOverview
          totalModules={totalModules}
          totalWorkflows={totalWorkflows}
          totalScenarios={totalScenarios}
        />
      )}
      {hasBookmarks && <BookmarksList />}
    </section>
  );
}
