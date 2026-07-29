import { notFound } from "next/navigation";
import { getAllLabs, getLabBySlug } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MDXRenderer } from "@/components/content/mdx-renderer";
import { LabExperience } from "@/components/labs/lab-experience";
import { EditOnGitHub } from "@/components/content/edit-on-github";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { Clock, ExternalLink, Lightbulb, Info } from "lucide-react";

export async function generateStaticParams() {
  const labs = await getAllLabs();
  return labs.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) return {};
  return {
    title: `${lab.title} - Labs`,
    description: lab.subtitle,
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <Breadcrumbs title={lab.title} />

      {/* Header */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={lab.difficulty} />
          <Badge variant="outline">{lab.category}</Badge>
          <Badge variant="outline">
            {lab.fictional ? "Fictional scenario" : "Real incident"}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <Clock className="h-3.5 w-3.5" />
            {lab.estimatedMinutes} min
          </span>
          <BookmarkButton
            id={lab.slug}
            type="lab"
            title={lab.title}
            category={lab.category}
          />
        </div>
        <h1 className="text-3xl font-bold">{lab.title}</h1>
        <p className="mt-1 text-lg text-[var(--muted-foreground)]">
          {lab.subtitle}
        </p>
      </div>

      {/* Summary */}
      <MDXRenderer content={lab.summary} />

      {/* Source / disclaimer */}
      {(lab.source || lab.disclaimer) && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            <div className="space-y-1">
              {lab.source && (
                <p>
                  <span className="font-medium">Source:</span>{" "}
                  <a
                    href={lab.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                  >
                    {lab.source.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
              {lab.disclaimer && (
                <p className="text-[var(--muted-foreground)]">
                  {lab.disclaimer}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Interactive experience: Break-the-Chain defender challenge + replay */}
      <LabExperience lab={lab} />

      {/* Defensive lessons */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
          <Lightbulb className="h-5 w-5" />
          Defensive lessons
        </h2>
        <ul className="space-y-3">
          {lab.lessons.map((lesson, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3 text-sm"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]">
                {i + 1}
              </span>
              {lesson}
            </li>
          ))}
        </ul>
      </section>

      <Separator />
      <footer className="flex justify-end">
        <EditOnGitHub contentPath={`labs/${lab.slug}.json`} />
      </footer>
    </div>
  );
}
