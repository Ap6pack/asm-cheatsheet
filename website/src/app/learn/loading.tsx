import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LearnLoading() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-8 w-48 bg-[var(--muted)] rounded animate-pulse" />
        <div className="mt-2 h-5 w-96 bg-[var(--muted)] rounded animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-[var(--muted)] rounded animate-pulse" />
                <div className="h-5 w-16 bg-[var(--muted)] rounded animate-pulse" />
              </div>
              <div className="h-6 w-48 bg-[var(--muted)] rounded animate-pulse mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--muted)] rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
