import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthorizationGate } from "@/components/content/authorization-gate";

vi.mock("@/lib/stores", () => ({
  usePreferencesStore: vi.fn(),
  useHydration: vi.fn(),
}));

import { useHydration, usePreferencesStore } from "@/lib/stores";

const mockAcknowledge = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (usePreferencesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    hasAcknowledgedDisclaimer: false,
    acknowledgeDisclaimer: mockAcknowledge,
  });
});

describe("AuthorizationGate", () => {
  it("shows dialog when disclaimer not acknowledged", async () => {
    render(
      <AuthorizationGate>
        <div>Protected Content</div>
      </AuthorizationGate>
    );
    // Content should still be rendered (gate wraps, doesn't block)
    expect(screen.getByText("Protected Content")).toBeDefined();
    // Dialog should appear
    expect(screen.getByText("Authorization Required")).toBeDefined();
  });

  it("does not show dialog when already acknowledged", () => {
    (usePreferencesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasAcknowledgedDisclaimer: true,
      acknowledgeDisclaimer: mockAcknowledge,
    });
    render(
      <AuthorizationGate>
        <div>Protected Content</div>
      </AuthorizationGate>
    );
    expect(screen.getByText("Protected Content")).toBeDefined();
    expect(screen.queryByText("Authorization Required")).toBeNull();
  });

  it("calls acknowledgeDisclaimer when accept button clicked", () => {
    render(
      <AuthorizationGate>
        <div>Protected Content</div>
      </AuthorizationGate>
    );
    const btn = screen.getByText(/I Understand/);
    fireEvent.click(btn);
    expect(mockAcknowledge).toHaveBeenCalled();
  });
});
