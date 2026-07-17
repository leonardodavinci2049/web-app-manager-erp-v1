"use client";

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
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import {
  buildCatalogUrl,
  parseCatalogSearchParams,
  SORT_OPTIONS,
} from "../lib/search-params";
import type {
  CatalogFilters,
  CategoryOption,
  PanelFilterType,
  ViewMode,
} from "../types/catalog-types";
import { CatalogActiveFiltersPanel } from "./catalog-active-filters-panel";
import { CatalogSearch } from "./catalog-search";
import { FilterPanel } from "./filter-panel/filter-panel";
import { ViewModeToggle } from "./view-mode-toggle";

const VIEW_MODE_STORAGE_KEY = "catalog:product-view-mode";

const PANEL_FILTER_DEFAULTS: Pick<CatalogFilters, PanelFilterType> = {
  reference: "",
  model: "",
  selectedCategory: "all",
  selectedBrand: undefined,
  selectedPtype: undefined,
  supplierId: undefined,
  physicalId: undefined,
  ean: "",
  onlyInStock: false,
  isService: false,
  hasNoImage: false,
  hasNoDescription: false,
  hasNoSalesCopy: false,
  isBestSeller: false,
  isPromotion: false,
  isFeatured: false,
  importedStatus: 0,
  inactiveStatus: 2,
  isPremium: false,
  isConsignment: false,
  isDiscontinued: false,
  hasNoInventory: false,
  isWebsiteOff: false,
  isLowestSelling: false,
  isStalled: false,
  isLatestArrival: false,
  hasPriceLessThanOne: false,
  hasLowStock: false,
  sortBy: "newest",
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
    updateFilters({
      searchTerm: "",
      ...PANEL_FILTER_DEFAULTS,
    });
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
    add(filters.reference !== "", "reference", "Referência", filters.reference);
    add(filters.model !== "", "model", "Modelo", filters.model);

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
    add(
      filters.onlyInStock,
      "onlyInStock",
      "Estoque",
      "Apenas produtos em estoque",
    );
    add(filters.isService, "isService", "Serviço", "Produtos de serviço");
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
    add(filters.isBestSeller, "isBestSeller", "Vendas", "Mais vendidos");
    add(filters.isPromotion, "isPromotion", "Promoção", "Produtos em promoção");
    add(filters.isFeatured, "isFeatured", "Destaque", "Produtos em destaque");
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
    add(
      filters.isConsignment,
      "isConsignment",
      "Consignação",
      "Produtos consignados",
    );
    add(
      filters.isDiscontinued,
      "isDiscontinued",
      "Descontinuação",
      "Produtos descontinuados",
    );
    add(
      filters.hasNoInventory,
      "hasNoInventory",
      "Controle de estoque",
      "Produtos sem controle de estoque",
    );
    add(
      filters.isWebsiteOff,
      "isWebsiteOff",
      "Website",
      "Desativados para o website",
    );
    add(filters.isLowestSelling, "isLowestSelling", "Vendas", "Menos vendidos");
    add(filters.isStalled, "isStalled", "Movimentação", "Produtos parados");
    add(
      filters.isLatestArrival,
      "isLatestArrival",
      "Cadastro",
      "Últimos cadastrados",
    );
    add(
      filters.hasPriceLessThanOne,
      "hasPriceLessThanOne",
      "Preço",
      "Atacado menor que 1",
    );
    add(
      filters.hasLowStock,
      "hasLowStock",
      "Estoque",
      "Produtos com estoque baixo",
    );

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
    <div className="space-y-4">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 flex justify-center border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex w-full max-w-xl flex-col gap-2 lg:max-w-2xl">
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
              </>
            }
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex w-full justify-center">
          <div className="w-full max-w-xl lg:max-w-2xl">
            <CatalogActiveFiltersPanel
              activeFilters={activeFilters}
              productsCount={products.length}
              total={total}
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
    </div>
  );
}
