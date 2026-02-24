import Link from "next/link";
import { getAllScenarios } from "@/lib/content/loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers } from "lucide-react";

export const metadata = {
  title: "Scenarios",
  description: "Professional-grade ASM command cards for real-world situations.",
};

export default async function ScenariosPage() {
  const scenarios = await getAllScenarios();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Scenarios</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {scenarios.length} professional-grade scenario cards for real-world
          situations. Each scenario includes phased command sequences.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {scenarios.map((sc) => (
          <Link key={sc.id} href={`/scenarios/${sc.slug}`}>
            <Card className="h-full transition-colors hover:border-[var(--primary)]">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  Scenario {sc.id}
                </Badge>
                <CardTitle className="text-lg mt-2">{sc.title}</CardTitle>
                {sc.subtitle && (
                  <CardDescription>{sc.subtitle}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                    <Layers className="h-3.5 w-3.5" />
                    {sc.phases.length} phases
                  </span>
                  <span className="inline-flex items-center text-sm text-[var(--primary)]">
                    View Scenario <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
