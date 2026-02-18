import type {
  LearningModule,
  Command,
  Workflow,
  Scenario,
  CaseStudy,
  Tool,
  SearchEntry,
} from './types';
import {
  extractModules,
  extractCommands,
  extractWorkflows,
  extractScenarios,
  extractCaseStudies,
  extractTools,
} from './extractors';

// Simple in-memory cache
let modulesCache: LearningModule[] | null = null;
let commandsCache: Command[] | null = null;
let workflowsCache: Workflow[] | null = null;
let scenariosCache: Scenario[] | null = null;
let caseStudiesCache: CaseStudy[] | null = null;
let toolsCache: Tool[] | null = null;
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
      title: `${cmd.tool} - ${cmd.category}`,
      type: 'command',
      content: [cmd.tool, cmd.category, cmd.description, cmd.code].join(' '),
      url: `/commands#${cmd.tool.toLowerCase()}`,
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
  searchEntriesCache = null;
}
