"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ProductGridSkeleton } from "./product-grid/product-grid-skeleton";
import type { ViewMode } from "./types/catalog-types";

const VIEW_MODE_STORAGE_KEY = "catalog:product-view-mode";

/**
 * Scaffold dos produtos durante o carregamento inicial. Recupera a preferencia
 * visual do catalogo no cliente e mantem um indicador de atividade visivel.
 */
export function CatalogLoadingProducts() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "grid" || stored === "list") {
        setViewMode(stored);
      }
    } catch {
      // Mantem a grade padrao quando o storage nao estiver disponivel.
    }
  }, []);

  return (
    <div className="relative min-h-80" aria-busy="true">
      <div className="opacity-65">
        <ProductGridSkeleton viewMode={viewMode} count={8} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-24 sm:pt-32">
        <div
          className="bg-background/95 flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <Spinner className="text-primary size-5" aria-label="Carregando" />
          <span className="text-sm font-medium">Carregando produtos...</span>
        </div>
      </div>
    </div>
  );
}
