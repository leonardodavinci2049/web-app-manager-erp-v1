"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EntryViewMode } from "../types/entry-dashboard-types";

export interface EntryViewModeOption {
  value: EntryViewMode;
  label: string;
  icon: LucideIcon;
}

interface EntryViewModeToggleProps {
  viewMode: EntryViewMode;
  options: EntryViewModeOption[];
  onToggle: (mode: EntryViewMode) => void;
  className?: string;
}

/**
 * Alternador local de modos de visualizacao da central de entradas. Cada
 * dispositivo recebe apenas as opcoes que lhe pertencem (desktop: grade e
 * tabela; mobile: grade e lista de cards).
 */
export function EntryViewModeToggle({
  viewMode,
  options,
  onToggle,
  className,
}: EntryViewModeToggleProps) {
  return (
    <fieldset
      aria-label="Modo de visualização"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = viewMode === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="icon-lg"
            aria-label={option.label}
            aria-pressed={isActive}
            title={option.label}
            onClick={() => onToggle(option.value)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </Button>
        );
      })}
    </fieldset>
  );
}
