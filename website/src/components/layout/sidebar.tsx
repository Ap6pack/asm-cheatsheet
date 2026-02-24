"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Terminal,
  Wrench,
  GitBranch,
  Shield,
  Home,
  FileText,
  GraduationCap,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/", label: "Home", icon: Home }],
  },
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "Learning Path", icon: BookOpen },
      { href: "/guides", label: "Guides", icon: GraduationCap },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/commands", label: "Commands", icon: Terminal },
      { href: "/tools", label: "Tools", icon: Wrench },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/workflows", label: "Workflows", icon: GitBranch },
      { href: "/scenarios", label: "Scenarios", icon: Shield },
      { href: "/case-studies", label: "Case Studies", icon: FileText },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--background)] transition-all duration-300 lg:top-14 lg:z-30",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-56",
          "w-64"
        )}
      >
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-bold">ASM Cheatsheet</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-0.5 px-2">
            {navGroups.map((group) => (
              <div key={group.label || "home"} className={group.label ? "mt-4 first:mt-0" : ""}>
                {group.label && (
                  <span
                    className={cn(
                      "px-3 mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]",
                      collapsed && "lg:hidden"
                    )}
                  >
                    {group.label}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)] hover:text-[var(--foreground-accent)]",
                        collapsed && "lg:justify-center lg:px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={cn(collapsed && "lg:hidden")}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Desktop collapse toggle */}
        {onToggleCollapse && (
          <div className="hidden border-t border-[var(--border)] p-2 lg:block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
