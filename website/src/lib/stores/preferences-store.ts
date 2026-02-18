import { create } from "zustand";
import { persist } from "zustand/middleware";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

interface PreferencesState {
  // Authorization acknowledgment
  hasAcknowledgedDisclaimer: boolean;
  disclaimerAcknowledgedAt?: string;

  // UI preferences
  sidebarCollapsed: boolean;
  defaultDifficultyFilter: DifficultyFilter;

  // Actions
  acknowledgeDisclaimer: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDefaultDifficultyFilter: (filter: DifficultyFilter) => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  hasAcknowledgedDisclaimer: false,
  disclaimerAcknowledgedAt: undefined as string | undefined,
  sidebarCollapsed: false,
  defaultDifficultyFilter: "all" as DifficultyFilter,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      acknowledgeDisclaimer: () => {
        set({
          hasAcknowledgedDisclaimer: true,
          disclaimerAcknowledgedAt: new Date().toISOString(),
        });
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setDefaultDifficultyFilter: (filter: DifficultyFilter) => {
        set({ defaultDifficultyFilter: filter });
      },

      resetPreferences: () => {
        set({ ...defaultPreferences });
      },
    }),
    {
      name: "asm-preferences",
    }
  )
);
