"use client";

import Link from "next/link";
import { Menu, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
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
          <Shield className="h-5 w-5 text-[var(--primary)]" />
          <span className="font-bold">ASM Cheatsheet</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <SearchTrigger />
          <ThemeToggle />
          <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 font-mono text-[10px] font-medium text-[var(--muted-foreground)]">
            ? shortcuts
          </kbd>
        </div>
      </div>

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
        className="hidden h-8 w-48 justify-start text-sm text-[var(--muted-foreground)] sm:flex"
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
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 font-mono text-[10px] font-medium text-[var(--muted-foreground)]">
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
