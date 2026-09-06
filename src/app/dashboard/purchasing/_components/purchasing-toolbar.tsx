"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  REGISTRY_DEFAULT_PAGE_LIMIT,
  RegistryActiveFilters,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import {
  buildPurchasingUrl,
  PURCHASING_SORT_OPTIONS,
  parsePurchasingFilters,
} from "./lib/search-params";
import { PurchasingFilterPanel } from "./purchasing-filter-panel";
import type {
  PurchasingCategoryOption,
  PurchasingFilters,
  PurchasingPanelFilter,
} from "./types/purchasing-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "purchasing:product-view-mode";

const PANEL_DEFAULTS: Pick<PurchasingFilters, PurchasingPanelFilter> = {
  categoryId: undefined,
  brandId: undefined,
  typeId: undefined,
  supplierId: undefined,
  salesList: 0,
  stockList: 0,
  advancedFilter: 0,
  origin: 0,
  premium: false,
  criticality: 0,
  sort: "name-desc",
  pageLimit: REGISTRY_DEFAULT_PAGE_LIMIT,
};

const DEFAULT_FILTERS: PurchasingFilters = {
  searchTerm: "",
  ...PANEL_DEFAULTS,
};

interface PurchasingToolbarProps {
  brands: UIBrand[];
  categories: PurchasingCategoryOption[];
  ptypes: UIPtype[];
  grid: ReactNode;
  list: ReactNode;
}

const SALES_LABELS = [
  "",
  "Mais vendidos",
  "Menos vendidos",
  "Produtos encalhados",
];
const STOCK_LABELS = [
  "",
  "Com estoque",
  "Estoque até 2",
  "Últimos cadastrados",
];
const ADVANCED_LABELS = ["", "Atacado menor que 1", "Produtos de serviço"];
const ORIGIN_LABELS = ["", "Importados", "Nacionais"];

export function PurchasingToolbar({
  brands,
  categories,
  ptypes,
  grid,
  list,
}: PurchasingToolbarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useMemo(
    () => parsePurchasingFilters(searchParams),
    [searchParams],
  );
  const latestFilters = useRef(filters);
  latestFilters.current = filters;

  const updateFilters = useCallback(
    (next: PurchasingFilters) => {
      latestFilters.current = next;
      startTransition(() => router.replace(buildPurchasingUrl(next)));
    },
    [router],
  );

  const updateSearch = useCallback(
    (searchTerm: string) =>
      updateFilters({ ...latestFilters.current, searchTerm }),
    [updateFilters],
  );

  const activeFilters = useMemo(() => {
    const result: Array<{ key: string; label: string; value: string }> = [];
    const add = (
      condition: boolean,
      key: string,
      label: string,
      value: string,
    ) => {
      if (condition) result.push({ key, label, value });
    };
    add(
      Boolean(filters.searchTerm),
      "searchTerm",
      "Pesquisa",
      filters.searchTerm,
    );
    add(
      Boolean(filters.categoryId),
      "categoryId",
      "Categoria",
      categories.find((item) => item.id === filters.categoryId)?.name ??
        String(filters.categoryId ?? ""),
    );
    add(
      Boolean(filters.brandId),
      "brandId",
      "Marca",
      brands.find((item) => item.id === filters.brandId)?.name ??
        String(filters.brandId ?? ""),
    );
    add(
      Boolean(filters.typeId),
      "typeId",
      "Tipo",
      ptypes.find((item) => item.id === filters.typeId)?.name ??
        String(filters.typeId ?? ""),
    );
    add(
      Boolean(filters.supplierId),
      "supplierId",
      "Fornecedor",
      String(filters.supplierId ?? ""),
    );
    add(
      filters.salesList !== 0,
      "salesList",
      "Lista de vendas",
      SALES_LABELS[filters.salesList],
    );
    add(
      filters.stockList !== 0,
      "stockList",
      "Lista de estoque",
      STOCK_LABELS[filters.stockList],
    );
    add(
      filters.advancedFilter !== 0,
      "advancedFilter",
      "Filtro avançado",
      ADVANCED_LABELS[filters.advancedFilter],
    );
    add(
      filters.origin !== 0,
      "origin",
      "Origem",
      ORIGIN_LABELS[filters.origin],
    );
    add(filters.premium, "premium", "Premium", "Somente premium");
    add(
      filters.criticality !== 0,
      "criticality",
      "Criticidade",
      `Nível ${filters.criticality}`,
    );
    add(
      filters.sort !== "name-desc",
      "sort",
      "Ordenação",
      PURCHASING_SORT_OPTIONS.find((item) => item.value === filters.sort)
        ?.label ?? filters.sort,
    );
    add(
      filters.pageLimit !== REGISTRY_DEFAULT_PAGE_LIMIT,
      "pageLimit",
      "Por página",
      String(filters.pageLimit),
    );
    return result;
  }, [brands, categories, filters, ptypes]);

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "searchTerm") {
        updateFilters({ ...latestFilters.current, searchTerm: "" });
        return;
      }
      const panelKey = key as PurchasingPanelFilter;
      updateFilters({
        ...latestFilters.current,
        [panelKey]: PANEL_DEFAULTS[panelKey],
      });
    },
    [updateFilters],
  );

  const panelActiveCount = activeFilters.filter(
    ({ key }) => key !== "searchTerm",
  ).length;
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={filters.searchTerm}
            placeholder="Buscar por ID, nome, referência ou modelo..."
            accessibleLabel="Pesquisar produtos com necessidade de compra"
            pending={pending}
            onSearch={updateSearch}
          />
          <PurchasingFilterPanel
            filters={filters}
            brands={brands}
            categories={categories}
            ptypes={ptypes}
            open={filterOpen}
            pending={pending}
            activeCount={panelActiveCount}
            onOpenChange={setFilterOpen}
            onApply={updateFilters}
            onClear={() =>
              updateFilters({
                ...latestFilters.current,
                ...PANEL_DEFAULTS,
              })
            }
          />
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
        </div>
      </div>

      <RegistryActiveFilters
        filters={activeFilters}
        pending={pending}
        onRemove={removeFilter}
        onClear={() => updateFilters(DEFAULT_FILTERS)}
      />

      <p className="sr-only" aria-live="polite">
        {pending ? "Atualizando consulta" : "Consulta atualizada"}
      </p>
      <RegistryResults pending={pending}>
        {viewMode === "grid" ? grid : list}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="necessidade de compra"
        filterCount={panelActiveCount}
        filterOpen={filterOpen}
        onOpenFilters={() => setFilterOpen(true)}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
    </div>
  );
}
