import {
  MAX_REGISTRY_EXTRA_BATCHES,
  REGISTRY_DEFAULT_PAGE_LIMIT,
  REGISTRY_PAGE_LIMITS,
} from "@/app/dashboard/_components/registry";
import {
  ORDER_DELIVERY_STATUS_OPTIONS,
  ORDER_FINANCIAL_STATUS_OPTIONS,
  ORDER_LOCATION_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderDeliveryStatusId,
  type OrderFinancialStatusId,
  type OrderLocationId,
  type OrderSearchParams,
  type OrderSort,
  type OrderStatusId,
} from "../types/order-dashboard-types";

type SearchParamValue = string | string[] | undefined;
type SearchParams = URLSearchParams | Record<string, SearchParamValue>;

export const ORDER_PATH = "/dashboard/order";

export const ORDER_SORT_OPTIONS: ReadonlyArray<{
  value: OrderSort;
  label: string;
}> = [
  { value: "default", label: "Ordenação padrão" },
  { value: "id-desc", label: "ID decrescente" },
  { value: "id-asc", label: "ID crescente" },
  { value: "total-desc", label: "Maior total" },
  { value: "total-asc", label: "Menor total" },
];

const VALID_SORTS = new Set(ORDER_SORT_OPTIONS.map(({ value }) => value));
const VALID_ORDER_STATUS_IDS = new Set(
  ORDER_STATUS_OPTIONS.map(({ value }) => value),
);
const VALID_FINANCIAL_STATUS_IDS = new Set(
  ORDER_FINANCIAL_STATUS_OPTIONS.map(({ value }) => value),
);
const VALID_DELIVERY_STATUS_IDS = new Set(
  ORDER_DELIVERY_STATUS_OPTIONS.map(({ value }) => value),
);
const VALID_LOCATION_IDS = new Set(
  ORDER_LOCATION_OPTIONS.map(({ value }) => value),
);
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function normalizeParams(value: SearchParams): URLSearchParams {
  if (value instanceof URLSearchParams) return value;
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value)) {
    const normalized = Array.isArray(item) ? item[0] : item;
    if (typeof normalized === "string") params.set(key, normalized);
  }
  return params;
}

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractMonthsClamped(referenceDate: Date, months: number): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() - months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(referenceDate.getDate(), lastDay));
}

export function getDefaultOrderPeriod(referenceDate: Date): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: formatLocalIsoDate(subtractMonthsClamped(referenceDate, 3)),
    endDate: formatLocalIsoDate(referenceDate),
  };
}

function isValidIsoDate(value: string | null): value is string {
  const match = value ? ISO_DATE_PATTERN.exec(value) : null;
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function parseNonNegativeInteger(
  params: URLSearchParams,
  key: string,
  fallback = 0,
): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function parseAllowedNumber<T extends number>(
  params: URLSearchParams,
  key: string,
  allowed: ReadonlySet<number>,
  fallback: T,
): T {
  const value = parseNonNegativeInteger(params, key, fallback);
  return allowed.has(value) ? (value as T) : fallback;
}

export function parseOrderSearchParams(
  value: SearchParams,
  referenceDate: Date,
): OrderSearchParams {
  const params = normalizeParams(value);
  const defaults = getDefaultOrderPeriod(referenceDate);
  const requestedStartDate = params.get("start-date");
  const requestedEndDate = params.get("end-date");
  const hasValidPeriod =
    isValidIsoDate(requestedStartDate) &&
    isValidIsoDate(requestedEndDate) &&
    requestedStartDate <= requestedEndDate;
  const requestedLimit = Number(params.get("limit"));
  const requestedSort = params.get("sort") as OrderSort | null;

  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    startDate: hasValidPeriod ? requestedStartDate : defaults.startDate,
    endDate: hasValidPeriod ? requestedEndDate : defaults.endDate,
    customerId: parseNonNegativeInteger(params, "customer"),
    sellerId: parseNonNegativeInteger(params, "seller"),
    orderStatusId: parseAllowedNumber<OrderStatusId>(
      params,
      "order-status",
      VALID_ORDER_STATUS_IDS,
      0,
    ),
    financialStatusId: parseAllowedNumber<OrderFinancialStatusId>(
      params,
      "financial-status",
      VALID_FINANCIAL_STATUS_IDS,
      0,
    ),
    deliveryStatusId: parseAllowedNumber<OrderDeliveryStatusId>(
      params,
      "delivery-status",
      VALID_DELIVERY_STATUS_IDS,
      0,
    ),
    locationId: parseAllowedNumber<OrderLocationId>(
      params,
      "location",
      VALID_LOCATION_IDS,
      0,
    ),
    limit: (REGISTRY_PAGE_LIMITS as readonly number[]).includes(requestedLimit)
      ? (requestedLimit as OrderSearchParams["limit"])
      : REGISTRY_DEFAULT_PAGE_LIMIT,
    page: parseNonNegativeInteger(params, "page"),
    accum: Math.min(
      parseNonNegativeInteger(params, "accum"),
      MAX_REGISTRY_EXTRA_BATCHES,
    ),
    sort:
      requestedSort && VALID_SORTS.has(requestedSort)
        ? requestedSort
        : "default",
  };
}

export function mapOrderSort(sort: OrderSort): {
  columnId: 1 | 2 | 3;
  orderId: 1 | 2;
} {
  switch (sort) {
    case "id-asc":
      return { columnId: 2, orderId: 1 };
    case "id-desc":
      return { columnId: 2, orderId: 2 };
    case "total-asc":
      return { columnId: 3, orderId: 1 };
    case "total-desc":
      return { columnId: 3, orderId: 2 };
    default:
      return { columnId: 1, orderId: 2 };
  }
}

export function buildOrderUrl(state: OrderSearchParams): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  params.set("start-date", state.startDate);
  params.set("end-date", state.endDate);
  if (state.customerId) params.set("customer", String(state.customerId));
  if (state.sellerId) params.set("seller", String(state.sellerId));
  if (state.orderStatusId)
    params.set("order-status", String(state.orderStatusId));
  if (state.financialStatusId)
    params.set("financial-status", String(state.financialStatusId));
  if (state.deliveryStatusId)
    params.set("delivery-status", String(state.deliveryStatusId));
  if (state.locationId) params.set("location", String(state.locationId));
  if (state.limit !== REGISTRY_DEFAULT_PAGE_LIMIT)
    params.set("limit", String(state.limit));
  if (state.page > 0) params.set("page", String(state.page));
  if (state.accum > 0) params.set("accum", String(state.accum));
  if (state.sort !== "default") params.set("sort", state.sort);
  const query = params.toString();
  return query ? `${ORDER_PATH}?${query}` : ORDER_PATH;
}

export function buildOrderDetailsHref(id: number, returnTo: string): string {
  return `${ORDER_PATH}/${id}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafeOrderReturnTo(value?: string): string {
  if (!value) return ORDER_PATH;
  try {
    const url = new URL(value, "http://manager.local");
    if (url.origin === "http://manager.local" && url.pathname === ORDER_PATH) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return ORDER_PATH;
  }
  return ORDER_PATH;
}
