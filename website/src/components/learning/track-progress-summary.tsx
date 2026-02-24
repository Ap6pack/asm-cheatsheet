"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useProgressStore, useHydration } from "@/lib/stores";
import { ArrowRight } from "lucide-react";

interface TrackInfo {
  name: string;
  emoji: string;
  moduleIds: string[];
  criteriaPerModule: Record<string, number>;
}

interface TrackProgressSummaryProps {
  tracks: TrackInfo[];
}

export function TrackProgressSummary({ tracks }: TrackProgressSummaryProps) {
  const hydrated = useHydration();
  const { moduleStarted, completedCriteria } = useProgressStore();

  if (!hydrated) return null;

  const hasAnyProgress = Object.values(moduleStarted).some(Boolean);
  if (!hasAnyProgress) return null;

  // Find the most recently started incomplete module for "continue" link
  const allModuleIds = tracks.flatMap((t) => t.moduleIds);
  const continueModule = allModuleIds.find((id) => {
    if (!moduleStarted[id]) return false;
    const track = tracks.find((t) => t.criteriaPerModule[id] !== undefined);
    if (!track) return false;
    const total = track.criteriaPerModule[id];
    const done = completedCriteria[id]?.length ?? 0;
    return done < total;
  });

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-5">
      <h2 className="text-lg font-semibold">Your Progress</h2>

      {tracks.map((track) => {
        const started = track.moduleIds.filter((id) => moduleStarted[id]).length;
        const total = track.moduleIds.length;
        const pct = total > 0 ? Math.round((started / total) * 100) : 0;

        return (
          <div key={track.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>
                {track.emoji} {track.name}
              </span>
              <span className="text-[var(--muted-foreground)]">
                {started}/{total}
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}

      {continueModule && (
        <Link
          href={`/learn/${continueModule}`}
          className="mt-2 inline-flex items-center text-sm text-[var(--primary)] hover:underline"
        >
          Continue where you left off
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
