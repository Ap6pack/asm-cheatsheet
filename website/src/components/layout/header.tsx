"use client";

import Link from "next/link";
import { Menu, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";

const navLinks = [
  { href: "/learn", label: "Learn" },
  { href: "/commands", label: "Commands" },
  { href: "/tools", label: "Tools" },
  { href: "/workflows", label: "Workflows" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/guides", label: "Guides" },
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <span className="font-bold">ASM Cheatsheet</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden flex-1 items-center space-x-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          <SearchTrigger />
          <ThemeToggle />
        </div>
      </div>

      {/* Search Dialog - rendered here, opens on Cmd+K */}
      <SearchDialog />
    </header>
  );
}

function SearchTrigger() {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 w-48 justify-start text-sm text-[hsl(var(--muted-foreground))] sm:flex"
        aria-label="Search"
        onClick={() => {
          // Dispatch Cmd+K to open search dialog
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="Search"
        onClick={() => {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
}
