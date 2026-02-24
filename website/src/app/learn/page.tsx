import Link from "next/link";
import { getAllModules } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, CheckCircle } from "lucide-react";
import { ModuleProgressCard } from "@/components/learning/module-progress-card";
import { TrackProgressSummary } from "@/components/learning/track-progress-summary";

export const metadata = {
  title: "Learning Path - ASM Cheatsheet",
  description:
    "12-module structured ASM curriculum from beginner to advanced.",
};

export default async function LearnPage() {
  const modules = await getAllModules();

  const tracks = [
    {
      name: "Beginner Track",
      emoji: "\u{1F7E2}",
      modules: modules.filter((m) => m.track.includes("Beginner")),
    },
    {
      name: "Intermediate Track",
      emoji: "\u{1F7E1}",
      modules: modules.filter((m) => m.track.includes("Intermediate")),
    },
    {
      name: "Advanced Track",
      emoji: "\u{1F534}",
      modules: modules.filter((m) => m.track.includes("Advanced")),
    },
  ];

  // Build data for the progress summary
  const trackProgressData = tracks.map((t) => ({
    name: t.name,
    emoji: t.emoji,
    moduleIds: t.modules.map((m) => `module-${m.id}`),
    criteriaPerModule: Object.fromEntries(
      t.modules.map((m) => [`module-${m.id}`, m.successCriteria.length])
    ),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Learning Path</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {modules.length}-module structured curriculum for mastering Attack
          Surface Management.
        </p>
      </div>

      {/* Track progress summary (only shows if user has started) */}
      <TrackProgressSummary tracks={trackProgressData} />

      {tracks.map((track) => (
        <section key={track.name}>
          <h2 className="text-2xl font-semibold mb-4">
            {track.emoji} {track.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {track.modules.map((mod) => (
              <Link key={mod.id} href={`/learn/module-${mod.id}`}>
                <Card className="h-full transition-colors hover:border-[var(--primary)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Module {mod.id}</Badge>
                      <DifficultyBadge difficulty={mod.difficulty} />
                    </div>
                    <CardTitle className="text-base mt-2">
                      {mod.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {mod.timeEstimate.display}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {mod.successCriteria.length} criteria
                      </span>
                    </div>
                    {mod.objectives.length > 0 && (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {mod.objectives[0]}
                      </p>
                    )}
                    <ModuleProgressCard
                      moduleId={`module-${mod.id}`}
                      totalCriteria={mod.successCriteria.length}
                    />
                    <span className="mt-3 inline-flex items-center text-sm text-[var(--primary)]">
                      Start Module{" "}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
