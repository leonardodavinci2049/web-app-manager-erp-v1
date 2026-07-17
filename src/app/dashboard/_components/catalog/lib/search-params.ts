import type {
  AdvancedFilterFlag,
  CatalogFilters,
  OperationListFlag,
  SalesListFlag,
  SortOption,
  StockListFlag,
  TernaryFlag,
  VariousListFlag,
} from "../types/catalog-types";

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

function parseIntegerInRange<T extends number>(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
  defaultValue: T,
): T {
  const rawValue = params.get(key);
  if (rawValue === null || !/^\d+$/.test(rawValue)) return defaultValue;
  const value = Number(rawValue);
  return value >= min && value <= max ? (value as T) : defaultValue;
}

function parseTernaryFlag(
  params: URLSearchParams,
  key: string,
  defaultValue: TernaryFlag,
): TernaryFlag {
  const rawValue = params.get(key);
  if (rawValue === null) return defaultValue;
  const value = Number(rawValue);
  return value === 0 || value === 1 || value === 2 ? value : defaultValue;
}

function parseDate(params: URLSearchParams, key: string): string {
  const value = params.get(key) ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultRegistrationPeriod(): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7,
  );
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  return {
    startDate: formatDateInputValue(startDate),
    endDate: formatDateInputValue(endDate),
  };
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
  const defaultPeriod = getDefaultRegistrationPeriod();
  const startDate = parseDate(params, "start-date") || defaultPeriod.startDate;
  const endDate = parseDate(params, "end-date") || defaultPeriod.endDate;
  return {
    searchTerm: (params.get("search") ?? "").trim().slice(0, 300),
    selectedCategory:
      parsePositiveInteger(params, "category")?.toString() ?? DEFAULT_CATEGORY,
    selectedBrand: parsePositiveInteger(params, "brand")?.toString(),
    selectedPtype: parsePositiveInteger(params, "type")?.toString(),
    supplierId: parsePositiveInteger(params, "supplier"),
    physicalId: parsePositiveInteger(params, "physical"),
    ean: parseText(params, "ean"),
    salesList: parseIntegerInRange<SalesListFlag>(
      params,
      "sales-list",
      0,
      3,
      0,
    ),
    stockList: parseIntegerInRange<StockListFlag>(
      params,
      "stock-list",
      0,
      3,
      0,
    ),
    advancedFilter: parseIntegerInRange<AdvancedFilterFlag>(
      params,
      "advanced",
      0,
      2,
      0,
    ),
    variousList: parseIntegerInRange<VariousListFlag>(
      params,
      "various-list",
      0,
      6,
      0,
    ),
    operationList:
      startDate && endDate && startDate <= endDate
        ? parseIntegerInRange<OperationListFlag>(
            params,
            "registration-period",
            0,
            1,
            0,
          )
        : 0,
    startDate,
    endDate,
    hasNoImage: parseFlag(params, "no-image"),
    hasNoDescription: parseFlag(params, "no-description"),
    hasNoSalesCopy: parseFlag(params, "no-sales-copy"),
    importedStatus: parseTernaryFlag(params, "imported", 0),
    inactiveStatus: parseTernaryFlag(params, "inactive", 2),
    isPremium: parseFlag(params, "premium"),
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
  if (filters.selectedCategory && filters.selectedCategory !== DEFAULT_CATEGORY)
    params.set("category", filters.selectedCategory);
  if (filters.selectedBrand) params.set("brand", filters.selectedBrand);
  if (filters.selectedPtype) params.set("type", filters.selectedPtype);
  if (filters.supplierId) params.set("supplier", String(filters.supplierId));
  if (filters.physicalId) params.set("physical", String(filters.physicalId));
  if (filters.ean) params.set("ean", filters.ean);
  if (filters.salesList !== 0)
    params.set("sales-list", String(filters.salesList));
  if (filters.stockList !== 0)
    params.set("stock-list", String(filters.stockList));
  if (filters.advancedFilter !== 0)
    params.set("advanced", String(filters.advancedFilter));
  if (filters.variousList !== 0)
    params.set("various-list", String(filters.variousList));
  if (
    filters.operationList === 1 &&
    filters.startDate &&
    filters.endDate &&
    filters.startDate <= filters.endDate
  ) {
    params.set("registration-period", "1");
    params.set("start-date", filters.startDate);
    params.set("end-date", filters.endDate);
  }
  if (filters.hasNoImage) params.set("no-image", "1");
  if (filters.hasNoDescription) params.set("no-description", "1");
  if (filters.hasNoSalesCopy) params.set("no-sales-copy", "1");
  if (filters.importedStatus !== 0)
    params.set("imported", String(filters.importedStatus));
  if (filters.inactiveStatus !== 2)
    params.set("inactive", String(filters.inactiveStatus));
  if (filters.isPremium) params.set("premium", "1");
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
