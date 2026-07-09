import type { SortOption, ViewMode } from "@/types/types";

export type { SortOption, ViewMode };

/**
 * Opcao de categoria utilizada pelos filtros do catalogo. Mantem os campos de
 * hierarquia (parentId, order, productCount) para permitir a montagem de um
 * menu navegavel em arvore, alem do displayName para listas planas.
 */
export interface CategoryOption {
  id: number;
  parentId: number;
  name: string;
  level: number;
  order: number;
  productCount?: number;
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
