"use client";

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <Shield className="h-12 w-12 text-[var(--destructive)] mb-4 opacity-60" />
      <div className="font-mono text-sm text-[var(--muted-foreground)] mb-4">
        <span className="text-[var(--destructive)]">ERROR</span>{" "}
        {error.digest ?? "unexpected_failure"}
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
        An unexpected error occurred. Please try again or return to the
        homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Retry
        </Button>
        <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
      </div>
    </div>
  );
}
