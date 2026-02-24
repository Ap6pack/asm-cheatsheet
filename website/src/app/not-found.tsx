import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Terminal, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-6">
        <Shield className="mx-auto h-12 w-12 text-[var(--muted-foreground)] opacity-30" />
        <div className="mt-4 font-mono text-sm text-[var(--muted-foreground)]">
          <span className="text-[var(--primary)]">$</span> curl -s target/page
        </div>
        <div className="font-mono text-sm text-[var(--destructive)]">
          HTTP 404 — target not found
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
        This page doesn&apos;t exist in the attack surface. Try one of these
        instead:
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/commands">
          <Button variant="outline">
            <Terminal className="mr-2 h-4 w-4" />
            Commands
          </Button>
        </Link>
        <Link href="/learn">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Learn
          </Button>
        </Link>
      </div>
    </div>
  );
}
