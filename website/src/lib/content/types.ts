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
/**
 * Not every section of the cheatsheet is a *tool*. Some document a technique
 * (jq processing, cron scheduling, troubleshooting) that has no tool page.
 * Conflating the two is what previously surfaced section headings as tools.
 */
export type CommandKind = 'tool' | 'technique';

export interface Command {
  id: string;
  name: string; // the section heading, e.g. "Amass" or "JSON Processing with jq"
  kind: CommandKind;
  /** Set only when kind === 'tool' — links the entry to a tool page. */
  tool?: string;
  category: string; // e.g., "Subdomain Discovery", "Web Service Discovery"
  categoryEmoji: string;
  code: string; // the code block content
  language: string; // typically "bash"
  description: string; // prose describing what the commands do
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
/**
 * Maintenance signal for a documented tool. Practitioners need to know whether
 * something is still actively developed before adopting it.
 */
export type ToolStatus = 'active' | 'legacy' | 'unknown';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  difficulty: string;
  link: string;
  status: ToolStatus;
  /** Free-text note explaining the status, e.g. a suggested replacement. */
  statusNote?: string;
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

/**
 * A long-form reference page published from content/ via the
 * content/reference-pages.json manifest. Unlike the regex-scraped types,
 * its metadata is authored rather than inferred from prose structure.
 */
export interface ReferencePage {
  slug: string;
  file: string;
  title: string;
  description: string;
  category: string;
  order: number;
  content: string;
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

/** A phase is an attacker activity category with a running progress count. */
export interface LabPhase {
  id: string;
  label: string;
  note?: string;
  /**
   * Final cumulative action count once the whole replay has played.
   *
   * Optional on purpose. Only incidents whose responders published action
   * telemetry can state this honestly; for everything else the replay counts
   * timeline events instead, rather than inventing a number that implies
   * forensic precision the public record doesn't support.
   */
  total?: number;
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
  /**
   * Actions attributed to this event. Present only for labs built from
   * published action telemetry; see LabPhase.total.
   */
  actions?: number;
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

/**
 * A defensive control for the "Break the Chain" mode. A control either severs
 * the attack chain at a specific node (breaksAtNode) — that node and everything
 * downstream of it becomes unreachable — or improves detection without cutting.
 */
export interface LabControl {
  id: string;
  label: string;
  detail: string;
  breaksAtNode?: string;
  detection?: boolean;
}

/** Fields every lab shares, whatever its interaction model. */
export interface LabBase {
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
  summary: string; // markdown overview
  lessons: string[];
}

/**
 * A replay of an intrusion timeline, optionally with a "Break the Chain"
 * defender challenge. Labs without an explicit `kind` are treated as this.
 */
export interface IncidentReplayLab extends LabBase {
  kind: 'incident-replay';
  /** Reconstructed action clusters, shown as a header stat when present. */
  clusters?: number;
  /**
   * Total recovered actions for display. May exceed the sum of phase totals
   * when not every recovered action was classified into a phase (as in the
   * source report). Defaults to the sum of phase totals when omitted.
   */
  totalActions?: number;
  stages: LabStage[];
  phases: LabPhase[];
  nodes: LabNode[];
  edges: LabEdge[];
  events: LabEvent[];
  /** Optional "Break the Chain" defender challenge. */
  controls?: LabControl[];
  /** How many controls the defender may deploy (defaults to all). */
  defenderBudget?: number;
}

/** A piece of evidence the learner reads — usually raw tool output. */
export interface TriageArtifact {
  id: string;
  label: string;
  /** Shown under the tab label, e.g. the exact command that produced this. */
  command?: string;
  language: string;
  content: string;
}

export interface TriageQuestion {
  id: string;
  prompt: string;
  /** "single" accepts one answer; "multi" requires every correct option. */
  type: 'single' | 'multi';
  /** Artifact ids this question is asking the learner to read. */
  artifactIds?: string[];
  options: string[];
  /** Indices of the correct option(s). */
  correct: number[];
  explanation: string;
}

/**
 * Given real tool output, decide what matters. Tests the interpretation and
 * prioritization skill that discovery tooling itself never teaches.
 */
export interface TriageLab extends LabBase {
  kind: 'triage';
  /** Scenario framing shown above the evidence. */
  brief: string;
  artifacts: TriageArtifact[];
  questions: TriageQuestion[];
  /** Percentage required to pass. Defaults to 70. */
  passingScore?: number;
}

export type Lab = IncidentReplayLab | TriageLab;

export function isIncidentReplayLab(lab: Lab): lab is IncidentReplayLab {
  return lab.kind === 'incident-replay';
}

export function isTriageLab(lab: Lab): lab is TriageLab {
  return lab.kind === 'triage';
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
    | 'lab'
    | 'reference';
  content: string; // searchable text
  url: string;
  category?: string;
  difficulty?: Difficulty;
}
