import {
  BRAND_PAGE_SIZE,
  type BrandOrder,
  type BrandPageLimit,
  type BrandSearchParams,
  type BrandSort,
} from "../types/brand-dashboard-types";

type SearchParamValue = string | string[] | undefined;
const VALID_SORTS = new Set<BrandSort>(["id", "name"]);
const VALID_ORDERS = new Set<BrandOrder>(["asc", "desc"]);
const VALID_LIMITS = new Set<BrandPageLimit>([25, 50, 100]);

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

/**
 * Constroi o estado de filtros da central de marcas a partir de searchParams.
 * Fonte unica de verdade para a leitura URL -> objeto.
 */
export function parseBrandSearchParams(
  sp: URLSearchParams | Record<string, SearchParamValue>,
): BrandSearchParams {
  const params = normalizeParams(sp);
  const sort = params.get("sort") as BrandSort | null;
  const order = params.get("order") as BrandOrder | null;
  const limit = Number(params.get("limit"));
  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    sort: sort && VALID_SORTS.has(sort) ? sort : "id",
    order: order && VALID_ORDERS.has(order) ? order : "desc",
    page: parseNonNegativeInt(params, "page", 0),
    limit: VALID_LIMITS.has(limit as BrandPageLimit)
      ? (limit as BrandPageLimit)
      : BRAND_PAGE_SIZE,
  };
}

/**
 * Monta a URL da central de marcas a partir do estado. Fonte unica de verdade
 * para a escrita objeto -> URL. O modo de visualizacao (grid/list) nao entra
 * na URL: e' estado efemero da sessao do componente.
 */
export function buildBrandUrl(
  state: Partial<BrandSearchParams>,
  pathname: string,
): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  if (state.sort && state.sort !== "id") params.set("sort", state.sort);
  if (state.order && state.order !== "desc") params.set("order", state.order);
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.limit && state.limit !== BRAND_PAGE_SIZE)
    params.set("limit", String(state.limit));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Reconstrói a URL de retorno (returnTo) a partir dos searchParams atuais,
 * preservando busca/pagina/selecao para que o usuario volte ao mesmo estado.
 */
export function buildBrandReturnTo(
  searchParams: Record<string, SearchParamValue>,
  pathname: string,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function buildBrandDetailHref(
  brandId: number,
  listState: BrandSearchParams,
  pathname = "/dashboard/brand",
): string {
  const returnTo = buildBrandUrl(listState, pathname);
  return `${pathname}/${brandId}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getSafeBrandReturnTo(value?: string): string {
  const pathname = "/dashboard/brand";
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

/**
 * Monta o href de detalhes do produto sempre com `returnTo`, espelhando o padrao
 * das demais centrais de cadastro (customer, brand, suppliers, etc.).
 */
export function buildProductDetailsHref(
  productId: number,
  returnTo: string,
): string {
  return `/dashboard/product/${productId}?returnTo=${encodeURIComponent(returnTo)}`;
}
