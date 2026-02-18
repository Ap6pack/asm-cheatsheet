import { describe, it, expect, beforeEach } from "vitest";
import { usePreferencesStore } from "@/lib/stores/preferences-store";

describe("usePreferencesStore", () => {
  beforeEach(() => {
    usePreferencesStore.getState().resetPreferences();
  });

  it("has correct default values", () => {
    const state = usePreferencesStore.getState();
    expect(state.hasAcknowledgedDisclaimer).toBe(false);
    expect(state.disclaimerAcknowledgedAt).toBeUndefined();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.defaultDifficultyFilter).toBe("all");
  });

  it("acknowledgeDisclaimer sets flag and date", () => {
    const store = usePreferencesStore.getState();
    store.acknowledgeDisclaimer();

    const updated = usePreferencesStore.getState();
    expect(updated.hasAcknowledgedDisclaimer).toBe(true);
    expect(updated.disclaimerAcknowledgedAt).toBeTruthy();

    // Verify it's a valid ISO date string
    const date = new Date(updated.disclaimerAcknowledgedAt!);
    expect(date.getTime()).not.toBeNaN();
  });

  it("toggleSidebar works", () => {
    const store = usePreferencesStore.getState();
    expect(store.sidebarCollapsed).toBe(false);

    store.toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    usePreferencesStore.getState().toggleSidebar();
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it("setSidebarCollapsed sets explicit value", () => {
    const store = usePreferencesStore.getState();
    store.setSidebarCollapsed(true);
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    usePreferencesStore.getState().setSidebarCollapsed(false);
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it("setDefaultDifficultyFilter updates filter", () => {
    const store = usePreferencesStore.getState();
    store.setDefaultDifficultyFilter("advanced");
    expect(usePreferencesStore.getState().defaultDifficultyFilter).toBe(
      "advanced"
    );

    usePreferencesStore.getState().setDefaultDifficultyFilter("beginner");
    expect(usePreferencesStore.getState().defaultDifficultyFilter).toBe(
      "beginner"
    );
  });

  it("resetPreferences clears to defaults", () => {
    const store = usePreferencesStore.getState();

    // Set various preferences
    store.acknowledgeDisclaimer();
    store.toggleSidebar();
    store.setDefaultDifficultyFilter("advanced");

    // Verify they changed
    expect(usePreferencesStore.getState().hasAcknowledgedDisclaimer).toBe(true);
    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    // Reset
    usePreferencesStore.getState().resetPreferences();

    const reset = usePreferencesStore.getState();
    expect(reset.hasAcknowledgedDisclaimer).toBe(false);
    expect(reset.disclaimerAcknowledgedAt).toBeUndefined();
    expect(reset.sidebarCollapsed).toBe(false);
    expect(reset.defaultDifficultyFilter).toBe("all");
  });
});
