import { MAX_REGISTRY_EXTRA_BATCHES } from "@/app/dashboard/_components/registry/registry-page-limits";
import {
  type CarrierOrder,
  type CarrierPageLimit,
  type CarrierSearchParams,
  type CarrierSort,
  type CarrierStatus,
  DEFAULT_CARRIER_LIMIT,
} from "../types/carrier-dashboard-types";

type SearchParamValue = string | string[] | undefined;

const VALID_STATUSES = new Set<CarrierStatus>(["all", "active", "inactive"]);
const VALID_SORTS = new Set<CarrierSort>(["id", "name"]);
const VALID_ORDERS = new Set<CarrierOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<CarrierPageLimit>([25, 50, 100]);
const CARRIER_PATH = "/dashboard/carriers";

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

export function parseCarrierSearchParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): CarrierSearchParams {
  const params = normalizeParams(searchParams);
  const status = params.get("status") as CarrierStatus | null;
  const sort = params.get("sort") as CarrierSort | null;
  const order = params.get("order") as CarrierOrder | null;
  const limit = Number(params.get("limit"));

  return {
    search: (params.get("search") ?? "").trim().slice(0, 100),
    status: status && VALID_STATUSES.has(status) ? status : "all",
    sort: sort && VALID_SORTS.has(sort) ? sort : "id",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parsePage(params),
    limit: VALID_LIMITS.has(limit as CarrierPageLimit)
      ? (limit as CarrierPageLimit)
      : DEFAULT_CARRIER_LIMIT,
    accum: Math.min(parsePage(params), MAX_REGISTRY_EXTRA_BATCHES),
  };
}

export function buildCarrierUrl(
  state: Partial<CarrierSearchParams>,
  pathname = CARRIER_PATH,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search.trim().slice(0, 100));
  if (state.status && state.status !== "all")
    params.set("status", state.status);
  if (state.sort && state.sort !== "id") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== DEFAULT_CARRIER_LIMIT)
    params.set("limit", String(state.limit));
  if (state.accum && state.accum > 0) params.set("accum", String(state.accum));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildCarrierDetailHref(
  carrierId: number,
  listState: CarrierSearchParams,
): string {
  return `${CARRIER_PATH}/${carrierId}?returnTo=${encodeURIComponent(buildCarrierUrl(listState))}`;
}

export function getSafeCarrierReturnTo(value?: string): string {
  if (!value) return CARRIER_PATH;
  try {
    const url = new URL(value, "http://manager.local");
    if (
      url.origin === "http://manager.local" &&
      url.pathname === CARRIER_PATH
    ) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return CARRIER_PATH;
  }
  return CARRIER_PATH;
}

export function mapCarrierFiltersToApi(state: CarrierSearchParams): {
  statusId: number;
  columnId: number;
  orderId: number;
} {
  return {
    statusId:
      state.status === "active" ? 2 : state.status === "inactive" ? 1 : 0,
    columnId: state.sort === "name" ? 1 : 2,
    orderId: state.order === "asc" ? 1 : 2,
  };
}
