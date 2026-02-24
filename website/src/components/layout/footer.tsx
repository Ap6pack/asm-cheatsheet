import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-12">
      <div className="px-6 py-6 space-y-3">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm font-medium">ASM Cheatsheet</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <span>
              Press{" "}
              <kbd className="rounded border border-[var(--border-bright)] bg-[var(--background-elevated)] px-1.5 py-0.5 font-mono text-[10px]">
                ?
              </kbd>{" "}
              for keyboard shortcuts
            </span>
            <span className="hidden sm:inline">
              <kbd className="rounded border border-[var(--border-bright)] bg-[var(--background-elevated)] px-1.5 py-0.5 font-mono text-[10px]">
                Ctrl K
              </kbd>{" "}
              to search
            </span>
          </div>
        </div>
        <p className="text-center text-[10px] text-[var(--muted-foreground)] md:text-left">
          Only scan domains and IP addresses you own or have explicit written
          permission to test.
        </p>
      </div>
    </footer>
  );
}
