import Link from "next/link";
import { getAllWorkflows } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock, ArrowRight, ListChecks } from "lucide-react";

export const metadata = {
  title: "Workflows",
  description: "Step-by-step ASM procedures for common scenarios.",
};

export default async function WorkflowsPage() {
  const workflows = await getAllWorkflows();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Workflows</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {workflows.length} step-by-step procedures for common ASM scenarios,
          from beginner to advanced.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {workflows.map((wf) => (
          <Link key={wf.id} href={`/workflows/${wf.slug}`}>
            <Card className="h-full transition-colors hover:border-[hsl(var(--primary))]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={wf.difficulty} />
                  {wf.timeEstimate.display && (
                    <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                      <Clock className="h-3.5 w-3.5" />
                      {wf.timeEstimate.display}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{wf.title}</CardTitle>
                {wf.scenario && (
                  <CardDescription className="line-clamp-2">
                    {wf.scenario}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {wf.steps.length > 0 && (
                    <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                      <ListChecks className="h-3.5 w-3.5" />
                      {wf.steps.length} steps
                    </span>
                  )}
                  <span className="inline-flex items-center text-sm text-[hsl(var(--primary))]">
                    Start Workflow <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
