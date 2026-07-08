"use client";

import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import type { FilterOptions, SortOption } from "@/types/types";
import type { CategoryOption, PanelFilterType } from "./ProductFiltersImproved";

const sortOptions = [
  { value: "name-asc" as SortOption, label: "Nome A-Z" },
  { value: "name-desc" as SortOption, label: "Nome Z-A" },
  { value: "newest" as SortOption, label: "Mais Recentes" },
  { value: "price-asc" as SortOption, label: "Menor Preço" },
  { value: "price-desc" as SortOption, label: "Maior Preço" },
];

interface PanelActiveFilter {
  type: PanelFilterType;
  label: string;
}

interface FloatingProductFiltersPanelProps {
  filters: FilterOptions;
  categories: CategoryOption[];
  brands: UIBrand[];
  ptypes: UIPtype[];
  isOpen: boolean;
  isLoading: boolean;
  panelActiveFilters: PanelActiveFilter[];
  panelFilterCount: number;
  onOpenChange: (open: boolean) => void;
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brandId: string) => void;
  onPtypeChange: (ptypeId: string) => void;
  onOnlyInStockChange: (checked: boolean) => void;
  onSortChange: (sortBy: SortOption) => void;
  onClearPanelFilters: () => void;
  onRemovePanelFilter: (filterType: PanelFilterType) => void;
}

export function FloatingProductFiltersPanel({
  filters,
  categories,
  brands,
  ptypes,
  isOpen,
  isLoading,
  panelActiveFilters,
  panelFilterCount,
  onOpenChange,
  onCategoryChange,
  onBrandChange,
  onPtypeChange,
  onOnlyInStockChange,
  onSortChange,
  onClearPanelFilters,
  onRemovePanelFilter,
}: FloatingProductFiltersPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={panelFilterCount > 0 ? "default" : "outline"}
          className="h-11 px-3 sm:px-4 shrink-0 gap-1.5 shadow-sm"
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Filtros</span>
          {panelFilterCount > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 text-xs justify-center">
              {panelFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md gap-0 p-0 flex flex-col"
      >
        <SheetHeader className="space-y-1 border-b p-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </SheetTitle>
          <SheetDescription>
            Selecione uma opção para filtrar os produtos. A lista é atualizada
            automaticamente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Categoria
            </div>
            <Select
              value={filters.selectedCategory}
              onValueChange={onCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Marca
            </div>
            <Select
              value={filters.selectedBrand || "all"}
              onValueChange={onBrandChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Tipo
            </div>
            <Select
              value={filters.selectedPtype || "all"}
              onValueChange={onPtypeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {ptypes.map((ptype) => (
                  <SelectItem key={ptype.id} value={ptype.id.toString()}>
                    {ptype.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-sm font-medium text-muted-foreground">
              Estoque
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
              <label
                htmlFor="panel-stock-filter"
                className="cursor-pointer text-sm font-medium"
              >
                Apenas produtos em estoque
              </label>
              <Switch
                checked={filters.onlyInStock}
                onCheckedChange={onOnlyInStockChange}
                id="panel-stock-filter"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Ordenação
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onSortChange(value as SortOption)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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
          </div>

          {panelFilterCount > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                Filtros ativos
              </div>
              <div className="flex flex-wrap gap-2">
                {panelActiveFilters.map((filter) => (
                  <Badge
                    key={filter.type}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      onClick={() => onRemovePanelFilter(filter.type)}
                      className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClearPanelFilters}
            className="w-full"
            disabled={isLoading || panelFilterCount === 0}
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
