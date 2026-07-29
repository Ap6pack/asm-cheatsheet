// Difficulty levels mapped from emoji
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Time estimate parsed from strings like "2-3 hours"
export interface TimeEstimate {
  min: number; // minutes
  max: number; // minutes
  display: string; // original string
}

// Success criterion from checkbox items
export interface SuccessCriterion {
  id: string;
  text: string;
}

// Learning module (from learning_guide.md)
export interface LearningModule {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  timeEstimate: TimeEstimate;
  prerequisites: string[];
  objectives: string[];
  activities: string[];
  successCriteria: SuccessCriterion[];
  resources: { title: string; url: string }[];
  track: string; // "Beginner Track", "Intermediate Track", etc.
  content: string; // raw markdown content for rendering
}

// Command from command_cheatsheet.md
export interface Command {
  id: string;
  tool: string; // e.g., "Amass", "Subfinder"
  category: string; // e.g., "Subdomain Discovery", "Web Service Discovery"
  categoryEmoji: string;
  code: string; // the code block content
  language: string; // typically "bash"
  description: string; // any text before/after the code block
}

// Workflow from practical_workflows.md
export interface WorkflowStep {
  stepNumber: number;
  title: string;
  timeEstimate: string;
  content: string; // markdown content
  codeBlocks: { language: string; code: string }[];
}

export interface Workflow {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  timeEstimate: TimeEstimate;
  scenario: string;
  prerequisites: string;
  output: string;
  steps: WorkflowStep[];
}

// Scenario from scenario-cards.md
export interface ScenarioPhase {
  phaseNumber: number;
  title: string;
  timeEstimate: string;
  content: string;
  codeBlocks: { language: string; code: string }[];
}

export interface Scenario {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  phases: ScenarioPhase[];
}

// Case Study from case_studies.md
export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  industry: string;
  challenge: string;
  outcome: string;
  teamSize: string;
  timeline: string;
  content: string;
  phases: { title: string; content: string }[];
  results: string[];
  lessonsLearned: string[];
}

// Tool from recon_tools.md and cloud_enum_tools.md
export interface Tool {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  difficulty: string;
  link: string;
  category: string; // parent H2 heading
  sourceFile: string; // which file it came from
  installation: { language: string; code: string }[];
  usage: { title: string; language: string; code: string }[];
  content: string; // full markdown
}

// Quiz question (from content/quizzes/module-N.json)
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  moduleId: number;
  passingScore: number; // percentage required to pass
  questions: QuizQuestion[];
}

// Guide from content/guides/*.md
export interface Guide {
  slug: string;
  title: string;
  description: string;
  file: string;
  content: string;
}

// ---- Interactive Incident-Replay labs (content/labs/*.json) ----

export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** A stage groups phases into a high-level arc of the intrusion. */
export interface LabStage {
  id: string;
  name: string;
  note?: string;
}

/** A phase is an attacker activity category with a running action count. */
export interface LabPhase {
  id: string;
  label: string;
  note?: string;
  /** Final cumulative action count once the whole replay has played. */
  total: number;
}

/** A node in the attack-chain graph; ignites when the agent reaches it. */
export interface LabNode {
  id: string;
  stageId: string;
  group: string; // trust boundary / owner, e.g. "Hugging Face internal network"
  label: string;
  sub?: string;
}

/** A directed edge between attack-chain nodes. */
export interface LabEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * A single point on the replay timeline. Playing the lab advances a playhead
 * across the events in order; each one updates the active phase, ignites
 * nodes, and adds to the action counters.
 */
export interface LabEvent {
  id: string;
  t: string; // ISO timestamp within [meta.startUtc, meta.endUtc]
  phaseId: string;
  stageId: string;
  /** Actions attributed to this event (added to the phase + grand total). */
  actions: number;
  title: string;
  detail?: string;
  blastRadius: string; // e.g. "third-party sandbox", "HF internal network"
  ignites?: string[]; // node ids reached at this event
  commands?: string[]; // representative commands run during this event
}

export interface LabSource {
  label: string;
  url: string;
}

export interface Lab {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: LabDifficulty;
  estimatedMinutes: number;
  /** Real incidents cite a public source; fictional training labs omit it. */
  fictional: boolean;
  source?: LabSource;
  disclaimer?: string;
  /** Reconstructed action clusters, shown as a header stat when present. */
  clusters?: number;
  summary: string; // markdown overview
  stages: LabStage[];
  phases: LabPhase[];
  nodes: LabNode[];
  edges: LabEdge[];
  events: LabEvent[];
  lessons: string[];
}

// Search index entry
export interface SearchEntry {
  id: string;
  title: string;
  type:
    | 'module'
    | 'command'
    | 'workflow'
    | 'scenario'
    | 'case-study'
    | 'tool'
    | 'guide'
    | 'lab';
  content: string; // searchable text
  url: string;
  category?: string;
  difficulty?: Difficulty;
}
