"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-56"
          )}
        >
          <div className="container mx-auto px-4 py-6 lg:px-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
