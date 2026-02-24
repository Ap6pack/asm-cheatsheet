"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["?"], description: "Open this help" },
  { keys: ["\u2318", "K"], description: "Search" },
  { keys: ["g", "h"], description: "Go to Home" },
  { keys: ["g", "l"], description: "Go to Learning Path" },
  { keys: ["g", "c"], description: "Go to Commands" },
  { keys: ["g", "t"], description: "Go to Tools" },
  { keys: ["g", "w"], description: "Go to Workflows" },
  { keys: ["g", "s"], description: "Go to Scenarios" },
];

const navMap: Record<string, string> = {
  h: "/",
  l: "/learn",
  c: "/commands",
  t: "/tools",
  w: "/workflows",
  s: "/scenarios",
};

export function KeyboardShortcuts() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pendingRef = React.useRef<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Two-key navigation: g then letter
      if (pendingRef.current === "g") {
        pendingRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const dest = navMap[e.key];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (e.key === "g") {
        pendingRef.current = "g";
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          pendingRef.current = null;
        }, 800);
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between py-2 px-1"
            >
              <span className="text-sm text-[var(--muted-foreground)]">
                {s.description}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        then
                      </span>
                    )}
                    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 font-mono text-xs font-medium text-[var(--muted-foreground)]">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
