import * as path from 'path';
import * as fs from 'fs';
import type {
  LearningModule,
  Command,
  Workflow,
  WorkflowStep,
  Scenario,
  ScenarioPhase,
  CaseStudy,
  Tool,
  Difficulty,
  TimeEstimate,
  SuccessCriterion,
  Quiz,
  QuizQuestion,
  Guide,
  Lab,
  LabDifficulty,
  ReferencePage,
  ToolStatus,
} from './types';

// Base content directory - try multiple locations to support local dev and Vercel
function getContentDir(): string {
  const candidates = [
    // Vercel: content copied into website/content during build
    path.resolve(process.cwd(), 'content'),
    // Local dev: content is sibling of website/
    path.resolve(process.cwd(), '../content'),
    // Relative to this file (local dev fallback)
    path.resolve(__dirname, '../../../../content'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  // Default fallback
  return path.resolve(process.cwd(), '../content');
}

function readContentFile(relativePath: string): string {
  const fullPath = path.join(getContentDir(), relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

// ---- Utility functions ----

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseDifficulty(text: string): Difficulty {
  if (text.includes('\u{1F534}') || text.includes('Advanced') || text.includes('🔴')) {
    return 'advanced';
  }
  if (text.includes('\u{1F7E1}') || text.includes('Intermediate') || text.includes('🟡')) {
    return 'intermediate';
  }
  return 'beginner';
}

function parseTimeEstimate(text: string): TimeEstimate {
  // Handle patterns like "2-3 hours", "30 min", "1 hour", "4-8 hours", "1-2 hours"
  const display = text.trim();

  // Try "X-Y hours" pattern
  let match = display.match(/(\d+)-(\d+)\s*hours?/i);
  if (match) {
    return {
      min: parseInt(match[1]) * 60,
      max: parseInt(match[2]) * 60,
      display,
    };
  }

  // Try "X hours" pattern
  match = display.match(/(\d+)\s*hours?/i);
  if (match) {
    const hours = parseInt(match[1]);
    return { min: hours * 60, max: hours * 60, display };
  }

  // Try "X min" or "X minutes" pattern
  match = display.match(/(\d+)\s*min(?:utes?)?/i);
  if (match) {
    const mins = parseInt(match[1]);
    return { min: mins, max: mins, display };
  }

  return { min: 0, max: 0, display };
}

function parseDifficultyEmoji(line: string): Difficulty {
  if (line.includes('🔴')) return 'advanced';
  if (line.includes('🟡')) return 'intermediate';
  if (line.includes('🟢')) return 'beginner';
  return 'beginner';
}

// ---- extractModules() ----

export function extractModules(): LearningModule[] {
  const content = readContentFile('resources/learning_guide.md');
  const lines = content.split('\n');
  const modules: LearningModule[] = [];

  let currentTrack = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect track headings: ### 🟢 Beginner Track: Foundation Building
    if (line.startsWith('### ')) {
      const trackMatch = line.match(
        /^### [🟢🟡🔴]\s+(.+Track)(?::\s+.+)?$/u
      );
      if (trackMatch) {
        currentTrack = trackMatch[1];
      }
    }

    // Detect module headings: #### Module N: Title (Time)
    const moduleMatch = line.match(
      /^####\s+Module\s+(\d+):\s+(.+?)\s*\((.+?)\)\s*$/
    );
    if (moduleMatch) {
      const moduleId = parseInt(moduleMatch[1]);
      const moduleTitle = moduleMatch[2].trim();
      const timeStr = moduleMatch[3].trim();
      const timeEstimate = parseTimeEstimate(timeStr);

      // Collect all lines for this module until next module or track heading
      const moduleLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        // Stop if we hit another module heading or a track heading or ---
        if (
          nextLine.match(/^####\s+Module\s+\d+:/) ||
          nextLine.match(/^###\s+[🟢🟡🔴]/) ||
          nextLine.match(/^##\s+/)
        ) {
          break;
        }
        if (nextLine.trim() === '---') {
          i++;
          break;
        }
        moduleLines.push(nextLine);
        i++;
      }

      const moduleContent = moduleLines.join('\n');

      // Parse prerequisites
      const prereqMatch = moduleContent.match(
        /\*\*Prerequisites:\*\*\s*(.+)/
      );
      const prerequisites = prereqMatch
        ? prereqMatch[1]
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

      // Parse difficulty
      const diffMatch = moduleContent.match(/\*\*Difficulty:\*\*\s*(.+)/);
      const difficulty = diffMatch
        ? parseDifficultyEmoji(diffMatch[1])
        : 'beginner';

      // Parse learning objectives
      const objectives: string[] = [];
      const objSection = moduleContent.match(
        /\*\*Learning Objectives:\*\*\n([\s\S]*?)(?=\n\*\*|\n####|$)/
      );
      if (objSection) {
        const objLines = objSection[1].split('\n');
        for (const ol of objLines) {
          const m = ol.match(/^-\s+(.+)/);
          if (m) objectives.push(m[1].trim());
        }
      }

      // Parse activities
      const activities: string[] = [];
      const actSection = moduleContent.match(
        /\*\*Hands-On Activities:\*\*\n([\s\S]*?)(?=\n\*\*Success Criteria|\n####|$)/
      );
      if (actSection) {
        const actLines = actSection[1].split('\n');
        for (const al of actLines) {
          const m = al.match(/^\d+\.\s+(.+)/);
          if (m) activities.push(m[1].trim());
        }
      }

      // Parse success criteria
      const successCriteria: SuccessCriterion[] = [];
      const scSection = moduleContent.match(
        /\*\*Success Criteria:\*\*\n([\s\S]*?)(?=\n---|\n####|\n###|\n##|$)/
      );
      if (scSection) {
        const scLines = scSection[1].split('\n');
        for (const sl of scLines) {
          const m = sl.match(/^-\s+\[\s*\]\s+(.+)/);
          if (m) {
            successCriteria.push({
              id: `module-${moduleId}-sc-${successCriteria.length + 1}`,
              text: m[1].trim(),
            });
          }
        }
      }

      // Parse resources
      const resources: { title: string; url: string }[] = [];
      const resSection = moduleContent.match(
        /\*\*Resources:\*\*\n([\s\S]*?)(?=\n\*\*Hands-On|\n####|$)/
      );
      if (resSection) {
        const resLines = resSection[1].split('\n');
        for (const rl of resLines) {
          const m = rl.match(/^-\s+\[(.+?)\]\((.+?)\)/);
          if (m) {
            resources.push({ title: m[1], url: m[2] });
          }
        }
      }

      modules.push({
        id: moduleId,
        title: moduleTitle,
        slug: slugify(moduleTitle),
        difficulty,
        timeEstimate,
        prerequisites,
        objectives,
        activities,
        successCriteria,
        resources,
        track: currentTrack,
        content: moduleContent,
      });
      continue;
    }
    i++;
  }

  return modules;
}

// ---- extractCommands() ----

/**
 * Categories in command_cheatsheet.md that document policy/checklists rather
 * than runnable commands. Their code fences hold `echo` checklists and target
 * lists, so surfacing them as commands is misleading — they belong on the
 * security-considerations reference page instead.
 */
const NON_COMMAND_CATEGORIES = new Set([
  'CRITICAL SECURITY WARNINGS',
  'Legal and Ethical Guidelines',
]);

/**
 * Categories whose H3 sections name an actual tool. Everything else documents
 * a technique (jq processing, cron scheduling, troubleshooting), which has a
 * heading but no tool page to link to.
 */
const TOOL_CATEGORIES = new Set([
  'Subdomain Discovery',
  'Web Service Discovery',
  'Port Scanning',
  'Screenshots',
  'Search Engine Reconnaissance',
  'OSINT and Information Gathering',
  'Cloud Asset Discovery',
]);

/**
 * Section headings inside a tool category that still describe a technique
 * rather than a named tool.
 */
const NON_TOOL_HEADINGS = new Set([
  'Certificate Transparency',
  'Google Dorking',
  'S3 Bucket Discovery',
]);

export function extractCommands(): Command[] {
  const content = readContentFile('resources/command_cheatsheet.md');
  const lines = content.split('\n');
  const commands: Command[] = [];

  let currentCategory = '';
  let currentCategoryEmoji = '';
  let currentHeading = '';
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  let descriptionLines: string[] = [];
  let commandIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect category: ## 🔍 Subdomain Discovery
    const catMatch = line.match(/^##\s+(\S+)\s+(.+)$/);
    if (catMatch && !line.startsWith('###')) {
      currentCategoryEmoji = catMatch[1];
      currentCategory = catMatch[2].trim();
      currentHeading = '';
      descriptionLines = [];
      continue;
    }

    // Detect section heading: ### Amass
    const headingMatch = line.match(/^###\s+(.+)$/);
    if (headingMatch && currentCategory) {
      currentHeading = headingMatch[1].trim();
      descriptionLines = [];
      continue;
    }

    // Code block start
    if (line.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true;
      codeLanguage = line.slice(3).trim() || 'bash';
      codeLines = [];
      continue;
    }

    // Code block end
    if (line.startsWith('```') && inCodeBlock) {
      inCodeBlock = false;
      if (
        currentCategory &&
        currentHeading &&
        !NON_COMMAND_CATEGORIES.has(currentCategory)
      ) {
        const isTool =
          TOOL_CATEGORIES.has(currentCategory) &&
          !NON_TOOL_HEADINGS.has(currentHeading);
        commandIndex++;
        commands.push({
          id: `cmd-${commandIndex}`,
          name: currentHeading,
          kind: isTool ? 'tool' : 'technique',
          ...(isTool ? { tool: currentHeading } : {}),
          category: currentCategory,
          categoryEmoji: currentCategoryEmoji,
          code: codeLines.join('\n'),
          language: codeLanguage,
          description: descriptionLines.join('\n').trim(),
        });
      }
      descriptionLines = [];
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    } else if (currentHeading && !line.startsWith('#')) {
      // Prose between the heading and the fence describes the commands.
      // Skip blockquote/callout markers so the description stays clean.
      descriptionLines.push(line);
    }
  }

  return commands;
}

// ---- extractWorkflows() ----

export function extractWorkflows(): Workflow[] {
  const content = readContentFile('examples/practical_workflows.md');
  const lines = content.split('\n');
  const workflows: Workflow[] = [];

  // Find all ## headings that represent workflows
  // Pattern: ## 🟢 New Domain Assessment or ## 🟡 Continuous Monitoring Setup
  // We must track code block state to avoid matching headings inside code blocks
  let i = 0;
  let inCodeBlock = false;

  while (i < lines.length) {
    const line = lines[i];

    // Track code block boundaries
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      i++;
      continue;
    }

    // Skip lines inside code blocks
    if (inCodeBlock) {
      i++;
      continue;
    }

    // Match workflow heading: ## 🟢 Title or ## 🔴 Title
    const wfMatch = line.match(/^##\s+([🟢🟡🔴])\s+(.+)$/u);
    if (wfMatch) {
      const diffEmoji = wfMatch[1];
      const title = wfMatch[2].trim();
      const difficulty = parseDifficulty(diffEmoji);

      // Collect all lines for this workflow until next top-level ## heading
      // Track code blocks so we don't break on headings inside code blocks
      const wfLines: string[] = [];
      let innerCodeBlock = false;
      i++;
      while (i < lines.length) {
        if (lines[i].startsWith('```')) {
          innerCodeBlock = !innerCodeBlock;
        }
        if (!innerCodeBlock && (lines[i].match(/^##\s+[🟢🟡🔴]/) || lines[i].match(/^##\s+📋/))) {
          break;
        }
        wfLines.push(lines[i]);
        i++;
      }

      const wfContent = wfLines.join('\n');

      // Parse metadata
      const scenarioMatch = wfContent.match(
        /\*\*Scenario:\*\*\s*(.+)/
      );
      const timeMatch = wfContent.match(
        /\*\*Time Required:\*\*\s*(.+)/
      );
      const prereqMatch = wfContent.match(
        /\*\*Prerequisites:\*\*\s*(.+)/
      );
      const outputMatch = wfContent.match(/\*\*Output:\*\*\s*(.+)/);

      const timeStr = timeMatch ? timeMatch[1].trim() : '';
      const timeEstimate = parseTimeEstimate(timeStr);

      // Parse steps: ### Step N: Title (Time)  or ### Step N: Title
      const steps: WorkflowStep[] = [];
      const stepRegex =
        /^###\s+Step\s+(\d+):\s+(.+?)(?:\s*\((.+?)\))?\s*$/;
      const stepLines = wfContent.split('\n');

      for (let si = 0; si < stepLines.length; si++) {
        const stepMatch = stepLines[si].match(stepRegex);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[1]);
          const stepTitle = stepMatch[2].trim();
          const stepTime = stepMatch[3] || '';

          // Collect step content until next ### or end
          const stepContentLines: string[] = [];
          si++;
          while (si < stepLines.length) {
            if (stepLines[si].match(/^###\s+/)) {
              si--;
              break;
            }
            stepContentLines.push(stepLines[si]);
            si++;
          }

          const stepContent = stepContentLines.join('\n');

          // Extract code blocks from step content
          const codeBlocks: { language: string; code: string }[] = [];
          let inBlock = false;
          let blockLang = '';
          let blockLines: string[] = [];

          for (const cl of stepContentLines) {
            if (cl.startsWith('```') && !inBlock) {
              inBlock = true;
              blockLang = cl.slice(3).trim() || 'bash';
              blockLines = [];
            } else if (cl.startsWith('```') && inBlock) {
              inBlock = false;
              codeBlocks.push({
                language: blockLang,
                code: blockLines.join('\n'),
              });
            } else if (inBlock) {
              blockLines.push(cl);
            }
          }

          steps.push({
            stepNumber,
            title: stepTitle,
            timeEstimate: stepTime,
            content: stepContent,
            codeBlocks,
          });
        }
      }

      workflows.push({
        id: slugify(title),
        title,
        slug: slugify(title),
        difficulty,
        timeEstimate,
        scenario: scenarioMatch ? scenarioMatch[1].trim() : '',
        prerequisites: prereqMatch ? prereqMatch[1].trim() : '',
        output: outputMatch ? outputMatch[1].trim() : '',
        steps,
      });
      continue;
    }
    i++;
  }

  return workflows;
}

// ---- extractScenarios() ----

export function extractScenarios(): Scenario[] {
  const content = readContentFile('quick-reference/scenario-cards.md');
  const lines = content.split('\n');
  const scenarios: Scenario[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Match: ## 🚨 SCENARIO 1: Incident Response - Rapid Asset Discovery
    // or: ## 💼 SCENARIO 2: M&A Due Diligence - Comprehensive Assessment
    // or: ## 🐛 SCENARIO 3: Bug Bounty - Efficient Target Mapping
    // or: ## 🔒 SCENARIO 4: Compliance Audit - Evidence Collection
    const scenarioMatch = line.match(
      /^##\s+\S+\s+SCENARIO\s+(\d+):\s+(.+)$/u
    );
    if (scenarioMatch) {
      const scenarioId = parseInt(scenarioMatch[1]);
      const fullTitle = scenarioMatch[2].trim();

      // Split title into main title and subtitle if there's a " - "
      const titleParts = fullTitle.split(' - ');
      const title = titleParts[0].trim();
      const subtitle = titleParts.length > 1 ? titleParts[1].trim() : '';

      // Collect all lines for this scenario until next ## SCENARIO or end
      const scenarioLines: string[] = [];
      i++;
      while (i < lines.length) {
        if (lines[i].match(/^##\s+\S+\s+SCENARIO\s+\d+:/u)) {
          break;
        }
        scenarioLines.push(lines[i]);
        i++;
      }

      const scenarioContent = scenarioLines.join('\n');

      // Parse phases: ### Phase N: Title (Time) or ### Intelligent Target Discovery etc
      const phases: ScenarioPhase[] = [];
      const phaseRegex =
        /^###\s+(?:Phase\s+(\d+):\s+)?(.+?)(?:\s*\((.+?)\))?\s*$/;

      let phaseNumber = 0;
      for (let si = 0; si < scenarioLines.length; si++) {
        const phaseMatch = scenarioLines[si].match(phaseRegex);
        if (phaseMatch) {
          phaseNumber++;
          const phaseTitle = phaseMatch[2].trim();
          const phaseTime = phaseMatch[3] || '';

          // Collect phase content
          const phaseContentLines: string[] = [];
          si++;
          while (si < scenarioLines.length) {
            if (scenarioLines[si].match(/^###\s+/)) {
              si--;
              break;
            }
            phaseContentLines.push(scenarioLines[si]);
            si++;
          }

          // Extract code blocks
          const codeBlocks: { language: string; code: string }[] = [];
          let inBlock = false;
          let blockLang = '';
          let blockLines: string[] = [];

          for (const cl of phaseContentLines) {
            if (cl.startsWith('```') && !inBlock) {
              inBlock = true;
              blockLang = cl.slice(3).trim() || 'bash';
              blockLines = [];
            } else if (cl.startsWith('```') && inBlock) {
              inBlock = false;
              codeBlocks.push({
                language: blockLang,
                code: blockLines.join('\n'),
              });
            } else if (inBlock) {
              blockLines.push(cl);
            }
          }

          phases.push({
            phaseNumber: phaseMatch[1]
              ? parseInt(phaseMatch[1])
              : phaseNumber,
            title: phaseTitle,
            timeEstimate: phaseTime,
            content: phaseContentLines.join('\n'),
            codeBlocks,
          });
        }
      }

      scenarios.push({
        id: scenarioId,
        title,
        slug: slugify(title),
        subtitle,
        phases,
      });
      continue;
    }
    i++;
  }

  return scenarios;
}

// ---- extractCaseStudies() ----

export function extractCaseStudies(): CaseStudy[] {
  const content = readContentFile('examples/case_studies.md');
  const lines = content.split('\n');
  const caseStudies: CaseStudy[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Match: ## Case Study N: Title
    const csMatch = line.match(/^##\s+Case Study\s+(\d+):\s+(.+)$/);
    if (csMatch) {
      const csId = parseInt(csMatch[1]);
      const csTitle = csMatch[2].trim();

      // Collect all lines until next ## Case Study or end
      const csLines: string[] = [];
      i++;
      while (i < lines.length) {
        if (lines[i].match(/^##\s+Case Study\s+\d+:/)) {
          break;
        }
        // Also stop at the index table heading
        if (lines[i].match(/^##\s+📋/)) {
          break;
        }
        csLines.push(lines[i]);
        i++;
      }

      const csContent = csLines.join('\n');

      // Parse background metadata
      // Look for patterns like **Company:** or **Scenario:** or **Organization:** or **Agency:**
      const industryPatterns = [
        /\*\*(?:Company|Organization|Agency):\*\*\s*(.+)/,
      ];
      let industry = '';
      for (const pat of industryPatterns) {
        const m = csContent.match(pat);
        if (m) {
          industry = m[1].trim();
          break;
        }
      }

      const challengeMatch = csContent.match(
        /\*\*(?:Challenge|Incident|Project):\*\*\s*(.+)/
      );
      const challenge = challengeMatch ? challengeMatch[1].trim() : '';

      const timelineMatch = csContent.match(
        /\*\*(?:Timeline|Constraints):\*\*\s*(.+)/
      );
      const timeline = timelineMatch ? timelineMatch[1].trim() : '';

      const teamMatch = csContent.match(
        /\*\*(?:Team Size|ASM Team):\*\*\s*(.+)/
      );
      const teamSize = teamMatch ? teamMatch[1].trim() : '';

      // Determine outcome from the case study index table or content
      // Look for key outcome phrases in the content
      let outcome = '';
      const outcomePatterns = [
        // Look for quantified results or key metrics
        /(?:\*\*)?(?:Quantified )?Results(?:\*\*)?[\s\S]*?- \*\*(.+?)\*\*/,
      ];
      for (const pat of outcomePatterns) {
        const m = csContent.match(pat);
        if (m) {
          outcome = m[1].trim();
          break;
        }
      }

      // Parse phases (#### Phase N: Title)
      const phases: { title: string; content: string }[] = [];
      const phaseRegex = /^####\s+Phase\s+\d+:\s+(.+?)(?:\s*\(.+?\))?\s*$/;

      for (let ci = 0; ci < csLines.length; ci++) {
        const phaseMatch = csLines[ci].match(phaseRegex);
        if (phaseMatch) {
          const phaseTitle = phaseMatch[1].trim();
          const phaseContentLines: string[] = [];
          ci++;
          while (ci < csLines.length) {
            if (
              csLines[ci].match(/^####\s+Phase/) ||
              csLines[ci].match(/^###\s+/)
            ) {
              ci--;
              break;
            }
            phaseContentLines.push(csLines[ci]);
            ci++;
          }
          phases.push({
            title: phaseTitle,
            content: phaseContentLines.join('\n'),
          });
        }
      }

      // Parse results
      const results: string[] = [];
      const resultsSection = csContent.match(
        /(?:####\s+Quantified Results|####\s+Quantified Benefits|####\s+Launch Success Metrics|####\s+Business Results)([\s\S]*?)(?=\n####|\n###|\n##|$)/
      );
      if (resultsSection) {
        const resultLines = resultsSection[1].split('\n');
        for (const rl of resultLines) {
          const m = rl.match(/^-\s+\*\*(.+?)\*\*\s*(.*)/);
          if (m) {
            results.push(`${m[1]}${m[2] ? ' ' + m[2] : ''}`);
          }
        }
      }

      // Parse lessons learned
      const lessonsLearned: string[] = [];
      const lessonsSection = csContent.match(
        /(?:####\s+(?:What Worked Well|Key (?:Lessons|Recommendations))|###\s+(?:Lessons Learned|Long-term Outcomes|Outcomes and Lessons))([\s\S]*?)(?=\n---|\n##\s+Case Study|$)/
      );
      if (lessonsSection) {
        const lessonLines = lessonsSection[1].split('\n');
        for (const ll of lessonLines) {
          const m = ll.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(.*)/);
          if (m) {
            lessonsLearned.push(
              `${m[1]}${m[2] ? ' ' + m[2].replace(/^[-–]\s*/, '') : ''}`
            );
          }
        }
      }

      caseStudies.push({
        id: csId,
        title: csTitle,
        slug: slugify(csTitle),
        industry,
        challenge,
        outcome,
        teamSize,
        timeline,
        content: csContent,
        phases,
        results,
        lessonsLearned,
      });
      continue;
    }
    i++;
  }

  return caseStudies;
}

/**
 * Parse a `**Status:**` line into a structured maintenance signal.
 * Example: "Legacy — superseded by dnsx for most workflows"
 */
function parseToolStatus(raw: string): {
  status: ToolStatus;
  statusNote?: string;
} {
  const text = raw.trim();
  if (!text) return { status: 'unknown' };
  const [head, ...rest] = text.split(/\s+[—–-]\s+/);
  const note = rest.join(' - ').trim();
  const key = head.trim().toLowerCase();
  const status: ToolStatus =
    key.startsWith('active') ? 'active'
    : key.startsWith('legacy') || key.startsWith('deprecated') ? 'legacy'
    : 'unknown';
  return note ? { status, statusNote: note } : { status };
}

// ---- extractTools() ----

export function extractTools(): Tool[] {
  const tools: Tool[] = [];

  // `defaultCategory` covers tools documented as top-level H2 headings (as in
  // cloud_enum_tools.md), which have no enclosing category heading of their own.
  const files = [
    {
      path: 'tools/recon_tools.md',
      sourceFile: 'recon_tools.md',
      defaultCategory: 'Reconnaissance Tools',
    },
    {
      path: 'tools/cloud_enum_tools.md',
      sourceFile: 'cloud_enum_tools.md',
      defaultCategory: 'Cloud Enumeration Tools',
    },
    {
      path: 'tools/modern_tools.md',
      sourceFile: 'modern_tools.md',
      defaultCategory: 'Modern ASM Toolchain',
    },
  ];

  for (const file of files) {
    let content: string;
    try {
      content = readContentFile(file.path);
    } catch {
      continue;
    }

    const lines = content.split('\n');
    let currentCategory = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect H2 category: ## 🔍 Subdomain Discovery Tools
      // But skip if the very next non-blank line has **Purpose:** (meaning it's a tool, not a category)
      const catMatch = line.match(/^##\s+\S+\s+(.+)$/u);
      if (catMatch && !line.startsWith('###')) {
        // Check if this H2 is actually a tool: **Purpose:** appears before any ### heading
        let isToolH2 = false;
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '') continue;
          if (nextLine.startsWith('###')) break; // Hit a sub-heading first, so this is a category
          if (nextLine.startsWith('**Purpose:**')) {
            isToolH2 = true;
            break;
          }
          break; // First non-blank, non-purpose line - it's a category
        }
        if (!isToolH2) {
          currentCategory = catMatch[1].trim();
          i++;
          continue;
        }
      }

      // Detect H3 tool: ### Amass or ## 🔍 CloudEnum (for cloud_enum_tools.md, some tools are H2)
      const toolH3Match = line.match(/^###\s+(.+)$/);
      const toolH2WithToolMatch =
        !toolH3Match && line.match(/^##\s+\S+\s+(.+)$/u);

      let toolName = '';
      let isH2Tool = false;

      if (toolH3Match) {
        toolName = toolH3Match[1].trim();
      } else if (toolH2WithToolMatch) {
        // This is a H2 that might be a category or a tool in cloud_enum_tools.md
        // We'll only treat it as a tool if it has **Purpose:** shortly after
        const lookahead = lines
          .slice(i + 1, Math.min(i + 5, lines.length))
          .join('\n');
        if (lookahead.includes('**Purpose:**')) {
          toolName = toolH2WithToolMatch[1].trim();
          // A tool documented at H2 has no enclosing category — fall back to
          // the file's default rather than labelling it with its own name.
          currentCategory = file.defaultCategory;
          isH2Tool = true;
        } else {
          currentCategory = toolH2WithToolMatch[1].trim();
          i++;
          continue;
        }
      }

      if (toolName) {
        // Collect all lines for this tool until next ### or ## heading
        const toolLines: string[] = [];
        const toolHeadingDepth = isH2Tool ? 2 : 3;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.match(/^##\s+/) && toolHeadingDepth >= 2 && !isH2Tool) {
            break;
          }
          if (nextLine.match(/^###\s+/) && toolHeadingDepth === 3) {
            break;
          }
          if (isH2Tool && nextLine.match(/^##\s+/) && i > 0) {
            break;
          }
          toolLines.push(nextLine);
          i++;
        }

        const toolContent = toolLines.join('\n');

        // Parse metadata
        const purposeMatch = toolContent.match(
          /\*\*Purpose:\*\*\s*(.+)/
        );
        const difficultyMatch = toolContent.match(
          /\*\*Difficulty:\*\*\s*(.+)/
        );
        const linkMatch = toolContent.match(/\*\*Link:\*\*\s*(.+)/);
        // **Status:** Active | Legacy — optional note after an em/en dash
        const statusMatch = toolContent.match(/\*\*Status:\*\*\s*(.+)/);

        // Only include if it has Purpose (to filter out non-tool sections)
        if (purposeMatch) {
          // Parse installation code blocks
          const installation: { language: string; code: string }[] = [];
          const usage: { title: string; language: string; code: string }[] =
            [];

          let inInstallation = false;
          let inUsage = false;
          let usageTitle = '';
          let inBlock = false;
          let blockLang = '';
          let blockLines: string[] = [];

          for (const tl of toolLines) {
            if (tl.match(/^\*\*Installation:\*\*/)) {
              inInstallation = true;
              inUsage = false;
              continue;
            }
            // Any bold header describing usage starts a usage section. Matching
            // on the shape rather than an allowlist of names means new tool
            // docs don't silently lose their examples.
            if (
              tl.match(
                /^\*\*[^*]*\b(?:Usage|Examples?|Searches|Queries|Techniques|Options|Workflow|Modules|Scans?|Commands?|Rules|Templates?|Session Management):\*\*/i
              )
            ) {
              inUsage = true;
              inInstallation = false;
              const titleMatch = tl.match(/^\*\*(.+?):\*\*/);
              usageTitle = titleMatch ? titleMatch[1] : 'Usage';
              continue;
            }
            // Other bold headers might end installation/usage context
            if (
              tl.match(/^\*\*(?:Configuration|API Configuration|Custom)/) &&
              !tl.match(/^\*\*Custom Mutations/)
            ) {
              inInstallation = false;
              inUsage = false;
            }

            if (tl.startsWith('```') && !inBlock) {
              inBlock = true;
              blockLang = tl.slice(3).trim() || 'bash';
              blockLines = [];
            } else if (tl.startsWith('```') && inBlock) {
              inBlock = false;
              const block = {
                language: blockLang,
                code: blockLines.join('\n'),
              };
              if (inInstallation) {
                installation.push(block);
              } else if (inUsage) {
                usage.push({
                  title: usageTitle,
                  ...block,
                });
              }
            } else if (inBlock) {
              blockLines.push(tl);
            }
          }

          tools.push({
            id: slugify(toolName),
            name: toolName,
            slug: slugify(toolName),
            purpose: purposeMatch[1].trim(),
            difficulty: difficultyMatch
              ? difficultyMatch[1].trim()
              : '',
            link: linkMatch ? linkMatch[1].trim() : '',
            ...parseToolStatus(statusMatch ? statusMatch[1] : ''),
            category: currentCategory,
            sourceFile: file.sourceFile,
            installation,
            usage,
            content: toolContent,
          });
        }
        continue;
      }
      i++;
    }
  }

  return tools;
}

// ---- Quizzes (content/quizzes/module-N.json) ----

/**
 * Validate a parsed quiz file. Throws with a descriptive message so a
 * malformed contribution fails the build instead of breaking pages silently.
 */
export function validateQuiz(data: unknown, sourceFile: string): Quiz {
  const fail = (msg: string): never => {
    throw new Error(`Invalid quiz in ${sourceFile}: ${msg}`);
  };

  if (typeof data !== 'object' || data === null) fail('not a JSON object');
  const quiz = data as Record<string, unknown>;

  if (typeof quiz.moduleId !== 'number') fail('"moduleId" must be a number');
  if (
    typeof quiz.passingScore !== 'number' ||
    quiz.passingScore <= 0 ||
    quiz.passingScore > 100
  ) {
    fail('"passingScore" must be a percentage between 1 and 100');
  }
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    fail('"questions" must be a non-empty array');
  }

  const seenIds = new Set<string>();
  for (const [i, raw] of (quiz.questions as unknown[]).entries()) {
    if (typeof raw !== 'object' || raw === null) {
      fail(`question ${i + 1} is not an object`);
    }
    const q = raw as Record<string, unknown>;
    if (typeof q.id !== 'string' || q.id.length === 0) {
      fail(`question ${i + 1} is missing an "id"`);
    }
    if (seenIds.has(q.id as string)) {
      fail(`duplicate question id "${q.id}"`);
    }
    seenIds.add(q.id as string);
    if (typeof q.question !== 'string' || q.question.length === 0) {
      fail(`question "${q.id}" is missing "question" text`);
    }
    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      !q.options.every((o) => typeof o === 'string' && o.length > 0)
    ) {
      fail(`question "${q.id}" must have at least 2 non-empty string options`);
    }
    if (
      typeof q.correctIndex !== 'number' ||
      !Number.isInteger(q.correctIndex) ||
      q.correctIndex < 0 ||
      q.correctIndex >= (q.options as string[]).length
    ) {
      fail(`question "${q.id}" has an out-of-range "correctIndex"`);
    }
    if (typeof q.explanation !== 'string' || q.explanation.length === 0) {
      fail(`question "${q.id}" is missing an "explanation"`);
    }
  }

  return quiz as unknown as Quiz;
}

export function extractQuizzes(): Quiz[] {
  const quizzesDir = path.join(getContentDir(), 'quizzes');
  if (!fs.existsSync(quizzesDir)) return [];

  const files = fs
    .readdirSync(quizzesDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(quizzesDir, file), 'utf-8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Invalid quiz in quizzes/${file}: not valid JSON (${(err as Error).message})`
      );
    }
    return validateQuiz(parsed, `quizzes/${file}`);
  });
}

// ---- Guides (content/guides/*.md) ----

export function extractGuides(): Guide[] {
  const guidesDir = path.join(getContentDir(), 'guides');
  if (!fs.existsSync(guidesDir)) return [];

  const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith('.md'));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(guidesDir, file), 'utf-8');
    const lines = content.split('\n');
    const firstHeading = lines.find((l) => l.startsWith('# '));
    const title = firstHeading
      ? firstHeading.replace(/^#\s+/, '').trim()
      : file.replace('.md', '');

    // First paragraph after the title heading becomes the description
    let description = '';
    let foundHeading = false;
    for (const line of lines) {
      if (line.startsWith('# ')) {
        foundHeading = true;
        continue;
      }
      if (foundHeading && line.trim() && !line.startsWith('#')) {
        description = line.trim();
        break;
      }
    }

    return {
      slug: file.replace('.md', ''),
      title,
      description,
      file,
      content,
    };
  });
}

// ---- Incident-replay labs (content/labs/*.json) ----

const LAB_DIFFICULTIES: LabDifficulty[] = [
  'beginner',
  'intermediate',
  'advanced',
];

/**
 * Validate a parsed lab file. Throws a descriptive error so a malformed
 * contribution fails the build instead of rendering a broken replay.
 * `expectedSlug` (the filename without extension) is cross-checked.
 */
export function validateLab(
  data: unknown,
  sourceFile: string,
  expectedSlug?: string
): Lab {
  const fail = (msg: string): never => {
    throw new Error(`Invalid lab in ${sourceFile}: ${msg}`);
  };

  if (typeof data !== 'object' || data === null) fail('not a JSON object');
  const lab = data as Record<string, unknown>;

  const str = (key: string) => {
    if (typeof lab[key] !== 'string' || (lab[key] as string).length === 0) {
      fail(`"${key}" must be a non-empty string`);
    }
    return lab[key] as string;
  };

  const slug = str('slug');
  if (expectedSlug && slug !== expectedSlug) {
    fail(`"slug" is "${slug}" but the filename is "${expectedSlug}.json"`);
  }
  str('title');
  str('subtitle');
  str('category');
  str('summary');

  if (!LAB_DIFFICULTIES.includes(lab.difficulty as LabDifficulty)) {
    fail('"difficulty" must be beginner, intermediate, or advanced');
  }
  if (typeof lab.estimatedMinutes !== 'number' || lab.estimatedMinutes <= 0) {
    fail('"estimatedMinutes" must be a positive number');
  }
  if (typeof lab.fictional !== 'boolean') {
    fail('"fictional" must be a boolean');
  }
  if (!lab.fictional) {
    const source = lab.source as Record<string, unknown> | undefined;
    if (
      !source ||
      typeof source.url !== 'string' ||
      typeof source.label !== 'string'
    ) {
      fail('a real (non-fictional) lab must cite a source with a label and url');
    }
  }


  // Labs authored before the triage type existed have no `kind`; they are
  // incident replays. Defaulting here keeps existing content files valid.
  const kind = lab.kind === undefined ? 'incident-replay' : lab.kind;
  if (kind !== 'incident-replay' && kind !== 'triage') {
    fail('"kind" must be "incident-replay" or "triage"');
  }
  lab.kind = kind;

  if (!Array.isArray(lab.lessons) || lab.lessons.length === 0) {
    fail('"lessons" must be a non-empty array');
  }

  if (kind === 'incident-replay') {
    const stages = lab.stages;
    if (!Array.isArray(stages) || stages.length === 0) {
      fail('"stages" must be a non-empty array');
    }
    const stageIds = new Set<string>();
    for (const s of stages as Record<string, unknown>[]) {
      if (typeof s.id !== 'string' || typeof s.name !== 'string') {
        fail('each stage needs a string id and name');
      }
      stageIds.add(s.id as string);
    }

    const phases = lab.phases;
    if (!Array.isArray(phases) || phases.length === 0) {
      fail('"phases" must be a non-empty array');
    }
    // A lab either has published action telemetry for every phase, or for none.
    // Mixing the two would make the progress counters meaningless.
    const phaseIds = new Set<string>();
    const phaseTotals = new Map<string, number>();
    let phasesWithTotals = 0;
    for (const p of phases as Record<string, unknown>[]) {
      if (typeof p.id !== 'string' || typeof p.label !== 'string') {
        fail('each phase needs a string id and label');
      }
      phaseIds.add(p.id as string);
      if (p.total !== undefined) {
        if (typeof p.total !== 'number' || p.total < 0) {
          fail(`phase "${p.id}" has a non-numeric or negative "total"`);
        }
        phasesWithTotals++;
        phaseTotals.set(p.id as string, p.total as number);
      }
    }
    const usesActionTelemetry = phasesWithTotals > 0;
    if (usesActionTelemetry && phasesWithTotals !== (phases as unknown[]).length) {
      fail(
        'either every phase declares a "total" (action telemetry) or none do (event-counted replay)'
      );
    }

    const nodes = lab.nodes;
    if (!Array.isArray(nodes) || nodes.length === 0) {
      fail('"nodes" must be a non-empty array');
    }
    const nodeIds = new Set<string>();
    for (const n of nodes as Record<string, unknown>[]) {
      if (
        typeof n.id !== 'string' ||
        typeof n.label !== 'string' ||
        typeof n.group !== 'string'
      ) {
        fail('each node needs a string id, label, and group');
      }
      if (!stageIds.has(n.stageId as string)) {
        fail(`node "${n.id}" references unknown stageId "${n.stageId}"`);
      }
      nodeIds.add(n.id as string);
    }

    const edges = lab.edges;
    if (!Array.isArray(edges)) fail('"edges" must be an array');
    for (const e of edges as Record<string, unknown>[]) {
      if (!nodeIds.has(e.from as string) || !nodeIds.has(e.to as string)) {
        fail(`edge ${JSON.stringify(e)} references an unknown node`);
      }
    }

    const events = lab.events;
    if (!Array.isArray(events) || events.length === 0) {
      fail('"events" must be a non-empty array');
    }
    const phaseSums = new Map<string, number>();
    let prevTime = -Infinity;
    for (const [i, raw] of (events as Record<string, unknown>[]).entries()) {
      const label = `event ${i + 1}`;
      if (typeof raw.id !== 'string') fail(`${label} needs a string id`);
      if (typeof raw.title !== 'string') fail(`${label} needs a title`);
      if (typeof raw.blastRadius !== 'string') {
        fail(`${label} needs a blastRadius`);
      }
      if (!phaseIds.has(raw.phaseId as string)) {
        fail(`${label} references unknown phaseId "${raw.phaseId}"`);
      }
      if (!stageIds.has(raw.stageId as string)) {
        fail(`${label} references unknown stageId "${raw.stageId}"`);
      }
      if (usesActionTelemetry) {
        if (typeof raw.actions !== 'number' || raw.actions < 0) {
          fail(
            `${label} needs a non-negative numeric "actions" (this lab declares phase totals)`
          );
        }
      } else if (raw.actions !== undefined) {
        fail(
          `${label} sets "actions" but no phase declares a "total" — add totals to every phase or drop the per-event counts`
        );
      }
      const t = Date.parse(raw.t as string);
      if (Number.isNaN(t)) fail(`${label} has an invalid timestamp "${raw.t}"`);
      if (t < prevTime) fail(`${label} timestamp is out of ascending order`);
      prevTime = t;

      for (const nodeId of (raw.ignites as string[] | undefined) ?? []) {
        if (!nodeIds.has(nodeId)) {
          fail(`${label} ignites unknown node "${nodeId}"`);
        }
      }
      if (usesActionTelemetry) {
        phaseSums.set(
          raw.phaseId as string,
          (phaseSums.get(raw.phaseId as string) ?? 0) + (raw.actions as number)
        );
      }
    }

    // The action counters only stay honest if event sums match phase totals
    let phaseGrandTotal = 0;
    for (const [phaseId, total] of phaseTotals) {
      const sum = phaseSums.get(phaseId) ?? 0;
      if (sum !== total) {
        fail(
          `phase "${phaseId}" total is ${total} but its events sum to ${sum}`
        );
      }
      phaseGrandTotal += total;
    }

    // A display total, when given, must not undercount the classified actions
    if (lab.totalActions !== undefined) {
      if (!usesActionTelemetry) {
        fail(
          '"totalActions" requires phase totals — an event-counted replay derives its total from the timeline'
        );
      }
      const totalActions = lab.totalActions;
      if (typeof totalActions !== 'number' || totalActions < 0) {
        fail('"totalActions" must be a non-negative number');
      } else if (totalActions < phaseGrandTotal) {
        fail(
          `"totalActions" (${totalActions}) is less than the sum of phase totals (${phaseGrandTotal})`
        );
      }
    }

    // Optional "Break the Chain" controls
    if (lab.controls !== undefined) {
      if (!Array.isArray(lab.controls) || lab.controls.length === 0) {
        fail('"controls", when present, must be a non-empty array');
      }
      const seenControlIds = new Set<string>();
      for (const raw of lab.controls as Record<string, unknown>[]) {
        if (typeof raw.id !== 'string' || raw.id.length === 0) {
          fail('each control needs a string id');
        }
        if (seenControlIds.has(raw.id as string)) {
          fail(`duplicate control id "${raw.id}"`);
        }
        seenControlIds.add(raw.id as string);
        if (typeof raw.label !== 'string' || typeof raw.detail !== 'string') {
          fail(`control "${raw.id}" needs a label and detail`);
        }
        const hasCut =
          typeof raw.breaksAtNode === 'string' && raw.breaksAtNode.length > 0;
        const isDetection = raw.detection === true;
        if (!hasCut && !isDetection) {
          fail(
            `control "${raw.id}" must either set breaksAtNode or detection: true`
          );
        }
        if (hasCut && !nodeIds.has(raw.breaksAtNode as string)) {
          fail(
            `control "${raw.id}" breaksAtNode references unknown node "${raw.breaksAtNode}"`
          );
        }
      }
      if (lab.defenderBudget !== undefined) {
        if (
          typeof lab.defenderBudget !== 'number' ||
          lab.defenderBudget < 1 ||
          !Number.isInteger(lab.defenderBudget)
        ) {
          fail('"defenderBudget" must be a positive integer');
        }
      }
    }

  } else {

    // ---- Triage lab ----
    const artifacts = lab.artifacts;
    if (!Array.isArray(artifacts) || artifacts.length === 0) {
      fail('a triage lab needs a non-empty "artifacts" array');
    }
    if (typeof lab.brief !== 'string' || lab.brief.length === 0) {
      fail('a triage lab needs a "brief"');
    }
    const artifactIds = new Set<string>();
    for (const raw of artifacts as Record<string, unknown>[]) {
      for (const key of ['id', 'label', 'language', 'content']) {
        if (typeof raw[key] !== 'string' || (raw[key] as string).length === 0) {
          fail(
            `artifact ${JSON.stringify(raw.id ?? '?')} is missing "${key}"`
          );
        }
      }
      if (artifactIds.has(raw.id as string)) {
        fail(`duplicate artifact id "${raw.id}"`);
      }
      artifactIds.add(raw.id as string);
    }

    const questions = lab.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      fail('a triage lab needs a non-empty "questions" array');
    }
    const questionIds = new Set<string>();
    for (const [i, raw] of (questions as Record<string, unknown>[]).entries()) {
      const label = `question ${i + 1}`;
      if (typeof raw.id !== 'string' || raw.id.length === 0) {
        fail(`${label} needs a string id`);
      }
      if (questionIds.has(raw.id as string)) {
        fail(`duplicate question id "${raw.id}"`);
      }
      questionIds.add(raw.id as string);
      if (typeof raw.prompt !== 'string' || raw.prompt.length === 0) {
        fail(`${label} needs a "prompt"`);
      }
      if (raw.type !== 'single' && raw.type !== 'multi') {
        fail(`${label} "type" must be "single" or "multi"`);
      }
      if (
        !Array.isArray(raw.options) ||
        raw.options.length < 2 ||
        !(raw.options as unknown[]).every(
          (o) => typeof o === 'string' && o.length > 0
        )
      ) {
        fail(`${label} needs at least 2 non-empty string options`);
      }
      const correct = raw.correct;
      if (!Array.isArray(correct) || correct.length === 0) {
        fail(`${label} needs a non-empty "correct" array`);
      }
      const optionCount = (raw.options as unknown[]).length;
      for (const c of correct as unknown[]) {
        if (
          typeof c !== 'number' ||
          !Number.isInteger(c) ||
          c < 0 ||
          c >= optionCount
        ) {
          fail(`${label} has an out-of-range index in "correct"`);
        }
      }
      if (new Set(correct as number[]).size !== (correct as number[]).length) {
        fail(`${label} has duplicate indices in "correct"`);
      }
      // A "single" question with several right answers is an authoring mistake
      if (raw.type === 'single' && (correct as number[]).length !== 1) {
        fail(`${label} is type "single" but declares ${(correct as number[]).length} correct answers`);
      }
      if (typeof raw.explanation !== 'string' || raw.explanation.length === 0) {
        fail(`${label} needs an "explanation"`);
      }
      // Questions may point at the evidence they are asking about
      for (const aid of (raw.artifactIds as string[] | undefined) ?? []) {
        if (!artifactIds.has(aid)) {
          fail(`${label} references unknown artifact "${aid}"`);
        }
      }
    }

    if (lab.passingScore !== undefined) {
      if (
        typeof lab.passingScore !== 'number' ||
        lab.passingScore <= 0 ||
        lab.passingScore > 100
      ) {
        fail('"passingScore" must be a percentage between 1 and 100');
      }
    }
  }

  return lab as unknown as Lab;
}

export function extractLabs(): Lab[] {
  const labsDir = path.join(getContentDir(), 'labs');
  if (!fs.existsSync(labsDir)) return [];

  const files = fs
    .readdirSync(labsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(labsDir, file), 'utf-8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Invalid lab in labs/${file}: not valid JSON (${(err as Error).message})`
      );
    }
    return validateLab(parsed, `labs/${file}`, file.replace(/\.json$/, ''));
  });
}

// ---- Reference pages (content/reference-pages.json) ----

/**
 * Publish long-form markdown from content/ as site pages. The manifest is
 * authored (title, description, category) rather than scraped from prose, so
 * adding a page is a data change with no parsing guesswork.
 */
export function extractReferencePages(): ReferencePage[] {
  const manifestPath = path.join(getContentDir(), 'reference-pages.json');
  if (!fs.existsSync(manifestPath)) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (err) {
    throw new Error(
      `Invalid reference-pages.json: not valid JSON (${(err as Error).message})`
    );
  }

  const manifest = parsed as { pages?: unknown };
  if (!Array.isArray(manifest.pages)) {
    throw new Error('Invalid reference-pages.json: "pages" must be an array');
  }

  const seenSlugs = new Set<string>();
  const pages: ReferencePage[] = [];

  for (const raw of manifest.pages as Record<string, unknown>[]) {
    for (const key of ['slug', 'file', 'title', 'description', 'category']) {
      if (typeof raw[key] !== 'string' || (raw[key] as string).length === 0) {
        throw new Error(
          `Invalid reference-pages.json: entry ${JSON.stringify(raw.slug ?? raw.file ?? '?')} is missing "${key}"`
        );
      }
    }
    const slug = raw.slug as string;
    if (seenSlugs.has(slug)) {
      throw new Error(`Invalid reference-pages.json: duplicate slug "${slug}"`);
    }
    seenSlugs.add(slug);

    const filePath = path.join(getContentDir(), raw.file as string);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Invalid reference-pages.json: "${slug}" points at missing file "${raw.file}"`
      );
    }

    pages.push({
      slug,
      file: raw.file as string,
      title: raw.title as string,
      description: raw.description as string,
      category: raw.category as string,
      order: typeof raw.order === 'number' ? raw.order : 0,
      content: fs.readFileSync(filePath, 'utf-8'),
    });
  }

  return pages.sort(
    (a, b) => a.category.localeCompare(b.category) || a.order - b.order
  );
}

// Used by tests and validation scripts that need to mirror quiz question typing
export type { QuizQuestion };
