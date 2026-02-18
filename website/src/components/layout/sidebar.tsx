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
  Layout,
  FileText,
  GraduationCap,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/commands", label: "Commands", icon: Terminal },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/scenarios", label: "Scenarios", icon: Shield },
  { href: "/case-studies", label: "Case Studies", icon: FileText },
  { href: "/guides", label: "Guides", icon: GraduationCap },
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-all duration-300 lg:top-14 lg:z-30",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop: collapsed or expanded
          collapsed ? "lg:w-16" : "lg:w-56",
          "w-64"
        )}
      >
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="font-bold">ASM Cheatsheet</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
                    collapsed && "lg:justify-center lg:px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span
                    className={cn(
                      collapsed && "lg:hidden"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Desktop collapse toggle */}
        {onToggleCollapse && (
          <div className="hidden border-t border-[hsl(var(--border))] p-2 lg:block">
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
