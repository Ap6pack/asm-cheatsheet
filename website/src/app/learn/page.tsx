import Link from "next/link";
import { getAllModules } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Learning Path - ASM Cheatsheet",
  description: "12-module structured ASM curriculum from beginner to advanced.",
};

export default async function LearnPage() {
  const modules = await getAllModules();

  const tracks = [
    { name: "Beginner Track", emoji: "🟢", modules: modules.filter((m) => m.track.includes("Beginner")) },
    { name: "Intermediate Track", emoji: "🟡", modules: modules.filter((m) => m.track.includes("Intermediate")) },
    { name: "Advanced Track", emoji: "🔴", modules: modules.filter((m) => m.track.includes("Advanced")) },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Learning Path</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {modules.length}-module structured curriculum for mastering Attack
          Surface Management.
        </p>
      </div>

      {tracks.map((track) => (
        <section key={track.name}>
          <h2 className="text-2xl font-semibold mb-4">
            {track.emoji} {track.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {track.modules.map((mod) => (
              <Link key={mod.id} href={`/learn/module-${mod.id}`}>
                <Card className="h-full transition-colors hover:border-[hsl(var(--primary))]">
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
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
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
                      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {mod.objectives[0]}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center text-sm text-[hsl(var(--primary))]">
                      Start Module <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
