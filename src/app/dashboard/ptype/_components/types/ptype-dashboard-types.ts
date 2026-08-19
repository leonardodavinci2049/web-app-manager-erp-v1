export type PtypeViewMode = "grid" | "list";
export type PtypeStatus = "all" | "active" | "inactive";
export type PtypeSort = "id" | "name";
export type PtypeOrder = "asc" | "desc";
export type PtypePageLimit = 25 | 50 | 100;

export const DEFAULT_PTYPE_LIMIT: PtypePageLimit = 50;

export interface PtypeSearchParams {
  search: string;
  status: PtypeStatus;
  sort: PtypeSort;
  order: PtypeOrder;
  page: number;
  limit: PtypePageLimit;
}

export interface PtypeActionResult {
  success: boolean;
  message: string;
  ptypeId?: number;
  fieldErrors?: Record<string, string[]>;
}

export interface PtypeListingImageResult {
  success: boolean;
  message?: string;
  error?: string;
  warning?: string;
}
