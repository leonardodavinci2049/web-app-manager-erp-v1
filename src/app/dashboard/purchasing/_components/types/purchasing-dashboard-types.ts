import type { RegistryPageLimit } from "@/app/dashboard/_components/registry";

export type PurchasingSalesList = 0 | 1 | 2 | 3;
export type PurchasingStockList = 0 | 1 | 2 | 3;
export type PurchasingAdvancedFilter = 0 | 1 | 2;
export type PurchasingOrigin = 0 | 1 | 2;
export type PurchasingCriticality = 0 | 1 | 2 | 3 | 4;
export type PurchasingSort =
  | "criticality-asc"
  | "sales-desc"
  | "name-asc"
  | "name-desc"
  | "newest";

export interface PurchasingCategoryOption {
  id: number;
  name: string;
  displayName: string;
}

export interface PurchasingSupplierOption {
  id: number;
  label: string;
}

export interface PurchasingFilters {
  searchTerm: string;
  categoryId?: number;
  brandId?: number;
  typeId?: number;
  supplierId?: number;
  salesList: PurchasingSalesList;
  stockList: PurchasingStockList;
  advancedFilter: PurchasingAdvancedFilter;
  origin: PurchasingOrigin;
  premium: boolean;
  criticality: PurchasingCriticality;
  sort: PurchasingSort;
  pageLimit: RegistryPageLimit;
}

export type PurchasingPanelFilter = Exclude<
  keyof PurchasingFilters,
  "searchTerm"
>;
