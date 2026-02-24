"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { Search, X } from "lucide-react";

interface CommandData {
  id: string;
  tool: string;
  category: string;
  categoryEmoji: string;
  code: string;
  language: string;
  description: string;
  /** Server-rendered Shiki HTML */
  html: string;
}

interface CommandsExplorerProps {
  commands: CommandData[];
}

export function CommandsExplorer({ commands }: CommandsExplorerProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [activeTool, setActiveTool] = React.useState<string>("all");

  // Derive categories and tools
  const categories = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const cmd of commands) {
      if (!map.has(cmd.category)) {
        map.set(cmd.category, cmd.categoryEmoji);
      }
    }
    return Array.from(map.entries());
  }, [commands]);

  const tools = React.useMemo(() => {
    const set = new Set<string>();
    for (const cmd of commands) set.add(cmd.tool);
    return Array.from(set).sort();
  }, [commands]);

  // Filter
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return commands.filter((cmd) => {
      if (activeCategory !== "all" && cmd.category !== activeCategory)
        return false;
      if (activeTool !== "all" && cmd.tool !== activeTool) return false;
      if (q) {
        return (
          cmd.tool.toLowerCase().includes(q) ||
          cmd.code.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [commands, search, activeCategory, activeTool]);

  // Group filtered results by category → tool
  const grouped = React.useMemo(() => {
    const map = new Map<
      string,
      { emoji: string; tools: Map<string, CommandData[]> }
    >();
    for (const cmd of filtered) {
      if (!map.has(cmd.category)) {
        map.set(cmd.category, {
          emoji: cmd.categoryEmoji,
          tools: new Map(),
        });
      }
      const cat = map.get(cmd.category)!;
      if (!cat.tools.has(cmd.tool)) {
        cat.tools.set(cmd.tool, []);
      }
      cat.tools.get(cmd.tool)!.push(cmd);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, tools, descriptions..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-10 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All Categories
          </button>
          {categories.map(([cat, emoji]) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? "all" : cat)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {emoji} {cat}
            </button>
          ))}
        </div>

        {/* Tool filter + count */}
        <div className="flex items-center gap-4">
          <select
            value={activeTool}
            onChange={(e) => setActiveTool(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Tools</option>
            {tools.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
          <span className="text-sm text-[var(--muted-foreground)]">
            {filtered.length} of {commands.length} commands
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            No commands match your filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
              setActiveTool("all");
            }}
            className="mt-2 text-sm text-[var(--primary)] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([category, data]) => (
          <section
            key={category}
            id={category.toLowerCase().replace(/\s+/g, "-")}
          >
            <h2 className="text-2xl font-semibold mb-4">
              {data.emoji} {category}
            </h2>
            {Array.from(data.tools.entries()).map(([tool, cmds]) => (
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
                  <div
                    key={cmd.id}
                    className="group relative my-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">
                        {cmd.language}
                      </span>
                      <CopyButton code={cmd.code} />
                    </div>
                    <div
                      className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0"
                      dangerouslySetInnerHTML={{ __html: cmd.html }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs transition-colors hover:bg-[var(--background-elevated)]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
