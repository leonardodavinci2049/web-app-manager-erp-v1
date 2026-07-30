"use client";

import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegistryViewMode } from "./use-registry-view-mode";

interface RegistryViewModeToggleProps {
  viewMode: RegistryViewMode;
  onToggle: () => void;
  className?: string;
}

export function RegistryViewModeToggle({
  viewMode,
  onToggle,
  className,
}: RegistryViewModeToggleProps) {
  const label =
    viewMode === "grid"
      ? "Exibir resultados como lista"
      : "Exibir resultados como grade";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={onToggle}
      className={className}
      aria-label={label}
      aria-pressed={viewMode === "list"}
      title={label}
    >
      {viewMode === "grid" ? (
        <List className="size-4" aria-hidden="true" />
      ) : (
        <Grid3X3 className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
