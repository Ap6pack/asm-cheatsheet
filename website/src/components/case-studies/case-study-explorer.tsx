"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Users } from "lucide-react";

interface CaseStudyData {
  id: number;
  slug: string;
  title: string;
  industry: string;
  challenge: string;
  outcome: string;
  teamSize: string;
  timeline: string;
}

interface CaseStudyExplorerProps {
  caseStudies: CaseStudyData[];
}

export function CaseStudyExplorer({ caseStudies }: CaseStudyExplorerProps) {
  const [activeIndustry, setActiveIndustry] = React.useState("all");

  const industries = React.useMemo(() => {
    const set = new Set<string>();
    for (const cs of caseStudies) {
      if (cs.industry) {
        set.add(cs.industry.split("(")[0].trim());
      }
    }
    return Array.from(set).sort();
  }, [caseStudies]);

  const filtered = React.useMemo(() => {
    if (activeIndustry === "all") return caseStudies;
    return caseStudies.filter(
      (cs) => cs.industry.split("(")[0].trim() === activeIndustry
    );
  }, [caseStudies, activeIndustry]);

  return (
    <div className="space-y-6">
      {/* Industry filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveIndustry("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeIndustry === "all"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          All ({caseStudies.length})
        </button>
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() =>
              setActiveIndustry(activeIndustry === ind ? "all" : ind)
            }
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeIndustry === ind
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {filtered.map((cs) => (
          <Link key={cs.id} href={`/case-studies/${cs.slug}`}>
            <Card className="h-full transition-colors hover:border-[var(--primary)]">
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
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)] mb-3">
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
                  <p className="text-sm font-medium text-[var(--primary)]">
                    {cs.outcome}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            No case studies match this filter.
          </p>
          <button
            onClick={() => setActiveIndustry("all")}
            className="mt-2 text-sm text-[var(--primary)] hover:underline"
          >
            Show all
          </button>
        </div>
      )}
    </div>
  );
}
