import { describe, it, expect, beforeAll } from 'vitest';
import {
  extractModules,
  extractCommands,
  extractWorkflows,
  extractScenarios,
  extractCaseStudies,
  extractTools,
} from '../../lib/content/extractors';
import type {
  LearningModule,
  Command,
  Workflow,
  Scenario,
  CaseStudy,
  Tool,
} from '../../lib/content/types';

describe('extractModules', () => {
  let modules: LearningModule[];

  beforeAll(() => {
    modules = extractModules();
  });

  it('should extract 12 learning modules', () => {
    expect(modules).toHaveLength(12);
  });

  it('should have sequential module IDs from 1 to 12', () => {
    const ids = modules.map((m) => m.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should parse module titles correctly', () => {
    expect(modules[0].title).toBe('ASM Fundamentals');
    expect(modules[1].title).toBe('Environment Setup');
    expect(modules[2].title).toBe('Your First ASM Scan');
    expect(modules[11].title).toBe('Program Management and Strategy');
  });

  it('should parse difficulty levels from emoji indicators', () => {
    // Modules 1-5 are Beginner (green)
    expect(modules[0].difficulty).toBe('beginner');
    expect(modules[4].difficulty).toBe('beginner');
    // Modules 6-9 are Intermediate (yellow)
    expect(modules[5].difficulty).toBe('intermediate');
    expect(modules[8].difficulty).toBe('intermediate');
    // Modules 10-12 are Advanced (red)
    expect(modules[9].difficulty).toBe('advanced');
    expect(modules[11].difficulty).toBe('advanced');
  });

  it('should parse time estimates', () => {
    // Module 1: 2-3 hours
    expect(modules[0].timeEstimate.min).toBe(120);
    expect(modules[0].timeEstimate.max).toBe(180);
    expect(modules[0].timeEstimate.display).toContain('2-3 hours');
    // Module 3: 1 hour
    expect(modules[2].timeEstimate.min).toBe(60);
    expect(modules[2].timeEstimate.max).toBe(60);
  });

  it('should parse prerequisites', () => {
    expect(modules[0].prerequisites).toContain('Basic computer literacy');
    expect(modules[1].prerequisites[0]).toContain('Module 1 completed');
  });

  it('should parse learning objectives', () => {
    expect(modules[0].objectives.length).toBeGreaterThan(0);
    expect(modules[0].objectives[0]).toContain('ASM');
  });

  it('should parse success criteria with checkbox items', () => {
    expect(modules[0].successCriteria.length).toBeGreaterThan(0);
    expect(modules[0].successCriteria[0].text).toBeTruthy();
    expect(modules[0].successCriteria[0].id).toMatch(/^module-1-sc-/);
  });

  it('should parse resources with title and url', () => {
    expect(modules[0].resources.length).toBeGreaterThan(0);
    expect(modules[0].resources[0]).toHaveProperty('title');
    expect(modules[0].resources[0]).toHaveProperty('url');
  });

  it('should assign track names correctly', () => {
    expect(modules[0].track).toContain('Beginner Track');
    expect(modules[5].track).toContain('Intermediate Track');
    expect(modules[9].track).toContain('Advanced Track');
  });

  it('should generate valid slugs', () => {
    for (const mod of modules) {
      expect(mod.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('should include raw content', () => {
    for (const mod of modules) {
      expect(mod.content.length).toBeGreaterThan(0);
    }
  });

  it('should parse activities', () => {
    expect(modules[0].activities.length).toBeGreaterThan(0);
  });
});

describe('extractCommands', () => {
  let commands: Command[];

  beforeAll(() => {
    commands = extractCommands();
  });

  it('should extract a reasonable number of commands', () => {
    // The cheatsheet has many categories with code blocks
    expect(commands.length).toBeGreaterThanOrEqual(15);
  });

  it('should have unique IDs', () => {
    const ids = new Set(commands.map((c) => c.id));
    expect(ids.size).toBe(commands.length);
  });

  it('should group commands by category', () => {
    const categories = [...new Set(commands.map((c) => c.category))];
    expect(categories.length).toBeGreaterThan(5);
    expect(categories).toContain('Subdomain Discovery');
    expect(categories).toContain('Web Service Discovery');
    expect(categories).toContain('Port Scanning');
  });

  it('should extract tool names', () => {
    const tools = [...new Set(commands.map((c) => c.tool))];
    expect(tools).toContain('Amass');
    expect(tools).toContain('Subfinder');
    expect(tools).toContain('httpx');
    expect(tools).toContain('Nmap');
  });

  it('should have non-empty code blocks', () => {
    for (const cmd of commands) {
      expect(cmd.code.length).toBeGreaterThan(0);
    }
  });

  it('should have language info (typically bash)', () => {
    for (const cmd of commands) {
      expect(cmd.language).toBeTruthy();
    }
  });

  it('should have category emojis', () => {
    const emojiCommands = commands.filter((c) => c.categoryEmoji);
    expect(emojiCommands.length).toBeGreaterThan(0);
  });
});

describe('extractWorkflows', () => {
  let workflows: Workflow[];

  beforeAll(() => {
    workflows = extractWorkflows();
  });

  it('should extract 6 workflows', () => {
    expect(workflows).toHaveLength(6);
  });

  it('should parse workflow titles correctly', () => {
    const titles = workflows.map((w) => w.title);
    expect(titles).toContain('New Domain Assessment');
    expect(titles).toContain('Continuous Monitoring Setup');
    expect(titles).toContain('Incident Response Investigation');
    expect(titles).toContain('Bug Bounty Reconnaissance');
    expect(titles).toContain('Cloud Migration Assessment');
  });

  it('should parse difficulty levels', () => {
    const newDomain = workflows.find(
      (w) => w.title === 'New Domain Assessment'
    );
    expect(newDomain?.difficulty).toBe('beginner');

    const monitoring = workflows.find(
      (w) => w.title === 'Continuous Monitoring Setup'
    );
    expect(monitoring?.difficulty).toBe('intermediate');

    const ma = workflows.find((w) =>
      w.title.includes('Merger')
    );
    expect(ma?.difficulty).toBe('advanced');
  });

  it('should parse time estimates', () => {
    const newDomain = workflows.find(
      (w) => w.title === 'New Domain Assessment'
    );
    expect(newDomain?.timeEstimate.min).toBe(30);
    expect(newDomain?.timeEstimate.max).toBe(30);
  });

  it('should parse scenario descriptions', () => {
    for (const wf of workflows) {
      expect(wf.scenario.length).toBeGreaterThan(0);
    }
  });

  it('should extract workflow steps', () => {
    for (const wf of workflows) {
      expect(wf.steps.length).toBeGreaterThan(0);
    }
  });

  it('should extract code blocks within steps', () => {
    const newDomain = workflows.find(
      (w) => w.title === 'New Domain Assessment'
    );
    expect(newDomain).toBeDefined();
    const stepsWithCode = newDomain!.steps.filter(
      (s) => s.codeBlocks.length > 0
    );
    expect(stepsWithCode.length).toBeGreaterThan(0);
  });

  it('should generate valid slugs', () => {
    for (const wf of workflows) {
      expect(wf.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('extractScenarios', () => {
  let scenarios: Scenario[];

  beforeAll(() => {
    scenarios = extractScenarios();
  });

  it('should extract 4 scenarios', () => {
    expect(scenarios).toHaveLength(4);
  });

  it('should have sequential scenario IDs from 1 to 4', () => {
    const ids = scenarios.map((s) => s.id);
    expect(ids).toEqual([1, 2, 3, 4]);
  });

  it('should parse scenario titles', () => {
    expect(scenarios[0].title).toContain('Incident Response');
    expect(scenarios[1].title).toContain('M&A Due Diligence');
    expect(scenarios[2].title).toContain('Bug Bounty');
    expect(scenarios[3].title).toContain('Compliance Audit');
  });

  it('should parse subtitles', () => {
    expect(scenarios[0].subtitle).toBeTruthy();
  });

  it('should extract phases for each scenario', () => {
    for (const scenario of scenarios) {
      expect(scenario.phases.length).toBeGreaterThan(0);
    }
  });

  it('should extract code blocks within phases', () => {
    const phasesWithCode = scenarios[0].phases.filter(
      (p) => p.codeBlocks.length > 0
    );
    expect(phasesWithCode.length).toBeGreaterThan(0);
  });

  it('should generate valid slugs', () => {
    for (const sc of scenarios) {
      expect(sc.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('extractCaseStudies', () => {
  let caseStudies: CaseStudy[];

  beforeAll(() => {
    caseStudies = extractCaseStudies();
  });

  it('should extract at least 5 case studies', () => {
    // Case study 6 is listed in index but not present in the content
    expect(caseStudies.length).toBeGreaterThanOrEqual(5);
  });

  it('should parse case study titles', () => {
    expect(caseStudies[0].title).toContain('Fortune 500 Shadow IT Discovery');
    expect(caseStudies[1].title).toContain(
      'Startup Acquisition Due Diligence'
    );
    expect(caseStudies[2].title).toContain(
      'Healthcare Breach Investigation'
    );
    expect(caseStudies[3].title).toContain(
      'E-commerce Platform Expansion'
    );
    expect(caseStudies[4].title).toContain(
      'Government Agency Modernization'
    );
  });

  it('should parse industry/company information', () => {
    // Case Study 1: Major financial services firm
    expect(caseStudies[0].industry).toBeTruthy();
  });

  it('should parse challenge descriptions', () => {
    expect(caseStudies[0].challenge).toBeTruthy();
  });

  it('should parse timeline info', () => {
    expect(caseStudies[0].timeline).toBeTruthy();
  });

  it('should extract phases', () => {
    expect(caseStudies[0].phases.length).toBeGreaterThan(0);
  });

  it('should extract results', () => {
    expect(caseStudies[0].results.length).toBeGreaterThan(0);
  });

  it('should extract lessons learned', () => {
    expect(caseStudies[0].lessonsLearned.length).toBeGreaterThan(0);
  });

  it('should generate valid slugs', () => {
    for (const cs of caseStudies) {
      expect(cs.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('should include full content', () => {
    for (const cs of caseStudies) {
      expect(cs.content.length).toBeGreaterThan(100);
    }
  });
});

describe('extractTools', () => {
  let tools: Tool[];

  beforeAll(() => {
    tools = extractTools();
  });

  it('should extract tools from both recon_tools.md and cloud_enum_tools.md', () => {
    const reconTools = tools.filter(
      (t) => t.sourceFile === 'recon_tools.md'
    );
    const cloudTools = tools.filter(
      (t) => t.sourceFile === 'cloud_enum_tools.md'
    );
    expect(reconTools.length).toBeGreaterThan(0);
    expect(cloudTools.length).toBeGreaterThan(0);
  });

  it('should extract a reasonable number of tools', () => {
    // recon_tools has: Amass, Subfinder, Shodan, Censys, theHarvester, Recon-ng, DNSRecon, Fierce = 8
    // cloud_enum_tools has: CloudEnum, Scout Suite, Pacu = 3
    expect(tools.length).toBeGreaterThanOrEqual(8);
  });

  it('should parse tool names', () => {
    const names = tools.map((t) => t.name);
    expect(names).toContain('Amass');
    expect(names).toContain('Subfinder');
    expect(names).toContain('Shodan');
  });

  it('should parse purpose descriptions', () => {
    for (const tool of tools) {
      expect(tool.purpose.length).toBeGreaterThan(0);
    }
  });

  it('should parse difficulty levels', () => {
    const amass = tools.find((t) => t.name === 'Amass');
    expect(amass?.difficulty).toBeTruthy();
  });

  it('should parse links', () => {
    const amass = tools.find((t) => t.name === 'Amass');
    expect(amass?.link).toContain('github.com');
  });

  it('should extract installation code blocks', () => {
    const amass = tools.find((t) => t.name === 'Amass');
    expect(amass?.installation.length).toBeGreaterThan(0);
    expect(amass?.installation[0].language).toBe('bash');
  });

  it('should extract usage code blocks', () => {
    const amass = tools.find((t) => t.name === 'Amass');
    expect(amass?.usage.length).toBeGreaterThan(0);
  });

  it('should assign categories', () => {
    const amass = tools.find((t) => t.name === 'Amass');
    expect(amass?.category).toBeTruthy();
  });

  it('should generate valid slugs', () => {
    for (const tool of tools) {
      expect(tool.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('should include cloud enumeration tools', () => {
    const cloudEnum = tools.find((t) => t.name === 'CloudEnum');
    expect(cloudEnum).toBeDefined();
    expect(cloudEnum?.sourceFile).toBe('cloud_enum_tools.md');
  });
});
