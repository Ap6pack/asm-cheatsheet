import type { SearchEntry } from './types';
import { getSearchEntries } from './loader';

// FlexSearch-compatible index interface
export interface SearchIndex {
  search(query: string): SearchEntry[];
  add(entry: SearchEntry): void;
  entries: SearchEntry[];
}

/**
 * Build a simple search index from all content.
 * This provides a FlexSearch-compatible interface with basic text search.
 * For production, you can swap this with FlexSearch's Document index.
 */
export async function buildSearchIndex(): Promise<SearchIndex> {
  const entries = await getSearchEntries();

  const index: SearchIndex = {
    entries: [...entries],

    add(entry: SearchEntry) {
      this.entries.push(entry);
    },

    search(query: string): SearchEntry[] {
      if (!query || query.trim().length === 0) return [];

      const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 1);

      if (terms.length === 0) return [];

      // Score each entry based on term matches
      const scored = this.entries
        .map((entry) => {
          const searchableText = [
            entry.title,
            entry.content,
            entry.category || '',
          ]
            .join(' ')
            .toLowerCase();

          let score = 0;
          for (const term of terms) {
            // Title match is worth more
            if (entry.title.toLowerCase().includes(term)) {
              score += 10;
            }
            // Category match
            if (entry.category?.toLowerCase().includes(term)) {
              score += 5;
            }
            // Content match
            if (searchableText.includes(term)) {
              score += 1;
            }
          }

          return { entry, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      return scored.map((item) => item.entry);
    },
  };

  return index;
}

/**
 * Export search entries as a JSON-serializable array for static generation.
 * This can be used at build time to create a static search index file.
 */
export async function exportSearchData(): Promise<SearchEntry[]> {
  return getSearchEntries();
}
