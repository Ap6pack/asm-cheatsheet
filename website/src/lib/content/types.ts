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
    | 'guide';
  content: string; // searchable text
  url: string;
  category?: string;
  difficulty?: Difficulty;
}
