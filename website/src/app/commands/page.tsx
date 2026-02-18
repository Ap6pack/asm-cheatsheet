import { getAllCommands } from "@/lib/content/loader";
import { CodeBlock } from "@/components/content/code-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookmarkButton } from "@/components/content/bookmark-button";

export const metadata = {
  title: "Command Reference - ASM Cheatsheet",
  description: "Searchable command cheatsheet for Attack Surface Management tools.",
};

export default async function CommandsPage() {
  const commands = await getAllCommands();

  // Group by category
  const categories = new Map<string, { emoji: string; commands: typeof commands }>();
  for (const cmd of commands) {
    if (!categories.has(cmd.category)) {
      categories.set(cmd.category, { emoji: cmd.categoryEmoji, commands: [] });
    }
    categories.get(cmd.category)!.commands.push(cmd);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Command Reference</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {commands.length} commands across {categories.size} categories. Every
          code block is copyable.
        </p>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {Array.from(categories.entries()).map(([cat, data]) => (
          <a key={cat} href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-[hsl(var(--accent))]">
              {data.emoji} {cat}
            </Badge>
          </a>
        ))}
      </div>

      <Separator />

      {/* Commands by Category */}
      {Array.from(categories.entries()).map(([category, data]) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, "-")}
        >
          <h2 className="text-2xl font-semibold mb-4">
            {data.emoji} {category}
          </h2>

          {/* Group by tool within category */}
          {(() => {
            const toolGroups = new Map<string, typeof commands>();
            for (const cmd of data.commands) {
              if (!toolGroups.has(cmd.tool)) toolGroups.set(cmd.tool, []);
              toolGroups.get(cmd.tool)!.push(cmd);
            }
            return Array.from(toolGroups.entries()).map(([tool, cmds]) => (
              <div key={tool} className="mb-8" id={tool.toLowerCase()}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-medium">{tool}</h3>
                  <BookmarkButton
                    id={`cmd-${tool.toLowerCase()}`}
                    type="command"
                    title={tool}
                    category={category}
                  />
                </div>
                {cmds.map((cmd) => (
                  <CodeBlock
                    key={cmd.id}
                    code={cmd.code}
                    language={cmd.language}
                  />
                ))}
              </div>
            ));
          })()}
        </section>
      ))}
    </div>
  );
}
