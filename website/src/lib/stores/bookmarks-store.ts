import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Bookmark {
  id: string;
  type: "command" | "tool" | "workflow" | "scenario";
  title: string;
  category?: string;
  addedAt: string;
}

interface BookmarksState {
  bookmarks: Bookmark[];

  addBookmark: (bookmark: Omit<Bookmark, "addedAt">) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarksByType: (type: Bookmark["type"]) => Bookmark[];
  clearAll: () => void;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (bookmark: Omit<Bookmark, "addedAt">) => {
        set((state) => {
          // Prevent duplicates
          if (state.bookmarks.some((b) => b.id === bookmark.id)) {
            return state;
          }
          return {
            bookmarks: [
              ...state.bookmarks,
              { ...bookmark, addedAt: new Date().toISOString() },
            ],
          };
        });
      },

      removeBookmark: (id: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      isBookmarked: (id: string) => {
        return get().bookmarks.some((b) => b.id === id);
      },

      getBookmarksByType: (type: Bookmark["type"]) => {
        return get().bookmarks.filter((b) => b.type === type);
      },

      clearAll: () => {
        set({ bookmarks: [] });
      },
    }),
    {
      name: "asm-bookmarks",
    }
  )
);
