import { notFound } from "next/navigation";
import { getAllScenarios } from "@/lib/content/loader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { SteppedRunner } from "@/components/content/stepped-runner";
import { AuthorizationGate } from "@/components/content/authorization-gate";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export async function generateStaticParams() {
  const scenarios = await getAllScenarios();
  return scenarios.map((sc) => ({ slug: sc.slug }));
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenarios = await getAllScenarios();
  const sc = scenarios.find((s) => s.slug === slug);

  if (!sc) notFound();

  return (
    <AuthorizationGate>
      <div className="max-w-4xl space-y-8">
        <Breadcrumbs title={sc.title} />
        <div>
          <Badge variant="outline" className="mb-3">
            Scenario {sc.id}
          </Badge>
          <h1 className="text-3xl font-bold">{sc.title}</h1>
          {sc.subtitle && (
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              {sc.subtitle}
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

        {/* Interactive Scenario */}
        <SteppedRunner
          id={`scenario-${sc.id}`}
          title={sc.title}
          mode="scenario"
          steps={sc.phases.map((phase) => ({
            number: phase.phaseNumber,
            title: phase.title,
            timeEstimate: phase.timeEstimate,
            codeBlocks: phase.codeBlocks,
          }))}
        />
      </div>
    </AuthorizationGate>
  );
}
