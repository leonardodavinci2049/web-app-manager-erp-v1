import {
  ENTRY_MODEL_OPTIONS,
  ENTRY_OPERATION_LIST_OPTIONS,
  ENTRY_PAGE_SIZE,
  type EntryCategoryId,
  type EntryModelId,
  type EntryOperationList,
  type EntryOrder,
  type EntryPageLimit,
  type EntrySearchParams,
  type EntrySort,
} from "../types/entry-dashboard-types";

type SearchParamValue = string | string[] | undefined;
const VALID_SORTS = new Set<EntrySort>(["entry-date", "id", "created-at"]);
const VALID_ORDERS = new Set<EntryOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<EntryPageLimit>([25, 50, 100]);
const VALID_MODEL_IDS = new Set<EntryModelId>(
  ENTRY_MODEL_OPTIONS.map((option) => option.value),
);
const VALID_CATEGORY_IDS = new Set<EntryCategoryId>([0, 1]);
const VALID_OPERATION_LISTS = new Set<EntryOperationList>(
  ENTRY_OPERATION_LIST_OPTIONS.map((option) => option.value),
);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeParams(
  sp: URLSearchParams | Record<string, SearchParamValue>,
): URLSearchParams {
  if (sp instanceof URLSearchParams) return sp;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
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
  defaultValue: number,
): number {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return defaultValue;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : defaultValue;
}

function parseIsoDate(
  params: URLSearchParams,
  key: string,
  operationList: EntryOperationList,
): string {
  if (operationList === 0) return "";
  const raw = params.get(key);
  return raw && ISO_DATE_PATTERN.test(raw) ? raw : "";
}

/**
 * Constroi o estado de filtros da central de entradas a partir de searchParams.
 * Fonte unica de verdade para a leitura URL -> objeto.
 */
export function parseEntrySearchParams(
  sp: URLSearchParams | Record<string, SearchParamValue>,
): EntrySearchParams {
  const params = normalizeParams(sp);
  const sort = params.get("sort") as EntrySort | null;
  const order = params.get("order") as EntryOrder | null;
  const limit = Number(params.get("limit"));
  const modelId = parseNonNegativeInt(params, "model", 0) as EntryModelId;
  const categoryId = parseNonNegativeInt(
    params,
    "category",
    0,
  ) as EntryCategoryId;
  const operationList = parseNonNegativeInt(
    params,
    "operation-list",
    0,
  ) as EntryOperationList;
  const resolvedOperationList = VALID_OPERATION_LISTS.has(operationList)
    ? operationList
    : 0;
  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    sort: sort && VALID_SORTS.has(sort) ? sort : "entry-date",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parseNonNegativeInt(params, "page", 0),
    limit: VALID_LIMITS.has(limit as EntryPageLimit)
      ? (limit as EntryPageLimit)
      : ENTRY_PAGE_SIZE,
    supplierId: parseNonNegativeInt(params, "supplier", 0),
    carrierId: parseNonNegativeInt(params, "carrier", 0),
    modelId: VALID_MODEL_IDS.has(modelId) ? modelId : 0,
    categoryId: VALID_CATEGORY_IDS.has(categoryId) ? categoryId : 0,
    operationList: resolvedOperationList,
    startDate: parseIsoDate(params, "start-date", resolvedOperationList),
    endDate: parseIsoDate(params, "end-date", resolvedOperationList),
  };
}

/**
 * Monta a URL da central de entradas a partir do estado. Fonte unica de verdade
 * para a escrita objeto -> URL. O modo de visualizacao (grid/tabela/cards) nao
 * entra na URL: e' preferencia efemera do navegador.
 */
export function buildEntryUrl(
  state: Partial<EntrySearchParams>,
  pathname: string,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  if (state.sort && state.sort !== "entry-date") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== ENTRY_PAGE_SIZE)
    params.set("limit", String(state.limit));
  if (state.supplierId && state.supplierId > 0)
    params.set("supplier", String(state.supplierId));
  if (state.carrierId && state.carrierId > 0)
    params.set("carrier", String(state.carrierId));
  if (state.modelId && state.modelId > 0)
    params.set("model", String(state.modelId));
  if (state.categoryId && state.categoryId > 0)
    params.set("category", String(state.categoryId));
  if (state.operationList && state.operationList > 0) {
    params.set("operation-list", String(state.operationList));
    if (state.startDate) params.set("start-date", state.startDate);
    if (state.endDate) params.set("end-date", state.endDate);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function buildEntryDetailHref(
  entryId: number,
  listState: EntrySearchParams,
  pathname = "/dashboard/entry",
): string {
  const returnTo = buildEntryUrl(listState, pathname);
  return `${pathname}/${entryId}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafeEntryReturnTo(value?: string): string {
  const pathname = "/dashboard/entry";
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
