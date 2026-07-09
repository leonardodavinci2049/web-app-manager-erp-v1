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
import type { UIProductPdv } from "@/services/api-main/product-pdv/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import {
  buildCatalogUrl,
  parseCatalogSearchParams,
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

type ActiveFilterType = PanelFilterType | "search";

interface ActiveFilter {
  type: ActiveFilterType;
  label: string;
  value: string;
}

interface CatalogToolbarProps {
  products: UIProductPdv[];
  /** Total de produtos que correspondem aos filtros (paginacao). */
  total: number;
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  /** Variante do grid (Server) em modo grade. */
  grid: ReactNode;
  /** Variante do grid (Server) em modo lista. */
  list: ReactNode;
}

/**
 * Toolbar do catalogo (Client). Orquestra leitura/escrita de searchParams
 * (filtros de dados) e o modo de visualizacao (preferencia client-side).
 *
 * O modo de visualizacao (grid/list) e' apenas apresentacao: fica no
 * localStorage e NUNCA na URL, evitando refetch ao alternar. As variantes
 * `grid`/`list` (Server Components) sao passadas pelo parent e apenas uma e
 * renderizada por vez — toggle instantaneo, sem travamento.
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

  // Ref that always holds the latest intended filters, updated synchronously.
  // Prevents stale closure reads during pending transitions: useSearchParams
  // returns the committed (old) value while startTransition is in flight, so
  // callbacks that spread `filters` would lose pending filter changes.
  const latestFiltersRef = useRef(filters);

  // Sync the ref whenever committed filters change (URL navigation settled).
  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  const updateFilters = useCallback(
    (newFilters: CatalogFilters) => {
      // Update ref synchronously so subsequent callbacks see the latest state
      // even before the transition commits.
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
    (term: string) => {
      updateFilters({ ...latestFiltersRef.current, searchTerm: term });
    },
    [updateFilters],
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setIsFilterOpenState(false);
      updateFilters({
        ...latestFiltersRef.current,
        selectedCategory: categoryId,
      });
    },
    [updateFilters],
  );

  const handleBrandChange = useCallback(
    (brandId: string) => {
      setIsFilterOpenState(false);
      updateFilters({
        ...latestFiltersRef.current,
        selectedBrand: brandId === "all" ? undefined : brandId,
      });
    },
    [updateFilters],
  );

  const handlePtypeChange = useCallback(
    (ptypeId: string) => {
      setIsFilterOpenState(false);
      updateFilters({
        ...latestFiltersRef.current,
        selectedPtype: ptypeId === "all" ? undefined : ptypeId,
      });
    },
    [updateFilters],
  );

  const handleOnlyInStockChange = useCallback(
    (checked: boolean) => {
      setIsFilterOpenState(false);
      updateFilter("onlyInStock", checked);
    },
    [updateFilter],
  );

  const handleSortChange = useCallback(
    (sortBy: CatalogFilters["sortBy"]) => {
      setIsFilterOpenState(false);
      updateFilter("sortBy", sortBy);
    },
    [updateFilter],
  );

  const handleClearPanelFilters = useCallback(() => {
    setIsFilterOpenState(false);
    updateFilters({
      ...latestFiltersRef.current,
      selectedCategory: "all",
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
    });
  }, [updateFilters]);

  const handleClearSearchAndFilters = useCallback(() => {
    updateFilters({
      ...latestFiltersRef.current,
      searchTerm: "",
      selectedCategory: "all",
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
    });
  }, [updateFilters]);

  const removePanelFilter = useCallback(
    (filterType: PanelFilterType) => {
      setIsFilterOpenState(false);
      const current = latestFiltersRef.current;
      switch (filterType) {
        case "category":
          updateFilters({ ...current, selectedCategory: "all" });
          break;
        case "brand":
          updateFilters({ ...current, selectedBrand: undefined });
          break;
        case "ptype":
          updateFilters({ ...current, selectedPtype: undefined });
          break;
        case "stock":
          updateFilters({ ...current, onlyInStock: false });
          break;
      }
    },
    [updateFilters],
  );

  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];

    if (filters.searchTerm.trim() !== "") {
      result.push({
        type: "search",
        label: "Pesquisa",
        value: filters.searchTerm,
      });
    }

    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.selectedCategory,
      );
      result.push({
        type: "category",
        label: "Categoria",
        value: selectedCategory?.name || filters.selectedCategory,
      });
    }

    if (filters.selectedBrand) {
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === filters.selectedBrand,
      );
      result.push({
        type: "brand",
        label: "Marca",
        value: selectedBrand?.name || filters.selectedBrand,
      });
    }

    if (filters.selectedPtype) {
      const selectedPtype = ptypes.find(
        (ptype) => ptype.id.toString() === filters.selectedPtype,
      );
      result.push({
        type: "ptype",
        label: "Tipo",
        value: selectedPtype?.name || filters.selectedPtype,
      });
    }

    if (filters.onlyInStock) {
      result.push({
        type: "stock",
        label: "Estoque",
        value: "Apenas em estoque",
      });
    }

    return result;
  }, [filters, categories, brands, ptypes]);

  const hasActiveFilters = activeFilters.length > 0;

  const panelActiveFilters = activeFilters.filter(
    (f): f is ActiveFilter & { type: PanelFilterType } =>
      f.type === "category" ||
      f.type === "brand" ||
      f.type === "ptype" ||
      f.type === "stock",
  );
  const panelFilterCount = panelActiveFilters.length;

  const [isFilterOpen, setIsFilterOpenState] = useState(false);

  const setIsFilterOpen = useCallback((open: boolean) => {
    setIsFilterOpenState(open);
  }, []);

  // Modo de visualizacao: preferencia client-side persistida no localStorage.
  // Sincroniza apenas apos hidratacao para evitar mismatch SSR.
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "list" || stored === "grid") {
        setViewMode(stored);
      }
    } catch {
      // ignora erros de acesso ao storage (modo privado, etc.)
    }
    setHydrated(true);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // ignora
    }
  }, []);

  return (
    <>
      <div className="space-y-4">
        <div className="flex w-full justify-center">
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
                    onCategoryChange={handleCategoryChange}
                    onBrandChange={handleBrandChange}
                    onPtypeChange={handlePtypeChange}
                    onOnlyInStockChange={handleOnlyInStockChange}
                    onSortChange={handleSortChange}
                    onClearPanelFilters={handleClearPanelFilters}
                    onRemovePanelFilter={removePanelFilter}
                  />

                  <ViewModeToggle
                    viewMode={viewMode}
                    onChange={handleViewModeChange}
                  />
                </>
              }
            />

            {hasActiveFilters && (
              <CatalogActiveFiltersPanel
                activeFilters={activeFilters}
                productsCount={products.length}
                total={total}
                isLoading={isPending}
                onClear={handleClearSearchAndFilters}
              />
            )}
          </div>
        </div>
      </div>

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
    </>
  );
}
