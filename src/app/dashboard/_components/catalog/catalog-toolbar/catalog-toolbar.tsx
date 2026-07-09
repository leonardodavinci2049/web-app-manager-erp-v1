"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
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
import { CatalogSearch } from "./catalog-search";
import { FilterPanel } from "./filter-panel/filter-panel";
import { ViewModeToggle } from "./view-mode-toggle";

type ActiveFilterType = PanelFilterType | "search";
type PendingNavigationType = "data" | "view" | null;

interface ActiveFilter {
  type: ActiveFilterType;
  label: string;
}

interface CatalogToolbarProps {
  products: UIProductPdv[];
  brands: UIBrand[];
  categories: CategoryOption[];
  ptypes: UIPtype[];
  viewMode: ViewMode;
  /** Grid de produtos (Server Component) renderizado como children. */
  children: ReactNode;
}

/**
 * Toolbar do catalogo (Client). Orquestra leitura/escrita de searchParams,
 * transicoes de URL e o overlay de carregamento sobre o grid (children).
 *
 * O grid e passado como `children` (Server Component) para que o overlay de
 * `isPending` envolva uma unica arvore, evitando a duplicacao anterior.
 */
export function CatalogToolbar({
  products,
  brands,
  categories,
  ptypes,
  viewMode,
  children,
}: CatalogToolbarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingNavigationType, setPendingNavigationType] =
    useState<PendingNavigationType>(null);

  const filters = useMemo(
    () => parseCatalogSearchParams(searchParams),
    [searchParams],
  );

  const navigate = useCallback(
    (url: string, type: Exclude<PendingNavigationType, null> = "data") => {
      setPendingNavigationType(type);
      startTransition(() => router.replace(url));
    },
    [router],
  );

  useEffect(() => {
    if (!isPending) {
      setPendingNavigationType(null);
    }
  }, [isPending]);

  const updateFilters = useCallback(
    (newFilters: CatalogFilters) => {
      navigate(buildCatalogUrl(newFilters, viewMode, pathname));
    },
    [navigate, viewMode, pathname],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      navigate(buildCatalogUrl(filters, mode, pathname), "view");
    },
    [navigate, filters, pathname],
  );

  const updateFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      updateFilters({ ...filters, [key]: value });
    },
    [filters, updateFilters],
  );

  const handleSearch = useCallback(
    (term: string) => {
      updateFilters({ ...filters, searchTerm: term });
    },
    [filters, updateFilters],
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      updateFilters({ ...filters, selectedCategory: categoryId });
    },
    [filters, updateFilters],
  );

  const handleBrandChange = useCallback(
    (brandId: string) => {
      updateFilters({
        ...filters,
        selectedBrand: brandId === "all" ? undefined : brandId,
      });
    },
    [filters, updateFilters],
  );

  const handlePtypeChange = useCallback(
    (ptypeId: string) => {
      updateFilters({
        ...filters,
        selectedPtype: ptypeId === "all" ? undefined : ptypeId,
      });
    },
    [filters, updateFilters],
  );

  const handleClearPanelFilters = useCallback(() => {
    updateFilters({
      ...filters,
      selectedCategory: "all",
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
    });
  }, [filters, updateFilters]);

  const removePanelFilter = useCallback(
    (filterType: PanelFilterType) => {
      switch (filterType) {
        case "category":
          updateFilters({ ...filters, selectedCategory: "all" });
          break;
        case "brand":
          updateFilters({ ...filters, selectedBrand: undefined });
          break;
        case "ptype":
          updateFilters({ ...filters, selectedPtype: undefined });
          break;
        case "stock":
          updateFilters({ ...filters, onlyInStock: false });
          break;
      }
    },
    [filters, updateFilters],
  );

  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];

    if (filters.searchTerm.trim() !== "") {
      result.push({ type: "search", label: `Busca: "${filters.searchTerm}"` });
    }

    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.selectedCategory,
      );
      result.push({
        type: "category",
        label: `Categoria: ${selectedCategory?.name || filters.selectedCategory}`,
      });
    }

    if (filters.selectedBrand) {
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === filters.selectedBrand,
      );
      result.push({
        type: "brand",
        label: `Marca: ${selectedBrand?.name || filters.selectedBrand}`,
      });
    }

    if (filters.selectedPtype) {
      const selectedPtype = ptypes.find(
        (ptype) => ptype.id.toString() === filters.selectedPtype,
      );
      result.push({
        type: "ptype",
        label: `Tipo: ${selectedPtype?.name || filters.selectedPtype}`,
      });
    }

    if (filters.onlyInStock) {
      result.push({ type: "stock", label: "Apenas em Estoque" });
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

  const isDataPending = isPending && pendingNavigationType !== "view";

  return (
    <>
      <div className="space-y-6">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-full max-w-xl items-center gap-2 lg:max-w-2xl">
            <CatalogSearch
              searchTerm={filters.searchTerm}
              isLoading={isDataPending}
              onSearch={handleSearch}
              actions={
                <>
                  <FilterPanel
                    filters={filters}
                    categories={categories}
                    brands={brands}
                    ptypes={ptypes}
                    isOpen={isFilterOpen}
                    isLoading={isDataPending}
                    panelActiveFilters={panelActiveFilters}
                    panelFilterCount={panelFilterCount}
                    onOpenChange={setIsFilterOpen}
                    onCategoryChange={handleCategoryChange}
                    onBrandChange={handleBrandChange}
                    onPtypeChange={handlePtypeChange}
                    onOnlyInStockChange={(checked) =>
                      updateFilter("onlyInStock", checked)
                    }
                    onSortChange={(value) => updateFilter("sortBy", value)}
                    onClearPanelFilters={handleClearPanelFilters}
                    onRemovePanelFilter={removePanelFilter}
                  />

                  <ViewModeToggle
                    viewMode={viewMode}
                    isLoading={isPending}
                    onChange={handleViewModeChange}
                  />
                </>
              }
            />
          </div>
        </div>

        <div className="supports-[backdrop-filter]:bg-background/60 bg-background/95 rounded-lg border p-4 backdrop-blur sm:relative">
          <div className="flex flex-col gap-4 sm:gap-0">
            <div className="space-y-2 sm:flex sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col gap-1 sm:flex-1">
                <span className="text-sm font-medium">
                  {products.length} de {products.length} produtos
                </span>
                {hasActiveFilters && (
                  <span className="text-muted-foreground text-xs">
                    {activeFilters.length} filtro
                    {activeFilters.length !== 1 ? "s" : ""} ativo
                    {activeFilters.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {isDataPending && (
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
        <div className={isDataPending ? "opacity-50" : undefined}>
          {children}
        </div>
      </div>
    </>
  );
}
