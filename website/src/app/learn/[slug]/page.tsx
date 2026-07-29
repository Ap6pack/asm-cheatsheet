import { notFound } from "next/navigation";
import { getAllModules, getQuizForModule } from "@/lib/content/loader";
import { DifficultyBadge } from "@/components/content/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Target, CheckCircle, ExternalLink } from "lucide-react";
import { SuccessCriteriaList } from "@/components/learning/success-criteria-list";
import { ModuleQuiz } from "@/components/learning/module-quiz";
import { ModuleNav } from "@/components/learning/module-nav";
import { ModuleStartTracker } from "@/components/learning/module-start-tracker";
import { EditOnGitHub } from "@/components/content/edit-on-github";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

const GITHUB_CONTENT_BASE =
  "https://github.com/Ap6pack/asm-cheatsheet/blob/main/content";

/**
 * Map markdown resource paths to app routes or GitHub URLs.
 */
function resolveResourceUrl(url: string): { href: string; external: boolean } {
  // Module resources are authored as relative paths from content/resources/.
  // Keep learners on the site wherever a published page exists for the target.
  const routeMap: Record<string, string> = {
    "command_cheatsheet.md": "/commands",
    "../tools/recon_tools.md": "/tools",
    "../tools/cloud_enum_tools.md": "/tools",
    "../tools/screenshots.md": "/reference/screenshot-tools",
    "security_considerations.md": "/reference/security-considerations",
    "modern_tools_update.md": "/reference/modern-tools",
    "reading_list.md": "/reference/reading-list",
    "../scripts/README.md": "/reference/automation-scripts",
    "../examples/change_tracking.md": "/reference/change-tracking",
    "../examples/github_leak_queries.md": "/reference/github-leak-queries",
    "../quick-reference/README.md": "/reference/quick-reference",
    "../quick-reference/advanced-techniques.md": "/reference/advanced-techniques",
    "../quick-reference/docker-quickstart.md": "/reference/docker-quickstart",
    "../quick-reference/scenario-cards.md": "/scenarios",
    "../getting-started.md": "/reference/getting-started",
    "../guides/building_your_own_asm_stack.md": "/guides/building_your_own_asm_stack",
    "../guides/integrating_threat_intel.md": "/guides/integrating_threat_intel",
    "../examples/practical_workflows.md": "/workflows",
    "../examples/case_studies.md": "/case-studies",
    "../README.md": "/",
    "README.md": "/reference/quick-reference",
  };

  // Check for exact match (without hash)
  const basePath = url.split("#")[0];
  if (routeMap[basePath]) {
    return { href: routeMap[basePath], external: false };
  }

  // Anything still unmapped falls back to the source on GitHub
  if (url.endsWith(".md") || url.includes(".md#")) {
    return {
      href: `${GITHUB_CONTENT_BASE}/resources/${url}`.replace(
        "/resources/../",
        "/"
      ),
      external: true,
    };
  }

  // External URLs pass through
  if (url.startsWith("http")) {
    return { href: url, external: true };
  }

  return { href: url, external: false };
}

export async function generateStaticParams() {
  const modules = await getAllModules();
  return modules.map((m) => ({ slug: `module-${m.id}` }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modules = await getAllModules();
  const mod = modules.find((m) => `module-${m.id}` === slug);
  if (!mod) return {};
  const objective = mod.objectives[0] ?? `Learn ${mod.title}.`;
  return {
    title: `Module ${mod.id}: ${mod.title}`,
    description:
      `${objective} ${mod.timeEstimate.display} · ${mod.track}.`.slice(0, 160),
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modules = await getAllModules();
  const mod = modules.find((m) => `module-${m.id}` === slug);

  if (!mod) notFound();

  const quiz = await getQuizForModule(mod.id);

  // Modules form a sequential curriculum; link to neighbors by id
  const ordered = [...modules].sort((a, b) => a.id - b.id);
  const position = ordered.findIndex((m) => m.id === mod.id);
  const prevModule = position > 0 ? ordered[position - 1] : undefined;
  const nextModule =
    position < ordered.length - 1 ? ordered[position + 1] : undefined;

  return (
    <div className="max-w-4xl space-y-8">
      <ModuleStartTracker moduleId={`module-${mod.id}`} />
      <Breadcrumbs title={mod.title} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline">Module {mod.id}</Badge>
          <DifficultyBadge difficulty={mod.difficulty} />
          <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <Clock className="h-3.5 w-3.5" />
            {mod.timeEstimate.display}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{mod.title}</h1>
        {mod.prerequisites.length > 0 && (
          <p className="mt-2 text-[var(--muted-foreground)]">
            <strong>Prerequisites:</strong> {mod.prerequisites.join(", ")}
          </p>
        )}
      </div>

      <Separator />

      {/* Learning Objectives */}
      {mod.objectives.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <Target className="h-5 w-5" />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {mod.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resources */}
      {mod.resources.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5" />
            Resources
          </h2>
          <ul className="space-y-2">
            {mod.resources.map((res, i) => {
              const resolved = resolveResourceUrl(res.url);
              return (
                <li key={i}>
                  <a
                    href={resolved.href}
                    {...(resolved.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline"
                  >
                    {res.title}
                    {resolved.external && (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Activities */}
      {mod.activities.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Hands-On Activities</h2>
          <ol className="space-y-2 list-decimal list-inside">
            {mod.activities.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Success Criteria - Interactive */}
      {mod.successCriteria.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5" />
            Success Criteria
          </h2>
          <SuccessCriteriaList
            moduleId={`module-${mod.id}`}
            criteria={mod.successCriteria}
          />
        </section>
      )}

      {/* Knowledge Check Quiz */}
      {quiz && (
        <section>
          <ModuleQuiz moduleId={`module-${mod.id}`} quiz={quiz} />
        </section>
      )}

      <Separator />

      <ModuleNav
        prev={
          prevModule
            ? { id: prevModule.id, title: prevModule.title }
            : undefined
        }
        next={
          nextModule
            ? { id: nextModule.id, title: nextModule.title }
            : undefined
        }
      />

      <footer className="flex justify-end">
        <EditOnGitHub contentPath="resources/learning_guide.md" />
      </footer>
    </div>
  );
}
