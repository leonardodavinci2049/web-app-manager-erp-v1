import type { BrandSearchParams } from "../types/brand-dashboard-types";

type SearchParamValue = string | string[] | undefined;

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

function parsePositiveInt(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const raw = params.get(key);
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

/**
 * Constroi o estado de filtros da central de marcas a partir de searchParams.
 * Fonte unica de verdade para a leitura URL -> objeto.
 */
export function parseBrandSearchParams(
  sp: URLSearchParams | Record<string, SearchParamValue>,
): BrandSearchParams {
  const params = normalizeParams(sp);
  return {
    search: (params.get("search") ?? "").trim().slice(0, 300),
    page: parseNonNegativeInt(params, "page", 0),
    brandId: parsePositiveInt(params, "brandId"),
    productPage: parseNonNegativeInt(params, "productPage", 0),
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
  if (state.page && state.page > 0) params.set("page", String(state.page));
  if (state.brandId) params.set("brandId", String(state.brandId));
  if (state.productPage && state.productPage > 0)
    params.set("productPage", String(state.productPage));
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

/**
 * Monta o href de detalhes do produto incluindo o returnTo quando houver query.
 */
export function buildProductDetailsHref(
  productId: number,
  returnTo: string,
): string {
  const base = `/dashboard/product/${productId}`;
  if (!returnTo.includes("?")) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}
