import Link from "next/link";
import { getAllLabs } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import { LabSolvedBadge } from "@/components/labs/lab-solved-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Activity, PlayCircle } from "lucide-react";
import { getTotalActions } from "@/lib/labs/replay";

export const metadata = {
  title: "Labs - Interactive Incident Replays",
  description:
    "Watch real and reconstructed intrusions unfold at machine speed. Interactive attack-chain replays with phase-by-phase breakdowns.",
};

export default async function LabsPage() {
  const labs = await getAllLabs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Labs</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Interactive <strong>incident replays</strong>. Press play and watch an
          intrusion unfold at machine speed — the attack chain lights up one
          trust boundary at a time, phase activity climbs, and every step is
          annotated with the commands and the defensive lesson. The best way to
          learn attack surface management is to watch a real one fail.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {labs.map((lab) => (
          <Link key={lab.slug} href={`/labs/${lab.slug}`}>
            <Card className="group h-full transition-colors hover:border-[var(--primary)]">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge difficulty={lab.difficulty} />
                  <Badge variant="outline">{lab.category}</Badge>
                  {lab.fictional ? (
                    <Badge variant="outline">Fictional</Badge>
                  ) : (
                    <Badge variant="outline">Real incident</Badge>
                  )}
                  {lab.controls && lab.controls.length > 0 && (
                    <Badge variant="outline">🛡 Defender challenge</Badge>
                  )}
                  <span className="ml-auto">
                    <LabSolvedBadge slug={lab.slug} />
                  </span>
                </div>
                <CardTitle className="mt-2 flex items-center gap-2 text-lg">
                  <PlayCircle className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                  {lab.title}
                </CardTitle>
                <CardDescription>{lab.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lab.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      {getTotalActions(lab).toLocaleString("en-US")} actions
                    </span>
                  </div>
                  <span className="inline-flex items-center text-[var(--primary)]">
                    Replay <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
