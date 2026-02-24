import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Wrench,
  GitBranch,
  Shield,
  FileText,
  GraduationCap,
  ArrowRight,
  Target,
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
} from "@/lib/content/loader";
import { ConditionalProgress } from "@/components/dashboard/conditional-progress";

export default async function Home() {
  const [modules, workflows, scenarios, caseStudies, tools, commands] =
    await Promise.all([
      getAllModules(),
      getAllWorkflows(),
      getAllScenarios(),
      getAllCaseStudies(),
      getAllTools(),
      getAllCommands(),
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
