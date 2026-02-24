import { notFound } from "next/navigation";
import { getAllWorkflows } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertTriangle } from "lucide-react";
import { SteppedRunner } from "@/components/content/stepped-runner";
import { AuthorizationGate } from "@/components/content/authorization-gate";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export async function generateStaticParams() {
  const workflows = await getAllWorkflows();
  return workflows.map((wf) => ({ slug: wf.slug }));
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflows = await getAllWorkflows();
  const wf = workflows.find((w) => w.slug === slug);

  if (!wf) notFound();

  return (
    <AuthorizationGate>
      <div className="max-w-4xl space-y-8">
        <Breadcrumbs title={wf.title} />
        <div>
          <div className="flex items-center gap-3 mb-3">
            <DifficultyBadge difficulty={wf.difficulty} />
            {wf.timeEstimate.display && (
              <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                <Clock className="h-3.5 w-3.5" />
                {wf.timeEstimate.display}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{wf.title}</h1>
          {wf.scenario && (
            <p className="mt-2 text-[var(--muted-foreground)]">
              {wf.scenario}
            </p>
          )}
          {wf.prerequisites && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              <strong>Prerequisites:</strong> {wf.prerequisites}
            </p>
          )}
        </div>

        {/* Authorization Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50/50 p-4 dark:bg-yellow-900/10">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Authorization Required:</strong> Only scan domains and IP
            addresses you own or have explicit written permission to test.
          </div>
        </div>

        <Separator />

        {/* Interactive Workflow */}
        {wf.steps.length > 0 ? (
          <SteppedRunner
            id={wf.id}
            title={wf.title}
            mode="workflow"
            steps={wf.steps.map((step) => ({
              number: step.stepNumber,
              title: step.title,
              timeEstimate: step.timeEstimate,
              codeBlocks: step.codeBlocks,
            }))}
          />
        ) : (
          <p className="text-[var(--muted-foreground)]">
            This workflow contains detailed instructions in the content below.
          </p>
        )}
      </div>
    </AuthorizationGate>
  );
}
