import {
  DEFAULT_SUPPLIER_LIMIT,
  type SupplierOrder,
  type SupplierPageLimit,
  type SupplierSearchParams,
  type SupplierSort,
  type SupplierStatus,
} from "../types/supplier-dashboard-types";

type SearchParamValue = string | string[] | undefined;

const VALID_STATUSES = new Set<SupplierStatus>(["all", "active", "inactive"]);
const VALID_SORTS = new Set<SupplierSort>(["id", "name", "last-purchase"]);
const VALID_ORDERS = new Set<SupplierOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<SupplierPageLimit>([25, 50, 100]);
const SUPPLIER_PATH = "/dashboard/suppliers";

function normalizeParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): URLSearchParams {
  if (searchParams instanceof URLSearchParams) return searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && typeof value[0] === "string")
      params.set(key, value[0]);
  }
  return params;
}

function parseNonNegativeInt(params: URLSearchParams, key: string): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function parseSupplierSearchParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): SupplierSearchParams {
  const params = normalizeParams(searchParams);
  const status = params.get("status") as SupplierStatus | null;
  const sort = params.get("sort") as SupplierSort | null;
  const order = params.get("order") as SupplierOrder | null;
  const limit = Number(params.get("limit"));

  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    status: status && VALID_STATUSES.has(status) ? status : "all",
    sort: sort && VALID_SORTS.has(sort) ? sort : "id",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parseNonNegativeInt(params, "page"),
    limit: VALID_LIMITS.has(limit as SupplierPageLimit)
      ? (limit as SupplierPageLimit)
      : DEFAULT_SUPPLIER_LIMIT,
  };
}

export function buildSupplierUrl(
  state: Partial<SupplierSearchParams>,
  pathname = SUPPLIER_PATH,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search.trim().slice(0, 300));
  if (state.status && state.status !== "all")
    params.set("status", state.status);
  if (state.sort && state.sort !== "id") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== DEFAULT_SUPPLIER_LIMIT)
    params.set("limit", String(state.limit));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildSupplierDetailHref(
  supplierId: number,
  listState: SupplierSearchParams,
): string {
  const returnTo = buildSupplierUrl(listState);
  return `${SUPPLIER_PATH}/${supplierId}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafeSupplierReturnTo(value?: string): string {
  if (!value) return SUPPLIER_PATH;
  try {
    const url = new URL(value, "http://manager.local");
    if (
      url.origin === "http://manager.local" &&
      url.pathname === SUPPLIER_PATH
    ) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return SUPPLIER_PATH;
  }
  return SUPPLIER_PATH;
}

export function mapSupplierFiltersToApi(state: SupplierSearchParams): {
  statusId: number;
  columnId: number;
  orderId: number;
} {
  return {
    statusId:
      state.status === "active" ? 2 : state.status === "inactive" ? 1 : 0,
    columnId:
      state.sort === "name" ? 1 : state.sort === "last-purchase" ? 3 : 2,
    orderId: state.order === "asc" ? 1 : 2,
  };
}
