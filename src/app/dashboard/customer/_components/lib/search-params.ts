import {
  type CustomerOperation,
  type CustomerOrder,
  type CustomerPageLimit,
  type CustomerSearchParams,
  type CustomerSort,
  type CustomerTriState,
  DEFAULT_CUSTOMER_LIMIT,
} from "../types/customer-dashboard-types";

type SearchParamValue = string | string[] | undefined;

const VALID_TRI_STATES = new Set<CustomerTriState>([0, 1, 2]);
const VALID_OPERATIONS = new Set<CustomerOperation>([0, 1, 2, 3, 6, 7]);
const VALID_SORTS = new Set<CustomerSort>(["id", "name", "last-purchase"]);
const VALID_ORDERS = new Set<CustomerOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<CustomerPageLimit>([25, 50, 100]);
const CUSTOMER_PATH = "/dashboard/customer";

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

function parseNonNegativeInteger(params: URLSearchParams, key: string): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function parseTriState(params: URLSearchParams, key: string): CustomerTriState {
  const value = Number(params.get(key));
  return VALID_TRI_STATES.has(value as CustomerTriState)
    ? (value as CustomerTriState)
    : 0;
}

function parseDate(params: URLSearchParams, key: string): string {
  const value = params.get(key) ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? value
    : "";
}

export function parseCustomerSearchParams(
  searchParams: URLSearchParams | Record<string, SearchParamValue>,
): CustomerSearchParams {
  const params = normalizeParams(searchParams);
  const operation = Number(params.get("operation"));
  const sort = params.get("sort") as CustomerSort | null;
  const order = params.get("order") as CustomerOrder | null;
  const limit = Number(params.get("limit"));

  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    categoryId: parseNonNegativeInteger(params, "category"),
    clientType: parseNonNegativeInteger(params, "client-type"),
    personType: parseNonNegativeInteger(params, "person-type"),
    noImage: params.get("no-image") === "1",
    approved: parseTriState(params, "approved"),
    gender: parseTriState(params, "gender"),
    restricted: parseTriState(params, "restricted"),
    enabled: parseTriState(params, "enabled"),
    statusId: parseNonNegativeInteger(params, "status"),
    operation: VALID_OPERATIONS.has(operation as CustomerOperation)
      ? (operation as CustomerOperation)
      : 0,
    startDate: parseDate(params, "start-date"),
    endDate: parseDate(params, "end-date"),
    sort: sort && VALID_SORTS.has(sort) ? sort : "id",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parseNonNegativeInteger(params, "page"),
    limit: VALID_LIMITS.has(limit as CustomerPageLimit)
      ? (limit as CustomerPageLimit)
      : DEFAULT_CUSTOMER_LIMIT,
  };
}

export function buildCustomerUrl(
  state: CustomerSearchParams,
  pathname = CUSTOMER_PATH,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search.trim().slice(0, 300));
  if (state.categoryId) params.set("category", String(state.categoryId));
  if (state.clientType) params.set("client-type", String(state.clientType));
  if (state.personType) params.set("person-type", String(state.personType));
  if (state.noImage) params.set("no-image", "1");
  if (state.approved) params.set("approved", String(state.approved));
  if (state.gender) params.set("gender", String(state.gender));
  if (state.restricted) params.set("restricted", String(state.restricted));
  if (state.enabled) params.set("enabled", String(state.enabled));
  if (state.statusId) params.set("status", String(state.statusId));
  if (state.operation) params.set("operation", String(state.operation));
  if (state.operation === 7 && state.startDate)
    params.set("start-date", state.startDate);
  if (state.operation === 7 && state.endDate)
    params.set("end-date", state.endDate);
  if (state.sort !== "id") params.set("sort", state.sort);
  if (state.order !== "desc") params.set("order", state.order);
  if (state.page > 0) params.set("page", String(state.page));
  if (state.limit !== DEFAULT_CUSTOMER_LIMIT)
    params.set("limit", String(state.limit));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildCustomerDetailHref(
  customerId: number,
  listState: CustomerSearchParams,
): string {
  return `${CUSTOMER_PATH}/${customerId}?returnTo=${encodeURIComponent(buildCustomerUrl(listState))}`;
}

export function getSafeCustomerReturnTo(value?: string): string {
  if (!value) return CUSTOMER_PATH;
  try {
    const url = new URL(value, "http://manager.local");
    if (
      url.origin === "http://manager.local" &&
      url.pathname === CUSTOMER_PATH
    ) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return CUSTOMER_PATH;
  }
  return CUSTOMER_PATH;
}

export function mapCustomerFiltersToApi(state: CustomerSearchParams) {
  const hasValidPeriod =
    state.operation === 7 &&
    state.startDate !== "" &&
    state.endDate !== "" &&
    state.startDate <= state.endDate;

  return {
    categoryId: state.categoryId,
    clientType: state.clientType,
    personType: state.personType,
    noImage: state.noImage ? 1 : 0,
    approved: state.approved,
    gender: state.gender,
    restricted: state.restricted,
    enabled: state.enabled,
    statusId: state.statusId,
    operation: state.operation === 7 && !hasValidPeriod ? 0 : state.operation,
    startDate: hasValidPeriod ? state.startDate : "",
    endDate: hasValidPeriod ? state.endDate : "",
    columnId:
      state.sort === "name" ? 1 : state.sort === "last-purchase" ? 3 : 2,
    orderId: state.order === "asc" ? 1 : 2,
  };
}

export function countCustomerFilters(state: CustomerSearchParams): number {
  return [
    state.categoryId !== 0,
    state.clientType !== 0,
    state.personType !== 0,
    state.noImage,
    state.approved !== 0,
    state.gender !== 0,
    state.restricted !== 0,
    state.enabled !== 0,
    state.statusId !== 0,
    state.operation !== 0,
    state.sort !== "id" || state.order !== "desc",
    state.limit !== DEFAULT_CUSTOMER_LIMIT,
  ].filter(Boolean).length;
}
