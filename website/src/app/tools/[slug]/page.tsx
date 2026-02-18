import { notFound } from "next/navigation";
import { getAllTools } from "@/lib/content/loader";
import { CodeBlock } from "@/components/content/code-block";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

export async function generateStaticParams() {
  const tools = await getAllTools();
  return tools.map((t) => ({ slug: t.slug }));
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
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          {tool.difficulty && (
            <Badge variant="outline">{tool.difficulty}</Badge>
          )}
        </div>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          {tool.purpose}
        </p>
        {tool.link && (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
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
