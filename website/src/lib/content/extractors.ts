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
} from './types';

// Base content directory - try multiple locations to support local dev and Vercel
function getContentDir(): string {
  const candidates = [
    // From process.cwd() (works when cwd is website/ or repo root)
    path.resolve(process.cwd(), '../content'),
    path.resolve(process.cwd(), 'content'),
    // Relative to this file (local dev)
    path.resolve(__dirname, '../../../../content'),
    // Vercel: root directory set to website/, content is sibling
    path.resolve('/vercel/path0', '../content'),
    path.resolve('/vercel/path0/content'),
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

export function extractCommands(): Command[] {
  const content = readContentFile('resources/command_cheatsheet.md');
  const lines = content.split('\n');
  const commands: Command[] = [];

  let currentCategory = '';
  let currentCategoryEmoji = '';
  let currentTool = '';
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
      currentTool = '';
      descriptionLines = [];
      continue;
    }

    // Detect tool: ### Amass
    const toolMatch = line.match(/^###\s+(.+)$/);
    if (toolMatch && currentCategory) {
      currentTool = toolMatch[1].trim();
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
      if (currentCategory && currentTool) {
        commandIndex++;
        commands.push({
          id: `cmd-${commandIndex}`,
          tool: currentTool,
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
    } else if (currentTool && !line.startsWith('#')) {
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

// ---- extractTools() ----

export function extractTools(): Tool[] {
  const tools: Tool[] = [];

  const files = [
    { path: 'tools/recon_tools.md', sourceFile: 'recon_tools.md' },
    { path: 'tools/cloud_enum_tools.md', sourceFile: 'cloud_enum_tools.md' },
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
          currentCategory = toolName;
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
            if (
              tl.match(
                /^\*\*(?:Basic Usage|Usage Examples?|Basic Searches|Advanced (?:Queries|Techniques|Options|Module Usage)|Programmatic Usage|Basic Workflow|Common Modules|Session Management|Custom Rules):\*\*/
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
