import { notFound } from "next/navigation";
import { getAllCaseStudies } from "@/lib/content/loader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Calendar, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MDXRenderer } from "@/components/content/mdx-renderer";

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
      <Breadcrumbs title={cs.title} />
      <div>
        <Badge variant="outline" className="mb-3">
          Case Study {cs.id}
        </Badge>
        <h1 className="text-3xl font-bold">{cs.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
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
          <p className="mt-3 text-[var(--muted-foreground)]">
            <strong>Challenge:</strong> {cs.challenge}
          </p>
        )}
      </div>

      <Separator />

      {/* Full case study content rendered as markdown with syntax-highlighted code blocks */}
      <MDXRenderer content={cs.content} />
    </div>
  );
}
