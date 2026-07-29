import Link from "next/link";
import {
  Terminal,
  Wrench,
  GitBranch,
  Shield,
  FileText,
  GraduationCap,
  FlaskConical,
  ArrowRight,
  Target,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAllModules,
  getAllWorkflows,
  getAllScenarios,
  getAllCaseStudies,
  getAllTools,
  getAllCommands,
  getAllLabs,
} from "@/lib/content/loader";
import { ConditionalProgress } from "@/components/dashboard/conditional-progress";

export const metadata = {
  // Root layout supplies the default title; setting it here would double-apply
  // the "%s | ASM Cheatsheet" template on the homepage.
  description:
    "Interactive Attack Surface Management reference: 26 documented tools, a 12-module learning path with knowledge checks, real-world workflows, and interactive incident-replay labs.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [modules, workflows, scenarios, caseStudies, tools, commands, labs] =
    await Promise.all([
      getAllModules(),
      getAllWorkflows(),
      getAllScenarios(),
      getAllCaseStudies(),
      getAllTools(),
      getAllCommands(),
      getAllLabs(),
    ]);

  const stats = [
    { value: modules.length, label: "Modules" },
    { value: commands.length, label: "Commands" },
    { value: tools.length, label: "Tools" },
    { value: workflows.length, label: "Workflows" },
    { value: scenarios.length, label: "Scenarios" },
    { value: caseStudies.length, label: "Case Studies" },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-[var(--primary)]" />
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--primary)]">
            Attack Surface Management
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ASM Cheatsheet
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl">
          Interactive reference for tools, commands, workflows, and a structured
          learning path — everything you need for attack surface management in
          one place.
        </p>

        {/* KPI Stat Bar */}
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] px-3 py-3 text-center"
            >
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {stat.value}
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Start Here */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-[var(--primary)]" />
          Start Here
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/learn/module-1">
            <Card className="h-full border-l-4 border-l-[var(--beginner)] transition-colors hover:border-[var(--primary)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-[var(--beginner)]" />
                  <h3 className="font-semibold">New to ASM?</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Start with Module 1 and build your skills through a structured
                  12-module curriculum.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[var(--primary)]">
                  Begin Learning <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/commands">
            <Card className="h-full border-l-4 border-l-[var(--primary)] transition-colors hover:border-[var(--primary)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="h-5 w-5 text-[var(--primary)]" />
                  <h3 className="font-semibold">Need a Command?</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Searchable, filterable reference with {commands.length}+
                  commands across all major ASM tools.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[var(--primary)]">
                  Browse Commands <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/scenarios">
            <Card className="h-full border-l-4 border-l-[var(--advanced)] transition-colors hover:border-[var(--primary)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[var(--advanced)]" />
                  <h3 className="font-semibold">Real-World Practice</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Professional scenarios for incident response, compliance
                  audits, and bug bounties.
                </p>
                <span className="mt-3 inline-flex items-center text-sm text-[var(--primary)]">
                  View Scenarios <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured: Interactive Labs */}
      <section>
        <Link href="/labs">
          <Card className="group overflow-hidden border-[var(--primary)]/40 transition-colors hover:border-[var(--primary)]">
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                  <FlaskConical className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Labs — Interactive Incident Replays
                    </h3>
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                      New
                    </span>
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-[var(--muted-foreground)]">
                    Press play and watch an intrusion unfold at machine speed —
                    the attack chain lights up one trust boundary at a time, with
                    the commands and the defensive lesson at every step.{" "}
                    {labs.length} {labs.length === 1 ? "lab" : "labs"} available.
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity group-hover:opacity-90 sm:self-center">
                <PlayCircle className="h-4 w-4" />
                Open Labs
              </span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <Separator />

      {/* Section Cards — Hierarchy */}
      <section>
        {/* Primary row */}
        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          <Link href="/learn">
            <Card className="h-full group transition-colors hover:border-[var(--primary)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Learning Path</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {modules.length} modules
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Structured curriculum from beginner to advanced — fundamentals,
                  recon, cloud security, and more.
                </p>
                <span className="mt-4 inline-flex items-center text-sm text-[var(--primary)] group-hover:underline">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/commands">
            <Card className="h-full group transition-colors hover:border-[var(--primary)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Terminal className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Command Reference</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {commands.length} commands
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Searchable cheatsheet for every ASM tool — copy-paste ready
                  with syntax highlighting.
                </p>
                <span className="mt-4 inline-flex items-center text-sm text-[var(--primary)] group-hover:underline">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Tools",
              count: tools.length,
              desc: "Recon & cloud security tool docs",
              href: "/tools",
              icon: Wrench,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              title: "Workflows",
              count: workflows.length,
              desc: "Step-by-step ASM procedures",
              href: "/workflows",
              icon: GitBranch,
              color: "text-yellow-500",
              bg: "bg-yellow-500/10",
            },
            {
              title: "Scenarios",
              count: scenarios.length,
              desc: "Real-world command cards",
              href: "/scenarios",
              icon: Shield,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
            {
              title: "Case Studies",
              count: caseStudies.length,
              desc: "ASM implementations & outcomes",
              href: "/case-studies",
              icon: FileText,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className="h-full group transition-colors hover:border-[var(--primary)]">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-md ${section.bg}`}
                      >
                        <Icon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          {section.count} items
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {section.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Conditional Progress + Bookmarks */}
      <ConditionalProgress
        totalModules={modules.length}
        totalWorkflows={workflows.length}
        totalScenarios={scenarios.length}
      />
    </div>
  );
}
