"use client";

import { useCallback, useEffect, useState } from "react";
import type { EntryViewMode } from "../types/entry-dashboard-types";

const VALID_MODES = new Set<EntryViewMode>(["grid", "table", "cards"]);

/**
 * Variante local do `useRegistryViewMode` para os tres modos de visualizacao da
 * central de entradas (grade, tabela e lista de cards). Nao altera o hook
 * compartilhado usado pelas demais centrais.
 */
export function useEntryViewMode(storageKey: string) {
  const [viewMode, setViewMode] = useState<EntryViewMode>("grid");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored && VALID_MODES.has(stored as EntryViewMode)) {
        setViewMode(stored as EntryViewMode);
      }
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }, [storageKey]);

  const updateViewMode = useCallback(
    (mode: EntryViewMode) => {
      setViewMode(mode);
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // The preference remains valid for the current session.
      }
    },
    [storageKey],
  );

  return { viewMode, updateViewMode };
}
