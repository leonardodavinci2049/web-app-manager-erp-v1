import {
  MAX_REGISTRY_EXTRA_BATCHES,
  REGISTRY_DEFAULT_PAGE_LIMIT,
  REGISTRY_PAGE_LIMITS,
} from "@/app/dashboard/_components/registry";
import type {
  PurchasingAdvancedFilter,
  PurchasingCriticality,
  PurchasingFilters,
  PurchasingOrigin,
  PurchasingSalesList,
  PurchasingSort,
  PurchasingStockList,
} from "../types/purchasing-dashboard-types";

type SearchParamValue = string | string[] | undefined;
type SearchParams = URLSearchParams | Record<string, SearchParamValue>;

export const PURCHASING_PATH = "/dashboard/purchasing";

export const PURCHASING_SORT_OPTIONS: ReadonlyArray<{
  value: PurchasingSort;
  label: string;
}> = [
  { value: "name-asc", label: "Nome A-Z" },
  { value: "name-desc", label: "Nome Z-A" },
  { value: "newest", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
];

const VALID_SORTS = new Set(PURCHASING_SORT_OPTIONS.map(({ value }) => value));

function normalizeParams(value: SearchParams): URLSearchParams {
  if (value instanceof URLSearchParams) return value;
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value)) {
    const normalized = Array.isArray(item) ? item[0] : item;
    if (normalized) params.set(key, normalized);
  }
  return params;
}

function parsePositiveInteger(params: URLSearchParams, key: string) {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function parseRange<T extends number>(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
  fallback: T,
): T {
  const value = Number(params.get(key));
  return Number.isInteger(value) && value >= min && value <= max
    ? (value as T)
    : fallback;
}

export function parsePurchasingFilters(value: SearchParams): PurchasingFilters {
  const params = normalizeParams(value);
  const requestedLimit = Number(params.get("limit"));
  const pageLimit = (REGISTRY_PAGE_LIMITS as readonly number[]).includes(
    requestedLimit,
  )
    ? (requestedLimit as PurchasingFilters["pageLimit"])
    : REGISTRY_DEFAULT_PAGE_LIMIT;
  const requestedSort = params.get("sort") as PurchasingSort | null;

  return {
    searchTerm: (params.get("search") ?? "").trim().slice(0, 300),
    categoryId: parsePositiveInteger(params, "category"),
    brandId: parsePositiveInteger(params, "brand"),
    typeId: parsePositiveInteger(params, "type"),
    supplierId: parsePositiveInteger(params, "supplier"),
    salesList: parseRange<PurchasingSalesList>(params, "sales-list", 0, 3, 0),
    stockList: parseRange<PurchasingStockList>(params, "stock-list", 0, 3, 0),
    advancedFilter: parseRange<PurchasingAdvancedFilter>(
      params,
      "advanced",
      0,
      2,
      0,
    ),
    origin: parseRange<PurchasingOrigin>(params, "origin", 0, 2, 0),
    premium: params.get("premium") === "1",
    criticality: parseRange<PurchasingCriticality>(
      params,
      "criticality",
      0,
      4,
      0,
    ),
    sort:
      requestedSort && VALID_SORTS.has(requestedSort)
        ? requestedSort
        : "name-desc",
    pageLimit,
  };
}

export function parsePurchasingPaging(value: SearchParams) {
  const params = normalizeParams(value);
  const page = Number(params.get("page"));
  const accum = Number(params.get("accum"));
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 0,
    accum:
      Number.isSafeInteger(accum) && accum > 0
        ? Math.min(accum, MAX_REGISTRY_EXTRA_BATCHES)
        : 0,
  };
}

export function mapPurchasingSort(sort: PurchasingSort): {
  columnId: 1 | 2 | 3;
  orderId: 1 | 2;
} {
  switch (sort) {
    case "name-asc":
      return { columnId: 1, orderId: 1 };
    case "newest":
      return { columnId: 2, orderId: 2 };
    case "price-asc":
      return { columnId: 3, orderId: 1 };
    case "price-desc":
      return { columnId: 3, orderId: 2 };
    default:
      return { columnId: 1, orderId: 2 };
  }
}

export function buildPurchasingUrl(filters: PurchasingFilters): string {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.set("search", filters.searchTerm);
  if (filters.categoryId) params.set("category", String(filters.categoryId));
  if (filters.brandId) params.set("brand", String(filters.brandId));
  if (filters.typeId) params.set("type", String(filters.typeId));
  if (filters.supplierId) params.set("supplier", String(filters.supplierId));
  if (filters.salesList) params.set("sales-list", String(filters.salesList));
  if (filters.stockList) params.set("stock-list", String(filters.stockList));
  if (filters.advancedFilter)
    params.set("advanced", String(filters.advancedFilter));
  if (filters.origin) params.set("origin", String(filters.origin));
  if (filters.premium) params.set("premium", "1");
  if (filters.criticality)
    params.set("criticality", String(filters.criticality));
  if (filters.sort !== "name-desc") params.set("sort", filters.sort);
  if (filters.pageLimit !== REGISTRY_DEFAULT_PAGE_LIMIT)
    params.set("limit", String(filters.pageLimit));
  const query = params.toString();
  return query ? `${PURCHASING_PATH}?${query}` : PURCHASING_PATH;
}

export function buildPurchasingReturnTo(
  value: Record<string, SearchParamValue>,
) {
  const params = normalizeParams(value);
  const query = params.toString();
  return query ? `${PURCHASING_PATH}?${query}` : PURCHASING_PATH;
}

export function buildPurchasingDetailsHref(id: number, returnTo: string) {
  return `${PURCHASING_PATH}/${id}?returnTo=${encodeURIComponent(returnTo)}`;
}
