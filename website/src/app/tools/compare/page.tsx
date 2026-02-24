import { getAllTools } from "@/lib/content/loader";
import { ToolComparison } from "@/components/tools/tool-comparison";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata = {
  title: "Tool Comparison",
  description: "Compare ASM tools side by side - sortable and filterable matrix.",
};

export default async function ToolComparisonPage() {
  const tools = await getAllTools();

  const toolData = tools.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    purpose: t.purpose,
    difficulty: t.difficulty,
    link: t.link,
    category: t.category,
    installationCount: t.installation.length,
    usageCount: t.usage.length,
  }));

  return (
    <div className="space-y-8">
      <Breadcrumbs title="Tool Comparison" />
      <div>
        <h1 className="text-3xl font-bold">Tool Comparison</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Compare {tools.length} ASM tools across categories, difficulty, and capabilities.
        </p>
      </div>
      <ToolComparison tools={toolData} />
    </div>
  );
}
