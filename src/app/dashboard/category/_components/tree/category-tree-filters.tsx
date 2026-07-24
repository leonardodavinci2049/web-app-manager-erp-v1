"use client";

import { ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryFilterStatus } from "../category-types";

export interface CategoryTreeFiltersProps {
  search: string;
  status: CategoryFilterStatus;
  withoutProducts: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (value: CategoryFilterStatus) => void;
  onToggleWithoutProducts: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function CategoryTreeFilters({
  search,
  status,
  withoutProducts,
  onSearchChange,
  onSearchSubmit,
  onStatusChange,
  onToggleWithoutProducts,
  onExpandAll,
  onCollapseAll,
}: CategoryTreeFiltersProps) {
  return (
    <div id="category-tree-filters" className="space-y-3 border-b p-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nome ou ID…"
          className="h-9 pl-8"
          aria-label="Buscar categorias"
        />
      </form>
      <fieldset
        className="flex gap-1 overflow-x-auto"
        aria-label="Filtrar por status"
      >
        {(["all", "active", "inactive"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            size="xs"
            variant={
              !withoutProducts && status === value ? "default" : "outline"
            }
            aria-pressed={!withoutProducts && status === value}
            onClick={() => onStatusChange(value)}
          >
            {value === "all"
              ? "Qualquer status"
              : value === "active"
                ? "Ativas"
                : "Inativas"}
          </Button>
        ))}
        <Button
          type="button"
          size="xs"
          variant={withoutProducts ? "default" : "outline"}
          aria-pressed={withoutProducts}
          onClick={onToggleWithoutProducts}
        >
          Sem produtos
        </Button>
      </fieldset>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          onClick={onExpandAll}
        >
          <ChevronsUpDown className="size-3" /> Expandir tudo
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          onClick={onCollapseAll}
        >
          <ChevronsDownUp className="size-3" /> Recolher tudo
        </button>
      </div>
    </div>
  );
}
