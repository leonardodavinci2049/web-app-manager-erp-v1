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
 * Toggle grid/list. Escreve o modo de visualizacao no searchParam `view`.
 */
export function ViewModeToggle({
  viewMode,
  isLoading,
  onChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center rounded-md border">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("grid")}
        className="rounded-r-none"
        disabled={isLoading}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("list")}
        className="rounded-l-none"
        disabled={isLoading}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
