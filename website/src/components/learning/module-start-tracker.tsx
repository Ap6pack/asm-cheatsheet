"use client";

import { useEffect } from "react";
import { useProgressStore, useHydration } from "@/lib/stores";

/**
 * Marks a module as started when its page is viewed. Renders nothing.
 * Without this, the dashboard's "modules started" stat never moves.
 */
export function ModuleStartTracker({ moduleId }: { moduleId: string }) {
  const hydrated = useHydration();
  const startModule = useProgressStore((s) => s.startModule);

  useEffect(() => {
    if (hydrated) startModule(moduleId);
  }, [hydrated, moduleId, startModule]);

  return null;
}
