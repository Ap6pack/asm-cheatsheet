import Link from "next/link";
import { getAllCaseStudies } from "@/lib/content/loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building, Calendar, Users } from "lucide-react";

export const metadata = {
  title: "Case Studies",
  description: "Real-world ASM implementations with outcomes and lessons learned.",
};

export default async function CaseStudiesPage() {
  const caseStudies = await getAllCaseStudies();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Case Studies</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          {caseStudies.length} real-world ASM implementations demonstrating
          practical applications and lessons learned.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {caseStudies.map((cs) => (
          <Link key={cs.id} href={`/case-studies/${cs.slug}`}>
            <Card className="h-full transition-colors hover:border-[hsl(var(--primary))]">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  Case Study {cs.id}
                </Badge>
                <CardTitle className="text-lg mt-2">{cs.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {cs.challenge || cs.industry}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-[hsl(var(--muted-foreground))] mb-3">
                  {cs.industry && (
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      {cs.industry.split("(")[0].trim()}
                    </span>
                  )}
                  {cs.timeline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {cs.timeline}
                    </span>
                  )}
                  {cs.teamSize && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {cs.teamSize}
                    </span>
                  )}
                </div>
                {cs.outcome && (
                  <p className="text-sm font-medium text-[hsl(var(--primary))] mb-2">
                    {cs.outcome}
                  </p>
                )}
                <span className="inline-flex items-center text-sm text-[hsl(var(--primary))]">
                  Read More <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
