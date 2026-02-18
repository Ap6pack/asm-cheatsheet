import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressOverview } from "@/components/dashboard/progress-overview";

vi.mock("@/lib/stores", () => ({
  useProgressStore: vi.fn(),
  useHydration: vi.fn(),
}));

import { useHydration, useProgressStore } from "@/lib/stores";

beforeEach(() => {
  vi.clearAllMocks();
  (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(true);
  (useProgressStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    moduleStarted: {},
    workflowProgress: {},
    scenarioProgress: {},
    completedCriteria: {},
  });
});

describe("ProgressOverview", () => {
  it("renders three stat cards", () => {
    render(<ProgressOverview totalModules={12} totalWorkflows={6} totalScenarios={4} />);
    expect(screen.getByText("Learning Modules")).toBeDefined();
    expect(screen.getByText("Workflows")).toBeDefined();
    expect(screen.getByText("Scenarios")).toBeDefined();
  });

  it("shows totals for each category", () => {
    render(<ProgressOverview totalModules={12} totalWorkflows={6} totalScenarios={4} />);
    expect(screen.getByText("/12")).toBeDefined();
    expect(screen.getByText("/6")).toBeDefined();
    expect(screen.getByText("/4")).toBeDefined();
  });

  it("shows skeleton when not hydrated", () => {
    (useHydration as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { container } = render(
      <ProgressOverview totalModules={12} totalWorkflows={6} totalScenarios={4} />
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });

  it("shows not started text when no progress", () => {
    render(<ProgressOverview totalModules={12} totalWorkflows={6} totalScenarios={4} />);
    const notStartedElements = screen.getAllByText("Not started");
    expect(notStartedElements.length).toBe(3);
  });

  it("shows started count when modules have progress", () => {
    (useProgressStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      moduleStarted: { "mod-1": true, "mod-2": true },
      workflowProgress: {},
      scenarioProgress: {},
      completedCriteria: { "mod-1": ["c1", "c2"] },
    });
    render(<ProgressOverview totalModules={12} totalWorkflows={6} totalScenarios={4} />);
    expect(screen.getByText("2 started, 1 completed")).toBeDefined();
  });
});
