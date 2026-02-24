import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WorkflowsLoading() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-8 w-40 bg-[var(--muted)] rounded animate-pulse" />
        <div className="mt-2 h-5 w-72 bg-[var(--muted)] rounded animate-pulse" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-48 bg-[var(--muted)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--muted)] rounded animate-pulse mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
