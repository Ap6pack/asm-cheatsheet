import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            ASM Cheatsheet
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          <span>Built with Next.js, Tailwind CSS &amp; shadcn/ui</span>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-[hsl(var(--foreground))]"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
