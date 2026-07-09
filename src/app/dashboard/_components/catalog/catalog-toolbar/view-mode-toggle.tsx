"use client";

import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "../types/catalog-types";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  isLoading: boolean;
  onChange: (mode: ViewMode) => void;
}

/**
 * Toggle grid/list. Alterna o modo de visualizacao no searchParam `view`.
 */
export function ViewModeToggle({
  viewMode,
  isLoading,
  onChange,
}: ViewModeToggleProps) {
  const nextViewMode = viewMode === "grid" ? "list" : "grid";
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
      disabled={isLoading}
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
