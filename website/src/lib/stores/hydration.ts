import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Prevents hydration mismatch when using persisted Zustand stores.
 *
 * During SSR, persisted stores return their default state since localStorage
 * is not available. Once the client hydrates, the persisted values load,
 * causing a mismatch. Use this hook to delay rendering persisted values
 * until after hydration.
 *
 * @returns true once the component has mounted on the client
 */
export function useHydration() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
