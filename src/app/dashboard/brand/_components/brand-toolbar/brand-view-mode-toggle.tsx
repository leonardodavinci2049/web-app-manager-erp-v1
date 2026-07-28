"use client";

import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrandViewMode } from "../types/brand-dashboard-types";

interface BrandViewModeToggleProps {
  viewMode: BrandViewMode;
  onChange: (mode: BrandViewMode) => void;
}

/**
 * Toggle grid/list. Alterna o modo de visualizacao instantaneamente via estado
 * efemero da sessao (sem URL, sem localStorage, sem refetch).
 */
export function BrandViewModeToggle({
  viewMode,
  onChange,
}: BrandViewModeToggleProps) {
  const nextViewMode: BrandViewMode = viewMode === "grid" ? "list" : "grid";
  const label =
    viewMode === "grid"
      ? "Alternar para visualização em lista"
      : "Alternar para visualização em grade";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => onChange(nextViewMode)}
      className="h-11 w-11 shrink-0 shadow-sm"
      aria-label={label}
      title={label}
    >
      {viewMode === "grid" ? (
        <List className="h-4 w-4" />
      ) : (
        <Grid3X3 className="h-4 w-4" />
      )}
    </Button>
  );
}
