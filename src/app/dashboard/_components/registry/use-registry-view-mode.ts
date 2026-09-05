"use client";

import { useCallback, useEffect, useState } from "react";

export type RegistryViewMode = "grid" | "list";

export function useRegistryViewMode(storageKey: string) {
  const [viewMode, setViewMode] = useState<RegistryViewMode>("grid");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "grid" || stored === "list") {
        setViewMode(stored);
      }
    } catch {
      // Storage can be unavailable in private browsing contexts.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const updateViewMode = useCallback(
    (mode: RegistryViewMode) => {
      setViewMode(mode);
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // The preference remains valid for the current session.
      }
    },
    [storageKey],
  );

  const toggleViewMode = useCallback(() => {
    updateViewMode(viewMode === "grid" ? "list" : "grid");
  }, [updateViewMode, viewMode]);

  return { viewMode, hydrated, updateViewMode, toggleViewMode };
}
