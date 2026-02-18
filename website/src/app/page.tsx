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
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllModules, getAllWorkflows, getAllScenarios, getAllCaseStudies, getAllTools, getAllCommands } from "@/lib/content/loader";

const sections = [
  {
    title: "Learning Path",
    description: "12-module structured curriculum from beginner to advanced",
    href: "/learn",
    icon: GraduationCap,
    color: "text-green-500",
  },
  {
    title: "Command Reference",
    description: "Searchable, filterable command cheatsheet for every ASM tool",
    href: "/commands",
    icon: Terminal,
    color: "text-blue-500",
  },
  {
    title: "Tools",
    description: "Detailed documentation for reconnaissance and cloud security tools",
    href: "/tools",
    icon: Wrench,
    color: "text-purple-500",
  },
  {
    title: "Workflows",
    description: "Step-by-step procedures for common ASM scenarios",
    href: "/workflows",
    icon: GitBranch,
    color: "text-yellow-500",
  },
  {
    title: "Scenarios",
    description: "Professional-grade command cards for real-world situations",
    href: "/scenarios",
    icon: Shield,
    color: "text-red-500",
  },
  {
    title: "Case Studies",
    description: "Real-world ASM implementations with outcomes and lessons learned",
    href: "/case-studies",
    icon: FileText,
    color: "text-orange-500",
  },
];

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

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          ASM Cheatsheet
        </h1>
        <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
          Interactive Attack Surface Management reference. Tools, commands,
          workflows, and a structured learning path — all in one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Badge variant="secondary">{modules.length} Modules</Badge>
          <Badge variant="secondary">{commands.length} Commands</Badge>
          <Badge variant="secondary">{tools.length} Tools</Badge>
          <Badge variant="secondary">{workflows.length} Workflows</Badge>
          <Badge variant="secondary">{scenarios.length} Scenarios</Badge>
          <Badge variant="secondary">{caseStudies.length} Case Studies</Badge>
        </div>
      </section>

      {/* Section Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:border-[hsl(var(--primary))]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${section.color}`} />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm text-[hsl(var(--primary))]">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Quick Start */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[hsl(var(--muted-foreground))]">
              New to ASM? Start with{" "}
              <Link
                href="/learn"
                className="text-[hsl(var(--primary))] underline"
              >
                Module 1: ASM Fundamentals
              </Link>{" "}
              or jump straight to the{" "}
              <Link
                href="/commands"
                className="text-[hsl(var(--primary))] underline"
              >
                Command Reference
              </Link>{" "}
              if you already know the basics.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
