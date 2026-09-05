"use client";

import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveFilter {
  type: string;
  label: string;
  value: string;
}

interface ProductActiveFiltersPanelProps {
  activeFilters: ActiveFilter[];
  loadedProductsCount: number;
  filteredProductsTotal: number;
  isLoading: boolean;
  onClear: () => void;
  onRemove: (type: string) => void;
}

/**
 * Painel informativo exibido abaixo da busca quando ha pesquisa ou filtros
 * ativos no catalogo.
 */
export function ProductActiveFiltersPanel({
  activeFilters,
  loadedProductsCount,
  filteredProductsTotal,
  isLoading,
  onClear,
  onRemove,
}: ProductActiveFiltersPanelProps) {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-start gap-2 rounded-lg border border-yellow-200/80 bg-yellow-50/80 px-2.5 py-2 text-xs text-yellow-950 shadow-xs dark:border-yellow-900/60 dark:bg-yellow-950/20 dark:text-yellow-100 sm:items-center sm:px-3 sm:text-sm"
      aria-live="polite"
    >
      <Info
        className="mt-0.5 size-4 shrink-0 text-yellow-700 dark:text-yellow-300 sm:mt-0"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <span className="font-medium">Filtros ativos: </span>
        <ul className="mt-0.5 space-y-0.5 sm:mt-0 sm:inline-flex sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 sm:space-y-0">
          {activeFilters.map((filter) => (
            <li
              className="inline-flex min-w-0 items-center gap-1 leading-tight"
              key={filter.type}
            >
              <span>
                <span className="font-medium">{filter.label}:&nbsp;</span>
                <span className="break-words">{filter.value}</span>
              </span>
              <button
                type="button"
                aria-label={`Remover filtro ${filter.label}`}
                className="rounded-sm p-0.5 hover:bg-yellow-200/70 focus-visible:outline-2 dark:hover:bg-yellow-900/50"
                onClick={() => onRemove(filter.type)}
                disabled={isLoading}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
          <li className="min-w-0 leading-tight sm:inline-flex">
            <span className="font-medium">Produtos carregados:&nbsp;</span>
            <span className="break-words">
              {loadedProductsCount.toLocaleString("pt-BR")} de{" "}
              {filteredProductsTotal.toLocaleString("pt-BR")} encontrados
            </span>
          </li>
        </ul>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0 gap-1 rounded-md border-yellow-300 bg-background/80 px-2 text-xs text-yellow-950 hover:bg-yellow-100 dark:border-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-950/50"
        onClick={onClear}
        disabled={isLoading}
      >
        <X className="size-3.5" aria-hidden="true" />
        Limpar
      </Button>
    </div>
  );
}
