import Link from "next/link";
import { getAllTools } from "@/lib/content/loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, LayoutGrid } from "lucide-react";

export const metadata = {
  title: "Tools",
  description: "Detailed documentation for ASM reconnaissance and cloud security tools.",
};

export default async function ToolsPage() {
  const tools = await getAllTools();

  // Group by category
  const categories = new Map<string, typeof tools>();
  for (const tool of tools) {
    const cat = tool.category || "Other";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(tool);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {tools.length} ASM tools with installation guides and usage examples.
        </p>
        <Link href="/tools/compare" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Compare All Tools
          </Button>
        </Link>
      </div>

      {Array.from(categories.entries()).map(([category, catTools]) => (
        <section key={category}>
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`}>
                <Card className="h-full transition-colors hover:border-[hsl(var(--primary))]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      {tool.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {tool.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {tool.purpose}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-sm text-[hsl(var(--primary))]">
                        View Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                      {tool.link && (
                        <ExternalLink className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
