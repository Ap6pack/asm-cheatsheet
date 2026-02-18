/**
 * Registers the service worker for PWA support.
 * Should only be called in the browser environment.
 */
export function registerServiceWorker(): void {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        if (process.env.NODE_ENV === "development") {
          console.log("SW registered:", registration.scope);
        }
      },
      (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("SW registration failed:", error);
        }
      }
    );
  });
}
