import { getAllCaseStudies } from "@/lib/content/loader";
import { CaseStudyExplorer } from "@/components/case-studies/case-study-explorer";

export const metadata = {
  title: "Case Studies",
  description:
    "Real-world ASM implementations with outcomes and lessons learned.",
};

export default async function CaseStudiesPage() {
  const caseStudies = await getAllCaseStudies();

  const data = caseStudies.map((cs) => ({
    id: cs.id,
    slug: cs.slug,
    title: cs.title,
    industry: cs.industry,
    challenge: cs.challenge,
    outcome: cs.outcome,
    teamSize: cs.teamSize,
    timeline: cs.timeline,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Case Studies</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {caseStudies.length} real-world ASM implementations demonstrating
          practical applications and lessons learned.
        </p>
      </div>
      <CaseStudyExplorer caseStudies={data} />
    </div>
  );
}
