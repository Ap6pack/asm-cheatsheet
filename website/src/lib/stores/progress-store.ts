import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkflowProgress {
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
  completedAt?: string;
}

interface ScenarioProgress {
  currentPhase: number;
  completedPhases: number[];
  startedAt: string;
  completedAt?: string;
}

interface ProgressState {
  // Learning module progress
  completedCriteria: Record<string, string[]>;
  moduleStarted: Record<string, boolean>;

  // Workflow progress
  workflowProgress: Record<string, WorkflowProgress>;

  // Scenario progress
  scenarioProgress: Record<string, ScenarioProgress>;

  // Actions
  toggleCriterion: (moduleId: string, criterionId: string) => void;
  startModule: (moduleId: string) => void;
  isModuleComplete: (moduleId: string, totalCriteria: number) => boolean;
  getModuleProgress: (moduleId: string, totalCriteria: number) => number;

  startWorkflow: (workflowId: string) => void;
  completeWorkflowStep: (workflowId: string, step: number) => void;
  isWorkflowComplete: (workflowId: string, totalSteps: number) => boolean;

  startScenario: (scenarioId: string) => void;
  completeScenarioPhase: (scenarioId: string, phase: number) => void;

  // Stats
  getTotalModulesStarted: () => number;
  getTotalWorkflowsCompleted: () => number;

  // Reset
  resetAll: () => void;
}

const initialState = {
  completedCriteria: {} as Record<string, string[]>,
  moduleStarted: {} as Record<string, boolean>,
  workflowProgress: {} as Record<string, WorkflowProgress>,
  scenarioProgress: {} as Record<string, ScenarioProgress>,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleCriterion: (moduleId: string, criterionId: string) => {
        set((state) => {
          const current = state.completedCriteria[moduleId] ?? [];
          const updated = current.includes(criterionId)
            ? current.filter((id) => id !== criterionId)
            : [...current, criterionId];

          return {
            completedCriteria: {
              ...state.completedCriteria,
              [moduleId]: updated,
            },
          };
        });
      },

      startModule: (moduleId: string) => {
        set((state) => ({
          moduleStarted: {
            ...state.moduleStarted,
            [moduleId]: true,
          },
        }));
      },

      isModuleComplete: (moduleId: string, totalCriteria: number) => {
        const { completedCriteria } = get();
        const completed = completedCriteria[moduleId] ?? [];
        return totalCriteria > 0 && completed.length >= totalCriteria;
      },

      getModuleProgress: (moduleId: string, totalCriteria: number) => {
        if (totalCriteria === 0) return 0;
        const { completedCriteria } = get();
        const completed = completedCriteria[moduleId] ?? [];
        return Math.round((completed.length / totalCriteria) * 100);
      },

      startWorkflow: (workflowId: string) => {
        set((state) => {
          if (state.workflowProgress[workflowId]) return state;
          return {
            workflowProgress: {
              ...state.workflowProgress,
              [workflowId]: {
                currentStep: 0,
                completedSteps: [],
                startedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeWorkflowStep: (workflowId: string, step: number) => {
        set((state) => {
          const existing = state.workflowProgress[workflowId];
          if (!existing) return state;

          const completedSteps = existing.completedSteps.includes(step)
            ? existing.completedSteps
            : [...existing.completedSteps, step];

          return {
            workflowProgress: {
              ...state.workflowProgress,
              [workflowId]: {
                ...existing,
                currentStep: step,
                completedSteps,
              },
            },
          };
        });
      },

      isWorkflowComplete: (workflowId: string, totalSteps: number) => {
        const { workflowProgress } = get();
        const progress = workflowProgress[workflowId];
        if (!progress) return false;
        return totalSteps > 0 && progress.completedSteps.length >= totalSteps;
      },

      startScenario: (scenarioId: string) => {
        set((state) => {
          if (state.scenarioProgress[scenarioId]) return state;
          return {
            scenarioProgress: {
              ...state.scenarioProgress,
              [scenarioId]: {
                currentPhase: 0,
                completedPhases: [],
                startedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeScenarioPhase: (scenarioId: string, phase: number) => {
        set((state) => {
          const existing = state.scenarioProgress[scenarioId];
          if (!existing) return state;

          const completedPhases = existing.completedPhases.includes(phase)
            ? existing.completedPhases
            : [...existing.completedPhases, phase];

          return {
            scenarioProgress: {
              ...state.scenarioProgress,
              [scenarioId]: {
                ...existing,
                currentPhase: phase,
                completedPhases,
              },
            },
          };
        });
      },

      getTotalModulesStarted: () => {
        const { moduleStarted } = get();
        return Object.values(moduleStarted).filter(Boolean).length;
      },

      getTotalWorkflowsCompleted: () => {
        // Count workflows where completedAt is set
        const { workflowProgress } = get();
        return Object.values(workflowProgress).filter(
          (wp) => wp.completedAt !== undefined
        ).length;
      },

      resetAll: () => {
        set({ ...initialState });
      },
    }),
    {
      name: "asm-progress",
    }
  )
);
