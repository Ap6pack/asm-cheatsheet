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

export interface QuizResult {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  passedAt?: string;
  lastAttemptAt: string;
}

/** Minimum percentage score required to pass a module quiz. */
export const QUIZ_PASS_THRESHOLD = 70;

interface ProgressState {
  // Learning module progress
  completedCriteria: Record<string, string[]>;
  moduleStarted: Record<string, boolean>;

  // Workflow progress
  workflowProgress: Record<string, WorkflowProgress>;

  // Scenario progress
  scenarioProgress: Record<string, ScenarioProgress>;

  // Quiz results keyed by module id
  quizResults: Record<string, QuizResult>;

  // Actions
  toggleCriterion: (moduleId: string, criterionId: string) => void;
  startModule: (moduleId: string) => void;
  isModuleComplete: (moduleId: string, totalCriteria: number) => boolean;
  getModuleProgress: (moduleId: string, totalCriteria: number) => number;

  startWorkflow: (workflowId: string) => void;
  completeWorkflowStep: (
    workflowId: string,
    step: number,
    totalSteps?: number
  ) => void;
  isWorkflowComplete: (workflowId: string, totalSteps: number) => boolean;

  startScenario: (scenarioId: string) => void;
  completeScenarioPhase: (
    scenarioId: string,
    phase: number,
    totalPhases?: number
  ) => void;

  recordQuizAttempt: (
    moduleId: string,
    score: number,
    totalQuestions: number
  ) => void;
  isQuizPassed: (moduleId: string) => boolean;

  // Stats
  getTotalModulesStarted: () => number;
  getTotalWorkflowsCompleted: () => number;
  getTotalScenariosCompleted: () => number;
  getTotalQuizzesPassed: () => number;

  // Reset
  resetAll: () => void;
}

const initialState = {
  completedCriteria: {} as Record<string, string[]>,
  moduleStarted: {} as Record<string, boolean>,
  workflowProgress: {} as Record<string, WorkflowProgress>,
  scenarioProgress: {} as Record<string, ScenarioProgress>,
  quizResults: {} as Record<string, QuizResult>,
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

      completeWorkflowStep: (
        workflowId: string,
        step: number,
        totalSteps?: number
      ) => {
        set((state) => {
          const existing = state.workflowProgress[workflowId];
          if (!existing) return state;

          const completedSteps = existing.completedSteps.includes(step)
            ? existing.completedSteps
            : [...existing.completedSteps, step];

          const isNowComplete =
            totalSteps !== undefined &&
            totalSteps > 0 &&
            completedSteps.length >= totalSteps;

          return {
            workflowProgress: {
              ...state.workflowProgress,
              [workflowId]: {
                ...existing,
                currentStep: step,
                completedSteps,
                completedAt: existing.completedAt ?? (isNowComplete ? new Date().toISOString() : undefined),
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

      completeScenarioPhase: (
        scenarioId: string,
        phase: number,
        totalPhases?: number
      ) => {
        set((state) => {
          const existing = state.scenarioProgress[scenarioId];
          if (!existing) return state;

          const completedPhases = existing.completedPhases.includes(phase)
            ? existing.completedPhases
            : [...existing.completedPhases, phase];

          const isNowComplete =
            totalPhases !== undefined &&
            totalPhases > 0 &&
            completedPhases.length >= totalPhases;

          return {
            scenarioProgress: {
              ...state.scenarioProgress,
              [scenarioId]: {
                ...existing,
                currentPhase: phase,
                completedPhases,
                completedAt: existing.completedAt ?? (isNowComplete ? new Date().toISOString() : undefined),
              },
            },
          };
        });
      },

      recordQuizAttempt: (
        moduleId: string,
        score: number,
        totalQuestions: number
      ) => {
        set((state) => {
          const existing = state.quizResults[moduleId];
          const now = new Date().toISOString();
          const percentage =
            totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
          const passed = percentage >= QUIZ_PASS_THRESHOLD;

          return {
            quizResults: {
              ...state.quizResults,
              [moduleId]: {
                bestScore: Math.max(score, existing?.bestScore ?? 0),
                totalQuestions,
                attempts: (existing?.attempts ?? 0) + 1,
                passedAt: existing?.passedAt ?? (passed ? now : undefined),
                lastAttemptAt: now,
              },
            },
          };
        });
      },

      isQuizPassed: (moduleId: string) => {
        const { quizResults } = get();
        return quizResults[moduleId]?.passedAt !== undefined;
      },

      getTotalModulesStarted: () => {
        const { moduleStarted } = get();
        return Object.values(moduleStarted).filter(Boolean).length;
      },

      getTotalWorkflowsCompleted: () => {
        const { workflowProgress } = get();
        return Object.values(workflowProgress).filter(
          (wp) => wp.completedAt !== undefined
        ).length;
      },

      getTotalScenariosCompleted: () => {
        const { scenarioProgress } = get();
        return Object.values(scenarioProgress).filter(
          (sp) => sp.completedAt !== undefined
        ).length;
      },

      getTotalQuizzesPassed: () => {
        const { quizResults } = get();
        return Object.values(quizResults).filter(
          (qr) => qr.passedAt !== undefined
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
