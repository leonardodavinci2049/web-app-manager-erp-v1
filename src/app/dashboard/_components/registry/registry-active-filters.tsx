"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RegistryActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface RegistryActiveFiltersProps {
  filters: RegistryActiveFilter[];
  pending: boolean;
  onRemove: (key: string) => void;
  onClear: () => void;
}

export function RegistryActiveFilters({
  filters,
  pending,
  onRemove,
  onClear,
}: RegistryActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <section
      className="bg-muted/35 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
      aria-label="Filtros ativos"
    >
      <span className="text-muted-foreground mr-1 text-xs font-medium">
        Filtros ativos:
      </span>
      {filters.map((filter) => (
        <Button
          key={filter.key}
          type="button"
          variant="outline"
          size="sm"
          className="bg-background h-7 max-w-full gap-1.5 rounded-full px-2.5 text-xs"
          disabled={pending}
          onClick={() => onRemove(filter.key)}
          aria-label={`Remover filtro ${filter.label}: ${filter.value}`}
        >
          <span className="truncate">
            <span className="font-medium">{filter.label}:</span> {filter.value}
          </span>
          <X className="size-3" aria-hidden="true" />
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto h-7 text-xs"
        disabled={pending}
        onClick={onClear}
      >
        Limpar filtros
      </Button>
    </section>
  );
}
