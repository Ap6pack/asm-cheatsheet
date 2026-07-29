import type {
  LearningModule,
  Command,
  Workflow,
  Scenario,
  CaseStudy,
  Tool,
  Quiz,
  Guide,
  Lab,
  ReferencePage,
  SearchEntry,
} from './types';
import {
  extractModules,
  extractCommands,
  extractWorkflows,
  extractScenarios,
  extractCaseStudies,
  extractTools,
  extractQuizzes,
  extractGuides,
  extractLabs,
  extractReferencePages,
} from './extractors';

// Simple in-memory cache
let modulesCache: LearningModule[] | null = null;
let commandsCache: Command[] | null = null;
let workflowsCache: Workflow[] | null = null;
let scenariosCache: Scenario[] | null = null;
let caseStudiesCache: CaseStudy[] | null = null;
let toolsCache: Tool[] | null = null;
let quizzesCache: Quiz[] | null = null;
let guidesCache: Guide[] | null = null;
let labsCache: Lab[] | null = null;
let referencePagesCache: ReferencePage[] | null = null;
let searchEntriesCache: SearchEntry[] | null = null;

export async function getAllModules(): Promise<LearningModule[]> {
  if (!modulesCache) {
    modulesCache = extractModules();
  }
  return modulesCache;
}

export async function getAllCommands(): Promise<Command[]> {
  if (!commandsCache) {
    commandsCache = extractCommands();
  }
  return commandsCache;
}

export async function getAllWorkflows(): Promise<Workflow[]> {
  if (!workflowsCache) {
    workflowsCache = extractWorkflows();
  }
  return workflowsCache;
}

export async function getAllScenarios(): Promise<Scenario[]> {
  if (!scenariosCache) {
    scenariosCache = extractScenarios();
  }
  return scenariosCache;
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  if (!caseStudiesCache) {
    caseStudiesCache = extractCaseStudies();
  }
  return caseStudiesCache;
}

export async function getAllTools(): Promise<Tool[]> {
  if (!toolsCache) {
    toolsCache = extractTools();
  }
  return toolsCache;
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  if (!quizzesCache) {
    quizzesCache = extractQuizzes();
  }
  return quizzesCache;
}

export async function getQuizForModule(
  moduleId: number
): Promise<Quiz | null> {
  const quizzes = await getAllQuizzes();
  return quizzes.find((q) => q.moduleId === moduleId) ?? null;
}

export async function getAllGuides(): Promise<Guide[]> {
  if (!guidesCache) {
    guidesCache = extractGuides();
  }
  return guidesCache;
}

export async function getAllLabs(): Promise<Lab[]> {
  if (!labsCache) {
    labsCache = extractLabs();
  }
  return labsCache;
}

export async function getLabBySlug(slug: string): Promise<Lab | null> {
  const labs = await getAllLabs();
  return labs.find((l) => l.slug === slug) ?? null;
}

export async function getAllReferencePages(): Promise<ReferencePage[]> {
  if (!referencePagesCache) {
    referencePagesCache = extractReferencePages();
  }
  return referencePagesCache;
}

export async function getReferencePageBySlug(
  slug: string
): Promise<ReferencePage | null> {
  const pages = await getAllReferencePages();
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function getSearchEntries(): Promise<SearchEntry[]> {
  if (!searchEntriesCache) {
    searchEntriesCache = await buildSearchEntries();
  }
  return searchEntriesCache;
}

async function buildSearchEntries(): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];

  const modules = await getAllModules();
  for (const mod of modules) {
    entries.push({
      id: `module-${mod.id}`,
      title: `Module ${mod.id}: ${mod.title}`,
      type: 'module',
      content: [
        mod.title,
        ...mod.objectives,
        ...mod.activities,
        ...mod.successCriteria.map((sc) => sc.text),
      ].join(' '),
      url: `/learn/module-${mod.id}`,
      category: mod.track,
      difficulty: mod.difficulty,
    });
  }

  const commands = await getAllCommands();
  for (const cmd of commands) {
    entries.push({
      id: cmd.id,
      title: `${cmd.name} - ${cmd.category}`,
      type: 'command',
      content: [cmd.name, cmd.category, cmd.description, cmd.code].join(' '),
      url: `/commands#${cmd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      category: cmd.category,
    });
  }

  const workflows = await getAllWorkflows();
  for (const wf of workflows) {
    entries.push({
      id: `workflow-${wf.id}`,
      title: wf.title,
      type: 'workflow',
      content: [
        wf.title,
        wf.scenario,
        ...wf.steps.map((s) => s.title),
      ].join(' '),
      url: `/workflows/${wf.slug}`,
      difficulty: wf.difficulty,
    });
  }

  const scenarios = await getAllScenarios();
  for (const sc of scenarios) {
    entries.push({
      id: `scenario-${sc.id}`,
      title: `Scenario ${sc.id}: ${sc.title}`,
      type: 'scenario',
      content: [
        sc.title,
        sc.subtitle,
        ...sc.phases.map((p) => p.title),
      ].join(' '),
      url: `/scenarios/${sc.slug}`,
    });
  }

  const caseStudies = await getAllCaseStudies();
  for (const cs of caseStudies) {
    entries.push({
      id: `case-study-${cs.id}`,
      title: `Case Study ${cs.id}: ${cs.title}`,
      type: 'case-study',
      content: [
        cs.title,
        cs.industry,
        cs.challenge,
        ...cs.results,
        ...cs.lessonsLearned,
      ].join(' '),
      url: `/case-studies/${cs.slug}`,
    });
  }

  const tools = await getAllTools();
  for (const tool of tools) {
    entries.push({
      id: `tool-${tool.id}`,
      title: tool.name,
      type: 'tool',
      content: [tool.name, tool.purpose, tool.category].join(' '),
      url: `/tools/${tool.slug}`,
      category: tool.category,
    });
  }

  const guides = await getAllGuides();
  for (const guide of guides) {
    entries.push({
      id: `guide-${guide.slug}`,
      title: guide.title,
      type: 'guide',
      // Strip markdown syntax noise and cap length to keep the index lean
      content: [guide.title, guide.description, guide.content]
        .join(' ')
        .replace(/[#*`\[\]()>|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 5000),
      url: `/guides/${guide.slug}`,
    });
  }

  const labs = await getAllLabs();
  for (const lab of labs) {
    entries.push({
      id: `lab-${lab.slug}`,
      title: lab.title,
      type: 'lab',
      content: [
        lab.title,
        lab.subtitle,
        lab.summary,
        ...lab.phases.map((p) => `${p.label} ${p.note ?? ''}`),
        ...lab.nodes.map((n) => `${n.label} ${n.sub ?? ''} ${n.group}`),
        ...lab.events.map((e) => `${e.title} ${e.detail ?? ''}`),
      ]
        .join(' ')
        .replace(/[#*`\[\]()>|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 5000),
      url: `/labs/${lab.slug}`,
      category: lab.category,
      difficulty: lab.difficulty,
    });
  }

  const referencePages = await getAllReferencePages();
  for (const page of referencePages) {
    entries.push({
      id: `reference-${page.slug}`,
      title: page.title,
      type: 'reference',
      content: [page.title, page.description, page.content]
        .join(' ')
        .replace(/[#*`\[\]()>|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 5000),
      url: `/reference/${page.slug}`,
      category: page.category,
    });
  }

  return entries;
}

/**
 * Clear all caches - useful for testing or when content changes
 */
export function clearCache(): void {
  modulesCache = null;
  commandsCache = null;
  workflowsCache = null;
  scenariosCache = null;
  caseStudiesCache = null;
  toolsCache = null;
  quizzesCache = null;
  guidesCache = null;
  labsCache = null;
  referencePagesCache = null;
  searchEntriesCache = null;
}
