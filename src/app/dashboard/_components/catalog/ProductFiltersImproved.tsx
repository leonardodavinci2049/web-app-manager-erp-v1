"use client";

import { Grid3X3, List, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions, ViewMode } from "@/types/types";
import { FloatingProductFiltersPanel } from "./floating-product-filters-panel";

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string;
}

interface ProductFiltersImprovedProps {
  filters: FilterOptions;
  categories: CategoryOption[];
  brands: UIBrand[];
  ptypes: UIPtype[];
  viewMode: ViewMode;
  onFiltersChange: (filters: FilterOptions) => void;
  onViewModeChange: (mode: ViewMode) => void;
  totalProducts: number;
  displayedProducts: number;
  isLoading?: boolean;
}

export type PanelFilterType = "category" | "brand" | "ptype" | "stock";

type ActiveFilterType = PanelFilterType | "search" | "stock";

interface ActiveFilter {
  type: ActiveFilterType;
  label: string;
}

export function ProductFiltersImproved({
  filters,
  categories,
  brands,
  ptypes,
  viewMode,
  onFiltersChange,
  onViewModeChange,
  totalProducts,
  displayedProducts,
  isLoading = false,
}: ProductFiltersImprovedProps) {
  const [searchInputValue, setSearchInputValue] = useState(filters.searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearchInputValue(filters.searchTerm);
  }, [filters.searchTerm]);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    if (searchInputValue.trim() !== filters.searchTerm) {
      updateFilter("searchTerm", searchInputValue.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchInputValue("");
    if (filters.searchTerm !== "") {
      updateFilter("searchTerm", "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Aplica o filtro e fecha o painel
  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, selectedCategory: categoryId });
    setIsFilterOpen(false);
  };

  const handleBrandChange = (brandId: string) => {
    onFiltersChange({
      ...filters,
      selectedBrand: brandId === "all" ? undefined : brandId,
    });
    setIsFilterOpen(false);
  };

  const handlePtypeChange = (ptypeId: string) => {
    onFiltersChange({
      ...filters,
      selectedPtype: ptypeId === "all" ? undefined : ptypeId,
    });
    setIsFilterOpen(false);
  };

  // Limpa apenas os filtros do painel (categoria, marca, tipo e estoque)
  const handleClearPanelFilters = () => {
    onFiltersChange({
      ...filters,
      selectedCategory: "all",
      selectedBrand: undefined,
      selectedPtype: undefined,
      onlyInStock: false,
    });
  };

  const removePanelFilter = (filterType: PanelFilterType) => {
    switch (filterType) {
      case "category":
        onFiltersChange({ ...filters, selectedCategory: "all" });
        break;
      case "brand":
        onFiltersChange({ ...filters, selectedBrand: undefined });
        break;
      case "ptype":
        onFiltersChange({ ...filters, selectedPtype: undefined });
        break;
      case "stock":
        onFiltersChange({ ...filters, onlyInStock: false });
        break;
    }
  };

  const getActiveFilters = () => {
    const activeFilters: ActiveFilter[] = [];

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      activeFilters.push({
        type: "search" as const,
        label: `Busca: "${filters.searchTerm}"`,
      });
    }

    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.selectedCategory,
      );
      activeFilters.push({
        type: "category" as const,
        label: `Categoria: ${selectedCategory?.name || filters.selectedCategory}`,
      });
    }

    if (filters.selectedBrand) {
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === filters.selectedBrand,
      );
      activeFilters.push({
        type: "brand" as const,
        label: `Marca: ${selectedBrand?.name || filters.selectedBrand}`,
      });
    }

    if (filters.selectedPtype) {
      const selectedPtype = ptypes.find(
        (ptype) => ptype.id.toString() === filters.selectedPtype,
      );
      activeFilters.push({
        type: "ptype" as const,
        label: `Tipo: ${selectedPtype?.name || filters.selectedPtype}`,
      });
    }

    if (filters.onlyInStock) {
      activeFilters.push({
        type: "stock" as const,
        label: "Apenas em Estoque",
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  const panelActiveFilters = activeFilters.filter(
    (f): f is ActiveFilter & { type: PanelFilterType } =>
      f.type === "category" ||
      f.type === "brand" ||
      f.type === "ptype" ||
      f.type === "stock",
  );
  const panelFilterCount = panelActiveFilters.length;

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa + Botão de Filtros */}
      <div className="flex items-center justify-center w-full">
        <div className="flex items-center gap-2 w-full max-w-xl lg:max-w-2xl">
          {/* Grupo de busca: Input + Pesquisar */}
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative flex-1 group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              </div>
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-11 rounded-r-none border-r-0 pl-10 pr-9 text-sm shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                disabled={isLoading}
              />
              {searchInputValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Botão Pesquisar integrado */}
            <Button
              onClick={handleSearch}
              disabled={
                isLoading || searchInputValue.trim() === filters.searchTerm
              }
              className="h-11 rounded-l-none px-4 sm:px-5 gap-2 shadow-sm shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-sm">Pesquisar</span>
            </Button>
          </div>

          <FloatingProductFiltersPanel
            filters={filters}
            categories={categories}
            brands={brands}
            ptypes={ptypes}
            isOpen={isFilterOpen}
            isLoading={isLoading}
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
        </div>
      </div>

      {/* Controles de Filtro, Visualização e Contador de Resultados */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-4 sm:relative">
        <div className="flex flex-col gap-4 sm:gap-0">
          {/* Layout Mobile: 2 linhas | Desktop: 1 linha */}
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            {/* Contador de Resultados */}
            <div className="flex flex-col gap-1 sm:flex-1">
              <span className="text-sm font-medium">
                {displayedProducts} de {totalProducts} produtos
              </span>
              {hasActiveFilters && (
                <span className="text-xs text-muted-foreground">
                  {activeFilters.length} filtro
                  {activeFilters.length !== 1 ? "s" : ""} ativo
                  {activeFilters.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="flex items-center rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="rounded-r-none"
                  disabled={isLoading}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="rounded-l-none"
                  disabled={isLoading}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
