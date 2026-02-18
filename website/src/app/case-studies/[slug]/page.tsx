import { notFound } from "next/navigation";
import { getAllCaseStudies } from "@/lib/content/loader";
import { CodeBlock } from "@/components/content/code-block";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Calendar, Users, CheckCircle, Lightbulb } from "lucide-react";

export async function generateStaticParams() {
  const caseStudies = await getAllCaseStudies();
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudies = await getAllCaseStudies();
  const cs = caseStudies.find((c) => c.slug === slug);

  if (!cs) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Badge variant="outline" className="mb-3">
          Case Study {cs.id}
        </Badge>
        <h1 className="text-3xl font-bold">{cs.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          {cs.industry && (
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {cs.industry}
            </span>
          )}
          {cs.timeline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {cs.timeline}
            </span>
          )}
          {cs.teamSize && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {cs.teamSize}
            </span>
          )}
        </div>

        {cs.challenge && (
          <p className="mt-3 text-[hsl(var(--muted-foreground))]">
            <strong>Challenge:</strong> {cs.challenge}
          </p>
        )}
      </div>

      <Separator />

      {/* Phases */}
      {cs.phases.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">ASM Approach</h2>
          <div className="space-y-6">
            {cs.phases.map((phase, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium mb-2">{phase.title}</h3>
                <div className="text-[hsl(var(--muted-foreground))] text-sm whitespace-pre-wrap">
                  {phase.content.slice(0, 500)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {cs.results.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Results
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {cs.results.map((result, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    {result}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Lessons Learned */}
      {cs.lessonsLearned.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Lessons Learned
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-2 list-decimal list-inside">
                {cs.lessonsLearned.map((lesson, i) => (
                  <li key={i}>{lesson}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
