export type SellerViewMode = "grid" | "list";
export type SellerStatus = "all" | "active" | "inactive";
export type SellerCategory = 0 | 1 | 2 | 3;
export type SellerSort = "id" | "name" | "last-purchase";
export type SellerOrder = "asc" | "desc";
export type SellerPageLimit = 25 | 50 | 100;

export const DEFAULT_SELLER_LIMIT: SellerPageLimit = 50;

export interface SellerSearchParams {
  search: string;
  category: SellerCategory;
  noImage: boolean;
  status: SellerStatus;
  sort: SellerSort;
  order: SellerOrder;
  page: number;
  limit: SellerPageLimit;
  /** Extra batches appended by "Carregar mais" on top of `page`. */
  accum: number;
}

export interface SellerListingImageResult {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}
