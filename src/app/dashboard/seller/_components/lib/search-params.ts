import { MAX_REGISTRY_EXTRA_BATCHES } from "@/app/dashboard/_components/registry/registry-page-limits";
import {
  DEFAULT_SELLER_LIMIT,
  type SellerCategory,
  type SellerOrder,
  type SellerPageLimit,
  type SellerSearchParams,
  type SellerSort,
  type SellerStatus,
} from "../types/seller-dashboard-types";

type SearchParamValue = string | string[] | undefined;

const VALID_CATEGORIES = new Set<SellerCategory>([0, 1, 2, 3]);
const VALID_STATUSES = new Set<SellerStatus>(["all", "active", "inactive"]);
const VALID_SORTS = new Set<SellerSort>(["id", "name", "last-purchase"]);
const VALID_ORDERS = new Set<SellerOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<SellerPageLimit>([25, 50, 100]);
const SELLER_PATH = "/dashboard/seller";

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

function parsePage(params: URLSearchParams): number {
  const raw = params.get("page");
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function parseSellerSearchParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): SellerSearchParams {
  const params = normalizeParams(searchParams);
  const category = Number(params.get("category"));
  const status = params.get("status") as SellerStatus | null;
  const sort = params.get("sort") as SellerSort | null;
  const order = params.get("order") as SellerOrder | null;
  const limit = Number(params.get("limit"));

  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    category: VALID_CATEGORIES.has(category as SellerCategory)
      ? (category as SellerCategory)
      : 0,
    noImage: params.get("no-image") === "1",
    status: status && VALID_STATUSES.has(status) ? status : "all",
    sort: sort && VALID_SORTS.has(sort) ? sort : "id",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parsePage(params),
    limit: VALID_LIMITS.has(limit as SellerPageLimit)
      ? (limit as SellerPageLimit)
      : DEFAULT_SELLER_LIMIT,
    accum: Math.min(parsePage(params), MAX_REGISTRY_EXTRA_BATCHES),
  };
}

export function buildSellerUrl(
  state: Partial<SellerSearchParams>,
  pathname = SELLER_PATH,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search.trim().slice(0, 300));
  if (state.category) params.set("category", String(state.category));
  if (state.noImage) params.set("no-image", "1");
  if (state.status && state.status !== "all")
    params.set("status", state.status);
  if (state.sort && state.sort !== "id") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== DEFAULT_SELLER_LIMIT)
    params.set("limit", String(state.limit));
  if (state.accum && state.accum > 0) params.set("accum", String(state.accum));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildSellerDetailHref(
  sellerId: number,
  listState: SellerSearchParams,
): string {
  return `${SELLER_PATH}/${sellerId}?returnTo=${encodeURIComponent(buildSellerUrl(listState))}`;
}

export function getSafeSellerReturnTo(value?: string): string {
  if (!value) return SELLER_PATH;
  try {
    const url = new URL(value, "http://manager.local");
    if (url.origin === "http://manager.local" && url.pathname === SELLER_PATH) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return SELLER_PATH;
  }
  return SELLER_PATH;
}

export function mapSellerFiltersToApi(state: SellerSearchParams): {
  categoryId: number;
  noImage: number;
  statusId: number;
  columnId: number;
  orderId: number;
} {
  return {
    categoryId: state.category,
    noImage: state.noImage ? 1 : 0,
    statusId:
      state.status === "active" ? 2 : state.status === "inactive" ? 1 : 0,
    columnId:
      state.sort === "name" ? 1 : state.sort === "last-purchase" ? 3 : 2,
    orderId: state.order === "asc" ? 1 : 2,
  };
}
