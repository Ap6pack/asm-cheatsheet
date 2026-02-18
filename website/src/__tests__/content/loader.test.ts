import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllModules,
  getAllCommands,
  getAllWorkflows,
  getAllScenarios,
  getAllCaseStudies,
  getAllTools,
  getSearchEntries,
  clearCache,
} from '../../lib/content/loader';

describe('Content Loader', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should load all modules', async () => {
    const modules = await getAllModules();
    expect(modules).toHaveLength(12);
  });

  it('should load all commands', async () => {
    const commands = await getAllCommands();
    expect(commands.length).toBeGreaterThanOrEqual(15);
  });

  it('should load all workflows', async () => {
    const workflows = await getAllWorkflows();
    expect(workflows).toHaveLength(6);
  });

  it('should load all scenarios', async () => {
    const scenarios = await getAllScenarios();
    expect(scenarios).toHaveLength(4);
  });

  it('should load all case studies', async () => {
    const caseStudies = await getAllCaseStudies();
    expect(caseStudies.length).toBeGreaterThanOrEqual(5);
  });

  it('should load all tools', async () => {
    const tools = await getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(8);
  });

  it('should generate search entries from all content', async () => {
    const entries = await getSearchEntries();
    expect(entries.length).toBeGreaterThan(0);

    // Should have entries of each type
    const types = [...new Set(entries.map((e) => e.type))];
    expect(types).toContain('module');
    expect(types).toContain('command');
    expect(types).toContain('workflow');
    expect(types).toContain('scenario');
    expect(types).toContain('case-study');
    expect(types).toContain('tool');
  });

  it('should cache results on subsequent calls', async () => {
    const first = await getAllModules();
    const second = await getAllModules();
    // Same reference means cached
    expect(first).toBe(second);
  });

  it('should clear cache properly', async () => {
    const first = await getAllModules();
    clearCache();
    const second = await getAllModules();
    // Different reference after cache clear
    expect(first).not.toBe(second);
    // But same content
    expect(first.length).toBe(second.length);
  });
});
