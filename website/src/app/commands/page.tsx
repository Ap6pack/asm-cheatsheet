import { getAllCommands } from "@/lib/content/loader";
import { codeToHtml } from "shiki";
import { CommandsExplorer } from "@/components/commands/commands-explorer";

export const metadata = {
  title: "Command Reference - ASM Cheatsheet",
  description:
    "Searchable command cheatsheet for Attack Surface Management tools.",
};

export default async function CommandsPage() {
  const commands = await getAllCommands();

  // Pre-render all code blocks with Shiki on the server
  const commandsWithHtml = await Promise.all(
    commands.map(async (cmd) => {
      const html = await codeToHtml(cmd.code, {
        lang: cmd.language || "bash",
        themes: { light: "github-light", dark: "github-dark" },
      });
      return {
        id: cmd.id,
        tool: cmd.tool,
        category: cmd.category,
        categoryEmoji: cmd.categoryEmoji,
        code: cmd.code,
        language: cmd.language,
        description: cmd.description,
        html,
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Command Reference</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {commands.length} commands with syntax highlighting. Search, filter,
          and copy.
        </p>
      </div>
      <CommandsExplorer commands={commandsWithHtml} />
    </div>
  );
}
