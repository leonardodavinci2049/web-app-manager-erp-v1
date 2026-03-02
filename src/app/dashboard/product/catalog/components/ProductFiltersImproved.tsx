"use client";

import { Filter, Grid3X3, List, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions, SortOption, ViewMode } from "@/types/types";

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
  onResetFilters: () => void;
  totalProducts: number;
  displayedProducts: number;
  isLoading?: boolean;
}

const sortOptions = [
  { value: "name-asc" as SortOption, label: "Nome A-Z" },
  { value: "name-desc" as SortOption, label: "Nome Z-A" },
  { value: "newest" as SortOption, label: "Mais Recentes" },
  { value: "price-asc" as SortOption, label: "Menor Preço" },
  { value: "price-desc" as SortOption, label: "Maior Preço" },
];

export function ProductFiltersImproved({
  filters,
  categories,
  brands,
  ptypes,
  viewMode,
  onFiltersChange,
  onViewModeChange,
  onResetFilters,
  totalProducts,
  displayedProducts,
  isLoading = false,
}: ProductFiltersImprovedProps) {
  // Estado local para o input de busca
  const [searchInputValue, setSearchInputValue] = useState(filters.searchTerm);

  // Sincronizar o input local quando os filtros mudam externamente
  useEffect(() => {
    setSearchInputValue(filters.searchTerm);
  }, [filters.searchTerm]);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Função para executar a busca
  const handleSearch = () => {
    if (searchInputValue.trim() !== filters.searchTerm) {
      updateFilter("searchTerm", searchInputValue.trim());
    }
  };

  // Função para limpar a busca
  const handleClearSearch = () => {
    setSearchInputValue("");
    if (filters.searchTerm !== "") {
      updateFilter("searchTerm", "");
    }
  };

  // Função para lidar com Enter no input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Função para resetar todos os filtros incluindo o input local
  const handleResetFilters = () => {
    setSearchInputValue(""); // Limpa o input local primeiro
    onResetFilters(); // Depois chama a função do pai
  };

  // Função para alterar categoria
  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      selectedCategory: categoryId,
    });
  };

  // Função para alterar marca
  const handleBrandChange = (brandId: string) => {
    onFiltersChange({
      ...filters,
      selectedBrand: brandId === "all" ? undefined : brandId,
    });
  };

  // Função para alterar tipo
  const handlePtypeChange = (ptypeId: string) => {
    onFiltersChange({
      ...filters,
      selectedPtype: ptypeId === "all" ? undefined : ptypeId,
    });
  };

  // Função para remover filtro específico
  const removeFilter = (
    filterType: "category" | "search" | "stock" | "brand" | "ptype",
  ) => {
    switch (filterType) {
      case "category":
        onFiltersChange({
          ...filters,
          selectedCategory: "all",
        });
        break;
      case "search":
        handleClearSearch();
        break;
      case "stock":
        updateFilter("onlyInStock", false);
        break;
      case "brand":
        onFiltersChange({
          ...filters,
          selectedBrand: undefined,
        });
        break;
      case "ptype":
        onFiltersChange({
          ...filters,
          selectedPtype: undefined,
        });
        break;
    }
  };

  // Calcular filtros ativos para exibir como badges
  const getActiveFilters = () => {
    const activeFilters = [];

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      activeFilters.push({
        type: "search" as const,
        label: `Busca: "${filters.searchTerm}"`,
        value: filters.searchTerm,
      });
    }

    if (filters.selectedCategory && filters.selectedCategory !== "all") {
      // Encontrar o nome da categoria selecionada
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.selectedCategory,
      );
      activeFilters.push({
        type: "category" as const,
        label: `Categoria: ${selectedCategory?.name || filters.selectedCategory}`,
        value: filters.selectedCategory,
      });
    }

    if (filters.selectedBrand) {
      // Encontrar o nome da marca selecionada
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === filters.selectedBrand,
      );
      activeFilters.push({
        type: "brand" as const,
        label: `Marca: ${selectedBrand?.name || filters.selectedBrand}`,
        value: filters.selectedBrand,
      });
    }

    if (filters.selectedPtype) {
      // Encontrar o nome do tipo selecionado
      const selectedPtype = ptypes.find(
        (ptype) => ptype.id.toString() === filters.selectedPtype,
      );
      activeFilters.push({
        type: "ptype" as const,
        label: `Tipo: ${selectedPtype?.name || filters.selectedPtype}`,
        value: filters.selectedPtype,
      });
    }

    if (filters.onlyInStock) {
      activeFilters.push({
        type: "stock" as const,
        label: "Apenas em Estoque",
        value: "stock",
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <div className="flex items-center justify-center w-full">
        <div className="flex items-center w-full max-w-xl lg:max-w-2xl">
          {/* Input com ícones */}
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
      </div>

      {/* Accordion de Filtros */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtro
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {/* Linha de Dropdown: Categoria + Marca + Tipo + Botão Limpar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  {/* Dropdown Categoria */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Categoria
                    </div>
                    <Select
                      value={filters.selectedCategory}
                      onValueChange={handleCategoryChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown Marca */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Marca
                    </div>
                    <Select
                      value={filters.selectedBrand || "all"}
                      onValueChange={handleBrandChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Marcas</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown Tipo */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Tipo
                    </div>
                    <Select
                      value={filters.selectedPtype || "all"}
                      onValueChange={handlePtypeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        {ptypes.map((ptype) => (
                          <SelectItem
                            key={ptype.id}
                            value={ptype.id.toString()}
                          >
                            {ptype.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Espaço vazio para manter layout */}
                  <div></div>

                  {/* Botão Limpar Filtros - aparece quando há categoria, marca ou tipo selecionado */}
                  <div className="flex justify-end">
                    {(filters.selectedCategory !== "all" ||
                      filters.selectedBrand ||
                      filters.selectedPtype) && (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleResetFilters}
                        className="w-full sm:w-auto"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtros Ativos como Badges */}
                {hasActiveFilters && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Filtros ativos
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((filter, index) => (
                        <Badge
                          key={`${filter.type}-${index}`}
                          variant="secondary"
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
                        >
                          <span>{filter.label}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFilter(filter.type)}
                            className="h-3 w-3 p-0 hover:bg-transparent"
                            disabled={isLoading}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </Badge>
                      ))}

                      {/* Botão Limpar Filtros */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-6 px-2 text-xs"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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

            {/* Controles - Linha 2 mobile, inline desktop */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 sm:justify-end">
              {/* Lado esquerdo mobile: Switch + Badge */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.onlyInStock}
                  onCheckedChange={(checked) =>
                    updateFilter("onlyInStock", checked)
                  }
                  id="stock-filter"
                  disabled={isLoading}
                />
                <label
                  htmlFor="stock-filter"
                  className="cursor-pointer text-sm font-medium whitespace-nowrap"
                >
                  Estoque
                </label>
                {filters.onlyInStock && (
                  <Badge variant="secondary" className="text-xs sm:hidden">
                    Ativo
                  </Badge>
                )}
              </div>

              {/* Lado direito mobile: Select + Botões */}
              <div className="flex items-center gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as SortOption)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[120px] sm:w-[160px]">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
    </div>
  );
}
