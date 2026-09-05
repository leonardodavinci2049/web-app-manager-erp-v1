export type SupplierViewMode = "grid" | "list";
export type SupplierStatus = "all" | "active" | "inactive";
export type SupplierSort = "id" | "name" | "last-purchase";
export type SupplierOrder = "asc" | "desc";
export type SupplierPageLimit = 25 | 50 | 100;

export const DEFAULT_SUPPLIER_LIMIT: SupplierPageLimit = 50;

export interface SupplierSearchParams {
  search: string;
  status: SupplierStatus;
  sort: SupplierSort;
  order: SupplierOrder;
  page: number;
  limit: SupplierPageLimit;
  /** Extra batches appended by "Carregar mais" on top of `page`. */
  accum: number;
}

export interface SupplierActionResult {
  success: boolean;
  message: string;
  supplierId?: number;
  fieldErrors?: Record<string, string[]>;
}

export interface SupplierListingImageResult {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}
