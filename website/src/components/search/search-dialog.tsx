"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Terminal,
  Wrench,
  GitBranch,
  Shield,
  FileText,
  BookOpen,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchEntry {
  id: string;
  title: string;
  type: "module" | "command" | "workflow" | "scenario" | "case-study" | "tool" | "guide";
  content: string;
  url: string;
  category?: string;
  difficulty?: string;
}

const typeIcons: Record<SearchEntry["type"], React.ElementType> = {
  module: GraduationCap,
  command: Terminal,
  tool: Wrench,
  workflow: GitBranch,
  scenario: Shield,
  "case-study": FileText,
  guide: BookOpen,
};

const typeLabels: Record<SearchEntry["type"], string> = {
  module: "Module",
  command: "Command",
  tool: "Tool",
  workflow: "Workflow",
  scenario: "Scenario",
  "case-study": "Case Study",
  guide: "Guide",
};

function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  if (!query || query.trim().length < 2) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return [];

  return entries
    .map((entry) => {
      let score = 0;
      for (const term of terms) {
        if (entry.title.toLowerCase().includes(term)) score += 10;
        if (entry.category?.toLowerCase().includes(term)) score += 5;
        if (entry.content.toLowerCase().includes(term)) score += 1;
      }
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((item) => item.entry);
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [entries, setEntries] = React.useState<SearchEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch search data on first open
  React.useEffect(() => {
    if (open && entries.length === 0 && !loading) {
      setLoading(true);
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          setEntries(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, entries.length, loading]);

  // Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = React.useMemo(
    () => searchEntries(entries, query),
    [entries, query]
  );

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center border-b border-[hsl(var(--border))] px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, tools, modules..."
            className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />}
        </div>

        <div className="max-h-[300px] overflow-y-auto px-2 py-2">
          {query.length > 1 && results.length === 0 && !loading && (
            <p className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No results found for &quot;{query}&quot;
            </p>
          )}

          {results.length > 0 && (
            <ul>
              {results.map((result, index) => {
                const Icon = typeIcons[result.type];
                return (
                  <li key={result.id}>
                    <button
                      onClick={() => handleSelect(result.url)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        index === selectedIndex
                          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                          : "text-[hsl(var(--foreground))]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{result.title}</p>
                        {result.category && (
                          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                            {result.category}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-md bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {typeLabels[result.type]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {query.length <= 1 && !loading && entries.length > 0 && (
            <p className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Type to search across {entries.length} items...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
