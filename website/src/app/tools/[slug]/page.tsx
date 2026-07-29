import { notFound } from "next/navigation";
import { getAllTools } from "@/lib/content/loader";
import { CodeBlock } from "@/components/content/code-block";
import { Badge } from "@/components/ui/badge";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BookmarkButton } from "@/components/content/bookmark-button";

export async function generateStaticParams() {
  const tools = await getAllTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = await getAllTools();
  const item = items.find((t) => t.slug === slug);
  if (!item) return {};
  return {
    title: `${item.name} - Tool`,
    description: (item.purpose || `How to install and use ${item.name} for attack surface management.`).slice(0, 160),
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tools = await getAllTools();
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <Breadcrumbs title={tool.name} />
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          {tool.difficulty && (
            <Badge variant="outline">{tool.difficulty}</Badge>
          )}
          <ToolStatusBadge status={tool.status} note={tool.statusNote} />
          <BookmarkButton
            id={tool.slug}
            type="tool"
            title={tool.name}
            category={tool.category}
          />
        </div>
        {tool.status === "legacy" && tool.statusNote && (
          <p className="mb-3 rounded-md border border-amber-500/40 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <strong>Legacy tool.</strong> {tool.statusNote}
          </p>
        )}
        <p className="text-lg text-[var(--muted-foreground)]">
          {tool.purpose}
        </p>
        {tool.link && (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {tool.link}
          </a>
        )}
      </div>

      <Separator />

      {/* Installation */}
      {tool.installation.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Installation</h2>
          {tool.installation.map((block, i) => (
            <CodeBlock key={i} code={block.code} language={block.language} />
          ))}
        </section>
      )}

      {/* Usage */}
      {tool.usage.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Usage</h2>
          {tool.usage.map((block, i) => (
            <div key={i}>
              {block.title && (
                <h3 className="text-base font-medium mt-4 mb-2">
                  {block.title}
                </h3>
              )}
              <CodeBlock code={block.code} language={block.language} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
