import { notFound } from "next/navigation";
import { getAllModules } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import { CodeBlock } from "@/components/content/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Target, CheckCircle } from "lucide-react";

export async function generateStaticParams() {
  const modules = await getAllModules();
  return modules.map((m) => ({ slug: `module-${m.id}` }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modules = await getAllModules();
  const mod = modules.find((m) => `module-${m.id}` === slug);

  if (!mod) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline">Module {mod.id}</Badge>
          <DifficultyBadge difficulty={mod.difficulty} />
          <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3.5 w-3.5" />
            {mod.timeEstimate.display}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{mod.title}</h1>
        {mod.prerequisites.length > 0 && (
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            <strong>Prerequisites:</strong> {mod.prerequisites.join(", ")}
          </p>
        )}
      </div>

      <Separator />

      {/* Learning Objectives */}
      {mod.objectives.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <Target className="h-5 w-5" />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {mod.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resources */}
      {mod.resources.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5" />
            Resources
          </h2>
          <ul className="space-y-1">
            {mod.resources.map((res, i) => (
              <li key={i}>
                <span className="text-[hsl(var(--primary))]">{res.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Activities */}
      {mod.activities.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Hands-On Activities</h2>
          <ol className="space-y-2 list-decimal list-inside">
            {mod.activities.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Success Criteria */}
      {mod.successCriteria.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5" />
            Success Criteria
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {mod.successCriteria.map((sc) => (
                  <li key={sc.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[hsl(var(--border))]"
                      disabled
                    />
                    <span>{sc.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
