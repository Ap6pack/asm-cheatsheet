"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, ExternalLink, Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ToolData {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  difficulty: string;
  link: string;
  category: string;
  installationCount: number;
  usageCount: number;
}

interface ToolComparisonProps {
  tools: ToolData[];
}

type SortKey = "name" | "category" | "difficulty";
type SortDir = "asc" | "desc";

const difficultyOrder: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export function ToolComparison({ tools }: ToolComparisonProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  const categories = React.useMemo(
    () => ["all", ...Array.from(new Set(tools.map((t) => t.category)))],
    [tools]
  );

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    let result = categoryFilter === "all"
      ? tools
      : tools.filter((t) => t.category === categoryFilter);

    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.purpose.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "category") {
        cmp = a.category.localeCompare(b.category);
      } else if (sortKey === "difficulty") {
        cmp = (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tools, sortKey, sortDir, categoryFilter, search]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
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

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 mt-1.5 text-[var(--muted-foreground)]" />
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(cat)}
            className="text-xs"
          >
            {cat === "all" ? "All Categories" : cat}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="p-3 text-left">
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 font-medium"
                >
                  Tool
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => toggleSort("category")}
                  className="flex items-center gap-1 font-medium"
                >
                  Category
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-3 text-left">
                <button
                  onClick={() => toggleSort("difficulty")}
                  className="flex items-center gap-1 font-medium"
                >
                  Difficulty
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Examples</th>
              <th className="p-3 text-left">Links</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool, i) => (
              <tr
                key={tool.id}
                className={cn(
                  "border-b border-[var(--border)] transition-colors hover:bg-[var(--background-elevated)]/50",
                  i % 2 === 0 ? "" : "bg-[var(--muted)]/30"
                )}
              >
                <td className="p-3 font-medium">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {tool.name}
                  </Link>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      tool.difficulty === "Beginner" && "border-green-500 text-green-600",
                      tool.difficulty === "Intermediate" && "border-yellow-500 text-yellow-600",
                      tool.difficulty === "Advanced" && "border-red-500 text-red-600"
                    )}
                  >
                    {tool.difficulty || "N/A"}
                  </Badge>
                </td>
                <td className="p-3 max-w-xs truncate text-[var(--muted-foreground)]">
                  {tool.purpose}
                </td>
                <td className="p-3 text-center">
                  {tool.usageCount > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {tool.usageCount} examples
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {tool.link && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                    >
                      Site <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">
        Showing {filtered.length} of {tools.length} tools
      </p>
    </div>
  );
}
