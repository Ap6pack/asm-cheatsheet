"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  learn: "Learning Path",
  commands: "Commands",
  tools: "Tools",
  workflows: "Workflows",
  scenarios: "Scenarios",
  "case-studies": "Case Studies",
  guides: "Guides",
  compare: "Compare",
};

function formatSlug(slug: string): string {
  return slug
    .replace(/^module-/, "Module ")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface BreadcrumbsProps {
  /** Override the last segment label (e.g., the actual page title) */
  title?: string;
}

export function Breadcrumbs({ title }: BreadcrumbsProps) {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const label =
      isLast && title ? title : routeLabels[seg] || formatSlug(seg);
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-[var(--foreground)] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {crumb.isLast ? (
              <span className="text-[var(--foreground)] font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-[var(--foreground)] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
