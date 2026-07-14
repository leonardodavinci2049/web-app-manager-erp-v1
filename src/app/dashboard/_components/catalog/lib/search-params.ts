import type { CatalogFilters, SortOption } from "../types/catalog-types";

const DEFAULT_SORT: SortOption = "newest";
const DEFAULT_CATEGORY = "all";
const VALID_SORT_OPTIONS = new Set<SortOption>([
  "name-asc",
  "name-desc",
  "newest",
  "price-asc",
  "price-desc",
]);

type SearchParamValue = string | string[] | undefined;

/**
 * Mapeia a opcao de ordenacao da UI para o contrato da API `product-manager`.
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

function parseText(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? "").trim().slice(0, 200);
}

function parsePositiveInteger(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const rawValue = params.get(key);
  if (!rawValue || !/^\d+$/.test(rawValue)) return undefined;
  const value = Number(rawValue);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function parseFlag(params: URLSearchParams, key: string): boolean {
  return params.get(key) === "1";
}

function parseSort(params: URLSearchParams): SortOption {
  const sort = params.get("sort") as SortOption | null;
  return sort && VALID_SORT_OPTIONS.has(sort) ? sort : DEFAULT_SORT;
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
    reference: parseText(params, "reference"),
    model: parseText(params, "model"),
    selectedCategory:
      parsePositiveInteger(params, "category")?.toString() ?? DEFAULT_CATEGORY,
    selectedBrand: parsePositiveInteger(params, "brand")?.toString(),
    selectedPtype: parsePositiveInteger(params, "type")?.toString(),
    supplierId: parsePositiveInteger(params, "supplier"),
    physicalId: parsePositiveInteger(params, "physical"),
    ean: parseText(params, "ean"),
    onlyInStock: parseFlag(params, "stock"),
    isService: parseFlag(params, "service"),
    hasNoImage: parseFlag(params, "no-image"),
    hasNoDescription: parseFlag(params, "no-description"),
    hasNoSalesCopy: parseFlag(params, "no-sales-copy"),
    isPromotion: parseFlag(params, "promotion"),
    isFeatured: parseFlag(params, "featured"),
    isImported: parseFlag(params, "imported"),
    isInactive: parseFlag(params, "inactive"),
    isConsignment: parseFlag(params, "consignment"),
    isDiscontinued: parseFlag(params, "discontinued"),
    hasNoInventory: parseFlag(params, "no-inventory"),
    isLowestSelling: parseFlag(params, "lowest-selling"),
    isStalled: parseFlag(params, "stalled"),
    isLatestArrival: parseFlag(params, "latest-arrivals"),
    hasPriceLessThanOne: parseFlag(params, "price-less-than"),
    lowStockThreshold: parsePositiveInteger(params, "low-stock"),
    sortBy: parseSort(params),
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
  if (filters.reference) params.set("reference", filters.reference);
  if (filters.model) params.set("model", filters.model);
  if (filters.selectedCategory && filters.selectedCategory !== DEFAULT_CATEGORY)
    params.set("category", filters.selectedCategory);
  if (filters.selectedBrand) params.set("brand", filters.selectedBrand);
  if (filters.selectedPtype) params.set("type", filters.selectedPtype);
  if (filters.supplierId) params.set("supplier", String(filters.supplierId));
  if (filters.physicalId) params.set("physical", String(filters.physicalId));
  if (filters.ean) params.set("ean", filters.ean);
  if (filters.onlyInStock) params.set("stock", "1");
  if (filters.isService) params.set("service", "1");
  if (filters.hasNoImage) params.set("no-image", "1");
  if (filters.hasNoDescription) params.set("no-description", "1");
  if (filters.hasNoSalesCopy) params.set("no-sales-copy", "1");
  if (filters.isPromotion) params.set("promotion", "1");
  if (filters.isFeatured) params.set("featured", "1");
  if (filters.isImported) params.set("imported", "1");
  if (filters.isInactive) params.set("inactive", "1");
  if (filters.isConsignment) params.set("consignment", "1");
  if (filters.isDiscontinued) params.set("discontinued", "1");
  if (filters.hasNoInventory) params.set("no-inventory", "1");
  if (filters.isLowestSelling) params.set("lowest-selling", "1");
  if (filters.isStalled) params.set("stalled", "1");
  if (filters.isLatestArrival) params.set("latest-arrivals", "1");
  if (filters.hasPriceLessThanOne) params.set("price-less-than", "1");
  if (filters.lowStockThreshold)
    params.set("low-stock", String(filters.lowStockThreshold));
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
