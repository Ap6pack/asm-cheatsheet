import { Document } from "flexsearch";
import type { SearchEntry } from "@/lib/content/types";

// Relative weight of a match in each indexed field when merging results
const FIELD_WEIGHTS: Record<string, number> = {
  title: 10,
  category: 5,
  content: 1,
};

const MAX_RESULTS = 20;

export interface ClientSearchIndex {
  search: (query: string) => SearchEntry[];
}

/**
 * Build a FlexSearch document index over the static search entries.
 * Forward tokenization gives prefix matching ("subdom" finds "subdomain"),
 * which is what makes search forgiving for partially typed terms.
 */
export function createSearchIndex(entries: SearchEntry[]): ClientSearchIndex {
  const byId = new Map<string, SearchEntry>();

  const index = new Document<{
    id: string;
    title: string;
    content: string;
    category: string;
  }>({
    tokenize: "forward",
    document: {
      id: "id",
      index: ["title", "content", "category"],
    },
  });

  for (const entry of entries) {
    byId.set(entry.id, entry);
    index.add({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      category: entry.category ?? "",
    });
  }

  return {
    search(query: string): SearchEntry[] {
      const trimmed = query.trim();
      if (trimmed.length < 2) return [];

      const fieldResults = index.search(trimmed, { limit: 50 });

      // Merge per-field hits into a weighted score per entry. A document
      // matching in title and content outranks a content-only match.
      const scores = new Map<string, number>();
      for (const { field, result } of fieldResults) {
        const weight = FIELD_WEIGHTS[field] ?? 1;
        for (const [rank, id] of result.entries()) {
          const key = String(id);
          // Earlier hits within a field are better matches
          const positionBonus = Math.max(0, 50 - rank) / 50;
          scores.set(
            key,
            (scores.get(key) ?? 0) + weight * (1 + positionBonus)
          );
        }
      }

      return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_RESULTS)
        .map(([id]) => byId.get(id))
        .filter((entry): entry is SearchEntry => entry !== undefined);
    },
  };
}
