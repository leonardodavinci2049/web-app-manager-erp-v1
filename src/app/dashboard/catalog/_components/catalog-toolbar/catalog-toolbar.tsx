"use client";

import { PackagePlus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { CatalogMobileBottomBar } from "../catalog-mobile-bottom-bar";
import {
  buildCatalogUrl,
  parseCatalogSearchParams,
  SORT_OPTIONS,
} from "../lib/search-params";
import { NewProductSheet } from "../new-product/new-product-sheet";
import type {
  CatalogFilters,
  CategoryOption,
  NewProductTaxonomyOption,
  PanelFilterType,
  ViewMode,
} from "../types/catalog-types";
import { CatalogActiveFiltersPanel } from "./catalog-active-filters-panel";
import { CatalogSearch } from "./catalog-search";
import { FilterPanel } from "./filter-panel/filter-panel";
import { ViewModeToggle } from "./view-mode-toggle";

const VIEW_MODE_STORAGE_KEY = "catalog:product-view-mode";

const PANEL_FILTER_DEFAULTS: Pick<CatalogFilters, PanelFilterType> = {
  selectedCategory: "all",
  selectedBrand: undefined,
  selectedPtype: undefined,
  supplierId: undefined,
  physicalId: undefined,
  ean: "",
  salesList: 0,
  stockList: 0,
  advancedFilter: 0,
  variousList: 0,
  operationList: 0,
  startDate: "",
  endDate: "",
  hasNoImage: false,
  hasNoDescription: false,
  hasNoSalesCopy: false,
  importedStatus: 0,
  inactiveStatus: 2,
  isPremium: false,
  sortBy: "newest",
};

const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  searchTerm: "",
  ...PANEL_FILTER_DEFAULTS,
};

type ActiveFilterType = PanelFilterType | "search";

interface ActiveFilter {
  type: ActiveFilterType;
  label: string;
  value: string;
}

interface CatalogToolbarProps {
  products: UIProductManager[];
  total: number;
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  newProductTaxonomy: NewProductTaxonomyOption[];
  isNewProductTaxonomyAvailable: boolean;
  grid: ReactNode;
  list: ReactNode;
}

/**
 * Toolbar client que mantem filtros de dados na URL e a preferencia de
 * visualizacao no localStorage.
 */
export function CatalogToolbar({
  products,
  total,
  brands,
  categories,
  ptypes,
  newProductTaxonomy,
  isNewProductTaxonomyAvailable,
  grid,
  list,
}: CatalogToolbarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => parseCatalogSearchParams(searchParams),
    [searchParams],
  );
  const latestFiltersRef = useRef(filters);

  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  const updateFilters = useCallback(
    (newFilters: CatalogFilters) => {
      latestFiltersRef.current = newFilters;
      startTransition(() => {
        router.replace(buildCatalogUrl(newFilters, pathname));
      });
    },
    [router, pathname],
  );

  const updateFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      updateFilters({ ...latestFiltersRef.current, [key]: value });
    },
    [updateFilters],
  );

  const handleSearch = useCallback(
    (term: string) => updateFilter("searchTerm", term),
    [updateFilter],
  );

  const handleClearPanelFilters = useCallback(() => {
    updateFilters({
      ...latestFiltersRef.current,
      ...PANEL_FILTER_DEFAULTS,
    });
  }, [updateFilters]);

  const handleClearSearchAndFilters = useCallback(() => {
    updateFilters(DEFAULT_CATALOG_FILTERS);
  }, [updateFilters]);

  const removeActiveFilter = useCallback(
    (filterType: ActiveFilterType) => {
      if (filterType === "search") {
        updateFilter("searchTerm", "");
        return;
      }

      updateFilters({
        ...latestFiltersRef.current,
        [filterType]: PANEL_FILTER_DEFAULTS[filterType],
      });
    },
    [updateFilter, updateFilters],
  );

  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];
    const add = (
      condition: boolean,
      type: ActiveFilterType,
      label: string,
      value: string,
    ) => {
      if (condition) result.push({ type, label, value });
    };

    add(
      filters.searchTerm.trim() !== "",
      "search",
      "Pesquisa",
      filters.searchTerm,
    );
    if (filters.selectedCategory !== "all") {
      const category = categories.find(
        (item) => item.id.toString() === filters.selectedCategory,
      );
      result.push({
        type: "selectedCategory",
        label: "Categoria",
        value: category?.name ?? filters.selectedCategory,
      });
    }
    if (filters.selectedBrand) {
      const brand = brands.find(
        (item) => item.id.toString() === filters.selectedBrand,
      );
      result.push({
        type: "selectedBrand",
        label: "Marca",
        value: brand?.name ?? filters.selectedBrand,
      });
    }
    if (filters.selectedPtype) {
      const ptype = ptypes.find(
        (item) => item.id.toString() === filters.selectedPtype,
      );
      result.push({
        type: "selectedPtype",
        label: "Tipo",
        value: ptype?.name ?? filters.selectedPtype,
      });
    }

    add(
      Boolean(filters.supplierId),
      "supplierId",
      "ID do fornecedor",
      String(filters.supplierId ?? ""),
    );
    add(
      Boolean(filters.physicalId),
      "physicalId",
      "ID do produto físico",
      String(filters.physicalId ?? ""),
    );
    add(filters.ean !== "", "ean", "EAN", filters.ean);
    const salesListLabels = [
      "",
      "Mais vendidos",
      "Menos vendidos",
      "Produtos encalhados",
    ];
    add(
      filters.salesList !== 0,
      "salesList",
      "Lista de vendas",
      salesListLabels[filters.salesList],
    );
    const stockListLabels = [
      "",
      "Produtos com estoque",
      "Estoque menor ou igual a 2",
      "Últimos cadastrados",
    ];
    add(
      filters.stockList !== 0,
      "stockList",
      "Lista de estoque",
      stockListLabels[filters.stockList],
    );
    const advancedFilterLabels = [
      "",
      "Preço de atacado menor que 1",
      "Produtos de serviço",
    ];
    add(
      filters.advancedFilter !== 0,
      "advancedFilter",
      "Filtro avançado",
      advancedFilterLabels[filters.advancedFilter],
    );
    const variousListLabels = [
      "",
      "Produtos em promoção",
      "Produtos em destaque",
      "Produtos consignados",
      "Produtos descontinuados",
      "Sem controle de estoque",
      "Desativados para o website",
    ];
    add(
      filters.variousList !== 0,
      "variousList",
      "Lista adicional",
      variousListLabels[filters.variousList],
    );
    add(
      filters.operationList === 1,
      "operationList",
      "Período de cadastro",
      `${filters.startDate} até ${filters.endDate}`,
    );
    add(filters.hasNoImage, "hasNoImage", "Imagem", "Produtos sem imagem");
    add(
      filters.hasNoDescription,
      "hasNoDescription",
      "Descrição",
      "Produtos sem descrição",
    );
    add(
      filters.hasNoSalesCopy,
      "hasNoSalesCopy",
      "Descrição de venda",
      "Produtos sem descrição de venda",
    );
    add(
      filters.importedStatus !== 0,
      "importedStatus",
      "Origem",
      filters.importedStatus === 1 ? "Importados" : "Nacionais",
    );
    add(
      filters.inactiveStatus !== 2,
      "inactiveStatus",
      "Situação",
      filters.inactiveStatus === 0 ? "Todos" : "Inativos",
    );
    add(filters.isPremium, "isPremium", "Premium", "Produtos premium");

    if (filters.sortBy !== "newest") {
      const sort = SORT_OPTIONS.find((item) => item.value === filters.sortBy);
      result.push({
        type: "sortBy",
        label: "Ordenação",
        value: sort?.label ?? filters.sortBy,
      });
    }

    return result;
  }, [filters, categories, brands, ptypes]);

  const panelActiveFilters = activeFilters.filter(
    (filter): filter is ActiveFilter & { type: PanelFilterType } =>
      filter.type !== "search",
  );
  const panelFilterCount = panelActiveFilters.length;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const handleProductCreated = useCallback(() => {
    latestFiltersRef.current = DEFAULT_CATALOG_FILTERS;
    startTransition(() => {
      router.replace(buildCatalogUrl(DEFAULT_CATALOG_FILTERS, pathname));
      router.refresh();
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, router]);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "list" || stored === "grid") setViewMode(stored);
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
    setHydrated(true);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }, []);

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 flex justify-center border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex w-full max-w-xl flex-col gap-2 lg:max-w-4xl">
          <CatalogSearch
            searchTerm={filters.searchTerm}
            isLoading={isPending}
            onSearch={handleSearch}
            actions={
              <>
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  brands={brands}
                  ptypes={ptypes}
                  isOpen={isFilterOpen}
                  isLoading={isPending}
                  panelActiveFilters={panelActiveFilters}
                  panelFilterCount={panelFilterCount}
                  onOpenChange={setIsFilterOpen}
                  onFilterChange={updateFilter}
                  onClearPanelFilters={handleClearPanelFilters}
                  onRemovePanelFilter={removeActiveFilter}
                />
                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={handleViewModeChange}
                />
                <Button
                  type="button"
                  className="hidden h-11 shrink-0 gap-2 shadow-sm md:inline-flex"
                  onClick={() => setIsNewProductOpen(true)}
                >
                  <PackagePlus className="size-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Adicionar produto</span>
                </Button>
              </>
            }
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="w-full max-w-xl lg:max-w-4xl">
            <CatalogActiveFiltersPanel
              activeFilters={activeFilters}
              loadedProductsCount={products.length}
              filteredProductsTotal={total}
              isLoading={isPending}
              onClear={handleClearSearchAndFilters}
              onRemove={(type) => removeActiveFilter(type as ActiveFilterType)}
            />
          </div>
        </div>
      )}

      <div className="relative">
        {isPending && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="border-primary border-t-transparent h-6 w-6 animate-spin rounded-full border-2" />
                <span className="text-lg font-medium">
                  Pesquisando produtos...
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Aguarde enquanto carregamos os resultados
              </p>
            </div>
          </div>
        )}
        <div className={isPending ? "opacity-50" : undefined}>
          {hydrated && viewMode === "list" ? list : grid}
        </div>
      </div>

      <CatalogMobileBottomBar
        filterCount={panelFilterCount}
        isFilterOpen={isFilterOpen}
        isNewProductOpen={isNewProductOpen}
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenNewProduct={() => setIsNewProductOpen(true)}
      />

      <NewProductSheet
        open={isNewProductOpen}
        brands={brands}
        ptypes={ptypes}
        taxonomyOptions={newProductTaxonomy}
        isTaxonomyAvailable={isNewProductTaxonomyAvailable}
        onOpenChange={setIsNewProductOpen}
        onCreated={handleProductCreated}
      />
    </div>
  );
}
