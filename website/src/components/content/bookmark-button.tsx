"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBookmarksStore, useHydration } from "@/lib/stores";
import type { Bookmark as BookmarkType } from "@/lib/stores";

interface BookmarkButtonProps {
  id: string;
  type: BookmarkType["type"];
  title: string;
  category?: string;
}

export function BookmarkButton({ id, type, title, category }: BookmarkButtonProps) {
  const hydrated = useHydration();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarksStore();

  if (!hydrated) return null;

  const bookmarked = isBookmarked(id);

  const toggle = () => {
    if (bookmarked) {
      removeBookmark(id);
    } else {
      addBookmark({ id, type, title, category });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-[var(--primary)]" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{bookmarked ? "Remove bookmark" : "Bookmark this"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
