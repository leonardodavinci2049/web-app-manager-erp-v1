"use client";

import { FolderTree, PackagePlus } from "lucide-react";
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
import {
  REGISTRY_DEFAULT_PAGE_LIMIT,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIProductManager } from "@/services/api-main/product-manager/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { transcribeCatalogVoiceAction } from "../../_actions/catalog-voice-actions";
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
} from "../types/catalog-types";
import { CatalogActiveFiltersPanel } from "./catalog-active-filters-panel";
import { FilterPanel } from "./filter-panel/filter-panel";

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
  pageLimit: REGISTRY_DEFAULT_PAGE_LIMIT,
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
    add(
      filters.pageLimit !== REGISTRY_DEFAULT_PAGE_LIMIT,
      "pageLimit",
      "Por página",
      String(filters.pageLimit),
    );

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
    const nextFilters: CatalogFilters = {
      ...DEFAULT_CATALOG_FILTERS,
      pageLimit: latestFiltersRef.current.pageLimit,
    };
    latestFiltersRef.current = nextFilters;
    startTransition(() => {
      router.replace(buildCatalogUrl(nextFilters, pathname));
      router.refresh();
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, router]);

  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 flex border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex w-full items-center gap-2">
          <RegistrySearch
            value={filters.searchTerm}
            placeholder="Buscar por ID, nome, referência ou modelo..."
            accessibleLabel="Pesquisar produtos"
            pending={isPending}
            onSearch={handleSearch}
            onTranscribeAudio={transcribeCatalogVoiceAction}
          />
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
            onFiltersChange={updateFilters}
            onClearPanelFilters={handleClearPanelFilters}
            onRemovePanelFilter={removeActiveFilter}
          />
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
          <Button
            type="button"
            className="hidden h-11 shrink-0 gap-2 shadow-sm md:ml-auto md:inline-flex"
            onClick={() => setIsNewProductOpen(true)}
            aria-label="+ Novo cadastro de produto"
          >
            <PackagePlus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">+ Novo Cadastro</span>
            <span className="sr-only lg:hidden">
              + Novo cadastro de produto
            </span>
          </Button>
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

      <RegistryResults pending={isPending}>
        {viewMode === "list" ? list : grid}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="catálogo"
        filterCount={panelFilterCount}
        filterOpen={isFilterOpen}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        onOpenFilters={() => setIsFilterOpen(true)}
        extraAction={{
          label: "Categorias",
          href: "/dashboard/category",
          icon: FolderTree,
        }}
        addLabel="Adicionar produto"
        addOpen={isNewProductOpen}
        onAdd={() => setIsNewProductOpen(true)}
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
