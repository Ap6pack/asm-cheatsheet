import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/lib/stores/progress-store";

describe("useProgressStore", () => {
  beforeEach(() => {
    useProgressStore.getState().resetAll();
  });

  describe("module progress", () => {
    it("can toggle criteria and track module progress", () => {
      const store = useProgressStore.getState();

      store.toggleCriterion("mod-1", "c-1");
      expect(useProgressStore.getState().completedCriteria["mod-1"]).toEqual([
        "c-1",
      ]);

      store.toggleCriterion("mod-1", "c-2");
      expect(useProgressStore.getState().completedCriteria["mod-1"]).toEqual([
        "c-1",
        "c-2",
      ]);

      // Toggle off
      store.toggleCriterion("mod-1", "c-1");
      expect(useProgressStore.getState().completedCriteria["mod-1"]).toEqual([
        "c-2",
      ]);
    });

    it("startModule marks module as started", () => {
      const store = useProgressStore.getState();
      store.startModule("mod-1");
      expect(useProgressStore.getState().moduleStarted["mod-1"]).toBe(true);
    });

    it("getModuleProgress returns correct percentage", () => {
      const store = useProgressStore.getState();
      store.toggleCriterion("mod-1", "c-1");
      store.toggleCriterion("mod-1", "c-2");

      expect(useProgressStore.getState().getModuleProgress("mod-1", 4)).toBe(
        50
      );
      expect(useProgressStore.getState().getModuleProgress("mod-1", 2)).toBe(
        100
      );
      expect(
        useProgressStore.getState().getModuleProgress("nonexistent", 5)
      ).toBe(0);
      expect(useProgressStore.getState().getModuleProgress("mod-1", 0)).toBe(0);
    });

    it("isModuleComplete works correctly", () => {
      const store = useProgressStore.getState();
      store.toggleCriterion("mod-1", "c-1");
      store.toggleCriterion("mod-1", "c-2");

      expect(useProgressStore.getState().isModuleComplete("mod-1", 2)).toBe(
        true
      );
      expect(useProgressStore.getState().isModuleComplete("mod-1", 3)).toBe(
        false
      );
      expect(useProgressStore.getState().isModuleComplete("mod-1", 0)).toBe(
        false
      );
    });
  });

  describe("workflow progress", () => {
    it("can start and complete workflow steps", () => {
      const store = useProgressStore.getState();
      store.startWorkflow("wf-1");

      const wf = useProgressStore.getState().workflowProgress["wf-1"];
      expect(wf).toBeDefined();
      expect(wf.currentStep).toBe(0);
      expect(wf.completedSteps).toEqual([]);
      expect(wf.startedAt).toBeTruthy();

      store.completeWorkflowStep("wf-1", 1);
      store.completeWorkflowStep("wf-1", 2);

      const updated = useProgressStore.getState().workflowProgress["wf-1"];
      expect(updated.currentStep).toBe(2);
      expect(updated.completedSteps).toEqual([1, 2]);
    });

    it("does not re-start an already started workflow", () => {
      const store = useProgressStore.getState();
      store.startWorkflow("wf-1");
      const original =
        useProgressStore.getState().workflowProgress["wf-1"].startedAt;

      store.startWorkflow("wf-1");
      expect(
        useProgressStore.getState().workflowProgress["wf-1"].startedAt
      ).toBe(original);
    });

    it("does not duplicate completed steps", () => {
      const store = useProgressStore.getState();
      store.startWorkflow("wf-1");
      store.completeWorkflowStep("wf-1", 1);
      store.completeWorkflowStep("wf-1", 1);

      expect(
        useProgressStore.getState().workflowProgress["wf-1"].completedSteps
      ).toEqual([1]);
    });

    it("isWorkflowComplete returns correct result", () => {
      const store = useProgressStore.getState();
      store.startWorkflow("wf-1");
      store.completeWorkflowStep("wf-1", 1);
      store.completeWorkflowStep("wf-1", 2);

      expect(useProgressStore.getState().isWorkflowComplete("wf-1", 2)).toBe(
        true
      );
      expect(useProgressStore.getState().isWorkflowComplete("wf-1", 3)).toBe(
        false
      );
      expect(
        useProgressStore.getState().isWorkflowComplete("nonexistent", 1)
      ).toBe(false);
    });
  });

  describe("scenario progress", () => {
    it("can start and complete scenario phases", () => {
      const store = useProgressStore.getState();
      store.startScenario("sc-1");

      const sc = useProgressStore.getState().scenarioProgress["sc-1"];
      expect(sc).toBeDefined();
      expect(sc.currentPhase).toBe(0);
      expect(sc.completedPhases).toEqual([]);

      store.completeScenarioPhase("sc-1", 1);
      store.completeScenarioPhase("sc-1", 2);

      const updated = useProgressStore.getState().scenarioProgress["sc-1"];
      expect(updated.currentPhase).toBe(2);
      expect(updated.completedPhases).toEqual([1, 2]);
    });

    it("does not re-start an already started scenario", () => {
      const store = useProgressStore.getState();
      store.startScenario("sc-1");
      const original =
        useProgressStore.getState().scenarioProgress["sc-1"].startedAt;

      store.startScenario("sc-1");
      expect(
        useProgressStore.getState().scenarioProgress["sc-1"].startedAt
      ).toBe(original);
    });

    it("does not duplicate completed phases", () => {
      const store = useProgressStore.getState();
      store.startScenario("sc-1");
      store.completeScenarioPhase("sc-1", 1);
      store.completeScenarioPhase("sc-1", 1);

      expect(
        useProgressStore.getState().scenarioProgress["sc-1"].completedPhases
      ).toEqual([1]);
    });
  });

  describe("stats", () => {
    it("getTotalModulesStarted returns correct count", () => {
      const store = useProgressStore.getState();
      expect(store.getTotalModulesStarted()).toBe(0);

      store.startModule("mod-1");
      store.startModule("mod-2");
      expect(useProgressStore.getState().getTotalModulesStarted()).toBe(2);
    });

    it("getTotalWorkflowsCompleted returns correct count", () => {
      const store = useProgressStore.getState();
      expect(store.getTotalWorkflowsCompleted()).toBe(0);
    });
  });

  describe("resetAll", () => {
    it("clears everything", () => {
      const store = useProgressStore.getState();
      store.startModule("mod-1");
      store.toggleCriterion("mod-1", "c-1");
      store.startWorkflow("wf-1");
      store.startScenario("sc-1");

      store.resetAll();
      const reset = useProgressStore.getState();

      expect(reset.completedCriteria).toEqual({});
      expect(reset.moduleStarted).toEqual({});
      expect(reset.workflowProgress).toEqual({});
      expect(reset.scenarioProgress).toEqual({});
    });
  });
});
