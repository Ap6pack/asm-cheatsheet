/**
 * Validate that the content/ directory parses into the structures the site
 * expects. Run in CI so content contributions fail loudly with a useful
 * message instead of silently dropping modules, quizzes, or search entries.
 * Run with: npx tsx scripts/validate-content.ts
 */
import {
  getAllModules,
  getAllCommands,
  getAllWorkflows,
  getAllScenarios,
  getAllCaseStudies,
  getAllTools,
  getAllQuizzes,
  getAllGuides,
  getAllLabs,
  getAllReferencePages,
  getSearchEntries,
} from '../src/lib/content/loader';

let errors = 0;

function check(condition: boolean, message: string) {
  if (condition) return;
  errors++;
  console.error(`✗ ${message}`);
}

function ok(message: string) {
  console.log(`✓ ${message}`);
}

async function main() {
  const modules = await getAllModules();
  check(modules.length > 0, 'No learning modules extracted from learning_guide.md');
  for (const mod of modules) {
    check(
      mod.objectives.length > 0,
      `Module ${mod.id} (${mod.title}) has no learning objectives`
    );
    check(
      mod.successCriteria.length > 0,
      `Module ${mod.id} (${mod.title}) has no success criteria`
    );
  }
  ok(`${modules.length} learning modules extracted`);

  // Quizzes are schema-validated inside extractQuizzes(); here we check
  // cross-references between quizzes and modules.
  const quizzes = await getAllQuizzes();
  const moduleIds = new Set(modules.map((m) => m.id));
  const quizModuleIds = new Set(quizzes.map((q) => q.moduleId));
  for (const quiz of quizzes) {
    check(
      moduleIds.has(quiz.moduleId),
      `Quiz for module ${quiz.moduleId} has no matching learning module`
    );
  }
  const duplicates = quizzes.length - quizModuleIds.size;
  check(duplicates === 0, `${duplicates} module(s) have more than one quiz file`);
  for (const mod of modules) {
    if (!quizModuleIds.has(mod.id)) {
      console.warn(`⚠ Module ${mod.id} (${mod.title}) has no quiz yet`);
    }
  }
  ok(`${quizzes.length} quizzes validated`);

  const commands = await getAllCommands();
  check(commands.length > 0, 'No commands extracted from command_cheatsheet.md');
  ok(`${commands.length} commands extracted`);

  const workflows = await getAllWorkflows();
  check(workflows.length > 0, 'No workflows extracted from practical_workflows.md');
  for (const wf of workflows) {
    check(wf.steps.length > 0, `Workflow "${wf.title}" has no steps`);
  }
  ok(`${workflows.length} workflows extracted`);

  const scenarios = await getAllScenarios();
  check(scenarios.length > 0, 'No scenarios extracted from scenario-cards.md');
  for (const sc of scenarios) {
    check(sc.phases.length > 0, `Scenario "${sc.title}" has no phases`);
  }
  ok(`${scenarios.length} scenarios extracted`);

  const caseStudies = await getAllCaseStudies();
  check(caseStudies.length > 0, 'No case studies extracted from case_studies.md');
  ok(`${caseStudies.length} case studies extracted`);

  const tools = await getAllTools();
  check(tools.length > 0, 'No tools extracted from tools/*.md');
  ok(`${tools.length} tools extracted`);

  const guides = await getAllGuides();
  check(guides.length > 0, 'No guides found in content/guides/');
  ok(`${guides.length} guides extracted`);

  // Labs are schema-validated (including per-phase action sums) inside
  // extractLabs(); here we assert cross-references resolve at the set level.
  const labs = await getAllLabs();
  check(labs.length > 0, 'No labs found in content/labs/');
  for (const lab of labs) {
    check(
      lab.events.length > 0,
      `Lab "${lab.slug}" has no timeline events`
    );
    check(
      lab.nodes.length > 0,
      `Lab "${lab.slug}" has no attack-chain nodes`
    );
    const ignited = new Set(lab.events.flatMap((e) => e.ignites ?? []));
    for (const node of lab.nodes) {
      if (!ignited.has(node.id)) {
        console.warn(
          `⚠ Lab "${lab.slug}" node "${node.id}" is never ignited by an event`
        );
      }
    }
  }
  ok(`${labs.length} labs validated`);

  // Reference pages are manifest-driven; extractReferencePages() throws on a
  // missing file or duplicate slug, so reaching here means the manifest is sound.
  const referencePages = await getAllReferencePages();
  check(referencePages.length > 0, 'No reference pages published from content/reference-pages.json');
  for (const page of referencePages) {
    check(page.content.trim().length > 0, `Reference page "${page.slug}" resolves to an empty file`);
  }
  ok(`${referencePages.length} reference pages published`);

  const searchEntries = await getSearchEntries();
  check(searchEntries.length > 0, 'Search index is empty');
  const seenIds = new Set<string>();
  for (const entry of searchEntries) {
    check(!seenIds.has(entry.id), `Duplicate search entry id: ${entry.id}`);
    seenIds.add(entry.id);
    check(entry.url.startsWith('/'), `Search entry ${entry.id} has a non-relative URL: ${entry.url}`);
  }
  ok(`${searchEntries.length} search entries generated`);

  if (errors > 0) {
    console.error(`\nContent validation failed with ${errors} error(s).`);
    process.exit(1);
  }
  console.log('\nAll content validation checks passed.');
}

main().catch((err) => {
  console.error('Content validation crashed:', err.message);
  process.exit(1);
});
