"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/utils/sw-register";

/**
 * Client component that registers the service worker on mount.
 * Renders nothing to the DOM.
 */
export function ServiceWorkerProvider() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
