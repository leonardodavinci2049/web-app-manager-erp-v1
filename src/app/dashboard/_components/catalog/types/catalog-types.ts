import type { SortOption, ViewMode } from "@/types/types";

export type { SortOption, ViewMode };

/**
 * Opcao de categoria plana utilizada pelos filtros do catalogo.
 */
export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string;
}

/**
 * Tipos de filtro manipulados pelo painel lateral (Sheet).
 */
export type PanelFilterType = "category" | "brand" | "ptype" | "stock";

/**
 * Estado de filtros do catalogo derivado da URL (searchParams).
 */
export interface CatalogFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand?: string;
  selectedPtype?: string;
  onlyInStock: boolean;
  sortBy: SortOption;
}
