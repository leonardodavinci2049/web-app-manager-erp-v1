import type { SortOption, ViewMode } from "@/types/types";

export type { SortOption, ViewMode };

/** Estado ternario aceito pelos filtros de situacao e origem da API. */
export type TernaryFlag = 0 | 1 | 2;

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
/**
 * Estado de filtros do catalogo derivado da URL (searchParams).
 */
export interface CatalogFilters {
  searchTerm: string;
  reference: string;
  model: string;
  selectedCategory: string;
  selectedBrand?: string;
  selectedPtype?: string;
  supplierId?: number;
  physicalId?: number;
  ean: string;
  onlyInStock: boolean;
  isService: boolean;
  hasNoImage: boolean;
  hasNoDescription: boolean;
  hasNoSalesCopy: boolean;
  isBestSeller: boolean;
  isPromotion: boolean;
  isFeatured: boolean;
  importedStatus: TernaryFlag;
  inactiveStatus: TernaryFlag;
  isPremium: boolean;
  isConsignment: boolean;
  isDiscontinued: boolean;
  hasNoInventory: boolean;
  isWebsiteOff: boolean;
  isLowestSelling: boolean;
  isStalled: boolean;
  isLatestArrival: boolean;
  hasPriceLessThanOne: boolean;
  hasLowStock: boolean;
  sortBy: SortOption;
}

/** Filtros pertencentes ao painel lateral, excluindo a busca principal. */
export type PanelFilterType = Exclude<keyof CatalogFilters, "searchTerm">;
