import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessCriteriaList } from "@/components/learning/success-criteria-list";

vi.mock("@/lib/stores", () => ({
  useProgressStore: vi.fn(),
  useHydration: vi.fn(),
}));

import { useHydration, useProgressStore } from "@/lib/stores";

const mockToggle = vi.fn();

const criteria = [
  { id: "c1", text: "Criterion One" },
  { id: "c2", text: "Criterion Two" },
  { id: "c3", text: "Criterion Three" },
];

beforeEach(() => {
  vi.clearAllMocks();
  (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (useProgressStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    completedCriteria: {},
    toggleCriterion: mockToggle,
    getModuleProgress: vi.fn().mockReturnValue(0),
  });
});

describe("SuccessCriteriaList", () => {
  it("renders all criteria as checkboxes", () => {
    render(<SuccessCriteriaList moduleId="mod-1" criteria={criteria} />);
    expect(screen.getByText("Criterion One")).toBeDefined();
    expect(screen.getByText("Criterion Two")).toBeDefined();
    expect(screen.getByText("Criterion Three")).toBeDefined();
  });

  it("shows 0% progress when nothing completed", () => {
    render(<SuccessCriteriaList moduleId="mod-1" criteria={criteria} />);
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("shows progress when criteria completed", () => {
    (useProgressStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      completedCriteria: { "mod-1": ["c1"] },
      toggleCriterion: mockToggle,
      getModuleProgress: vi.fn().mockReturnValue(33),
    });
    render(<SuccessCriteriaList moduleId="mod-1" criteria={criteria} />);
    expect(screen.getByText("33%")).toBeDefined();
  });

  it("calls toggleCriterion when checkbox clicked", () => {
    render(<SuccessCriteriaList moduleId="mod-1" criteria={criteria} />);
    const labels = screen.getAllByText(/Criterion/);
    fireEvent.click(labels[0]);
    expect(mockToggle).toHaveBeenCalledWith("mod-1", "c1");
  });

  it("renders nothing interactive when not hydrated", () => {
    (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<SuccessCriteriaList moduleId="mod-1" criteria={criteria} />);
    // Should still render criteria text but show 0% progress
    expect(screen.getByText("0%")).toBeDefined();
  });
});
