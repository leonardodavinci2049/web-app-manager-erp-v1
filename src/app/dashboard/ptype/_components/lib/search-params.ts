import { MAX_REGISTRY_EXTRA_BATCHES } from "@/app/dashboard/_components/registry/registry-page-limits";
import {
  DEFAULT_PTYPE_LIMIT,
  type PtypeOrder,
  type PtypePageLimit,
  type PtypeSearchParams,
  type PtypeSort,
  type PtypeStatus,
} from "../types/ptype-dashboard-types";

type SearchParamValue = string | string[] | undefined;

const VALID_STATUSES = new Set<PtypeStatus>(["all", "active", "inactive"]);
const VALID_SORTS = new Set<PtypeSort>(["id", "name"]);
const VALID_ORDERS = new Set<PtypeOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<PtypePageLimit>([25, 50, 100]);

function normalizeParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): URLSearchParams {
  if (searchParams instanceof URLSearchParams) return searchParams;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      params.set(key, value[0]);
    }
  }
  return params;
}

function parseNonNegativeInt(
  params: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

export function parsePtypeSearchParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): PtypeSearchParams {
  const params = normalizeParams(searchParams);
  const rawStatus = params.get("status") as PtypeStatus | null;
  const rawSort = params.get("sort") as PtypeSort | null;
  const rawOrder = params.get("order") as PtypeOrder | null;
  const rawLimit = Number(params.get("limit"));

  return {
    search: (params.get("search") ?? "").trim().slice(0, 100),
    status: rawStatus && VALID_STATUSES.has(rawStatus) ? rawStatus : "all",
    sort: rawSort && VALID_SORTS.has(rawSort) ? rawSort : "id",
    order: rawOrder && VALID_ORDERS.has(rawOrder) ? rawOrder : "desc",
    page: parseNonNegativeInt(params, "page", 0),
    limit: VALID_LIMITS.has(rawLimit as PtypePageLimit)
      ? (rawLimit as PtypePageLimit)
      : DEFAULT_PTYPE_LIMIT,
    accum: Math.min(
      parseNonNegativeInt(params, "accum", 0),
      MAX_REGISTRY_EXTRA_BATCHES,
    ),
  };
}

export function buildPtypeUrl(
  state: Partial<PtypeSearchParams>,
  pathname = "/dashboard/ptype",
): string {
  const params = new URLSearchParams();

  if (state.search) params.set("search", state.search.trim().slice(0, 100));
  if (state.status && state.status !== "all")
    params.set("status", state.status);
  if (state.sort && state.sort !== "id") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== DEFAULT_PTYPE_LIMIT)
    params.set("limit", String(state.limit));
  if (state.accum && state.accum > 0) params.set("accum", String(state.accum));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildPtypeDetailHref(
  ptypeId: number,
  listState: PtypeSearchParams,
): string {
  const returnTo = buildPtypeUrl(listState);
  return `/dashboard/ptype/${ptypeId}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafePtypeReturnTo(value?: string): string {
  const pathname = "/dashboard/ptype";
  if (!value) return pathname;
  try {
    const url = new URL(value, "http://manager.local");
    if (url.origin === "http://manager.local" && url.pathname === pathname) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return pathname;
  }
  return pathname;
}

export function mapPtypeFiltersToApi(state: PtypeSearchParams): {
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
