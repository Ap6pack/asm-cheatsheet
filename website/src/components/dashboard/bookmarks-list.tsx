"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookmarksStore, useHydration } from "@/lib/stores";
import { Bookmark, X, Terminal, Wrench, GitBranch, Shield } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  command: Terminal,
  tool: Wrench,
  workflow: GitBranch,
  scenario: Shield,
};

const typeUrls: Record<string, (id: string) => string> = {
  command: () => "/commands",
  tool: (id) => `/tools/${id}`,
  workflow: (id) => `/workflows/${id}`,
  scenario: (id) => `/scenarios/${id}`,
};

export function BookmarksList() {
  const hydrated = useHydration();
  const { bookmarks, removeBookmark } = useBookmarksStore();

  if (!hydrated) return null;

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            No bookmarks yet. Bookmark commands, tools, and workflows for quick access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bookmark className="h-4 w-4" />
          Bookmarks ({bookmarks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {bookmarks.slice(0, 10).map((bm) => {
            const Icon = typeIcons[bm.type] ?? Bookmark;
            const getUrl = typeUrls[bm.type];
            const url = getUrl ? getUrl(bm.id) : "#";
            return (
              <li key={bm.id} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                <Link
                  href={url}
                  className="flex-1 truncate text-sm hover:text-[var(--primary)] transition-colors"
                >
                  {bm.title}
                </Link>
                {bm.category && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {bm.category}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeBookmark(bm.id)}
                  aria-label="Remove bookmark"
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            );
          })}
        </ul>
        {bookmarks.length > 10 && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            +{bookmarks.length - 10} more bookmarks
          </p>
        )}
      </CardContent>
    </Card>
  );
}
