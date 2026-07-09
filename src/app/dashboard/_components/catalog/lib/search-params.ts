import type { CatalogFilters, SortOption } from "../types/catalog-types";

const DEFAULT_SORT: SortOption = "newest";
const DEFAULT_CATEGORY = "all";

type SearchParamValue = string | string[] | undefined;

/**
 * Mapeia a opcao de ordenacao da UI para o contrato da API `product-pdv`.
 * Centraliza o conhecimento do contrato de sort fora da camada de rota.
 */
export function mapSortToApiParams(sortBy?: string): {
  columnId: number;
  orderId: number;
} {
  switch (sortBy) {
    case "name-asc":
      return { columnId: 1, orderId: 1 };
    case "name-desc":
      return { columnId: 1, orderId: 2 };
    case "newest":
      return { columnId: 2, orderId: 2 };
    case "price-asc":
      return { columnId: 3, orderId: 1 };
    case "price-desc":
      return { columnId: 3, orderId: 2 };
    default:
      return { columnId: 2, orderId: 2 };
  }
}

/**
 * Lista canonica de opcoes de ordenacao consumida pelo painel de filtros e
 * por qualquer outro ponto que precise espelhar o contrato sort <-> UI.
 */
export const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> =
  [
    { value: "name-asc", label: "Nome A-Z" },
    { value: "name-desc", label: "Nome Z-A" },
    { value: "newest", label: "Mais Recentes" },
    { value: "price-asc", label: "Menor Preço" },
    { value: "price-desc", label: "Maior Preço" },
  ];

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

/**
 * Constroi o estado de filtros do catalogo a partir de searchParams.
 * Fonte unica de verdade para a leitura URL -> objeto.
 */
export function parseCatalogSearchParams(
  sp: URLSearchParams | Record<string, SearchParamValue>,
): CatalogFilters {
  const params = normalizeParams(sp);
  return {
    searchTerm: params.get("search") ?? "",
    selectedCategory: params.get("category") ?? DEFAULT_CATEGORY,
    selectedBrand: params.get("brand") ?? undefined,
    selectedPtype: params.get("type") ?? undefined,
    onlyInStock: params.get("stock") === "1",
    sortBy: (params.get("sort") as SortOption | null) ?? DEFAULT_SORT,
  };
}

/**
 * Monta a URL do catalogo a partir dos filtros. Fonte unica de verdade para a
 * escrita objeto -> URL. O modo de visualizacao (grid/list) nao entra na URL:
 * e' uma preferencia de exibicao gerada no cliente (localStorage).
 */
export function buildCatalogUrl(
  filters: CatalogFilters,
  pathname: string,
): string {
  const params = new URLSearchParams();

  if (filters.searchTerm) params.set("search", filters.searchTerm);
  if (filters.selectedCategory && filters.selectedCategory !== DEFAULT_CATEGORY)
    params.set("category", filters.selectedCategory);
  if (filters.selectedBrand) params.set("brand", filters.selectedBrand);
  if (filters.selectedPtype) params.set("type", filters.selectedPtype);
  if (filters.onlyInStock) params.set("stock", "1");
  if (filters.sortBy && filters.sortBy !== DEFAULT_SORT)
    params.set("sort", filters.sortBy);

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Reconstrói a URL de retorno (returnTo) a partir dos searchParams atuais,
 * preservando filtros/view/limit para que o usuario volte ao mesmo estado.
 */
export function buildCatalogReturnTo(
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
