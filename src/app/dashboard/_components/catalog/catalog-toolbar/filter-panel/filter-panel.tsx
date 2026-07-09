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
import { SORT_OPTIONS } from "../../lib/search-params";
import type {
  CatalogFilters,
  CategoryOption,
  PanelFilterType,
  SortOption,
} from "../../types/catalog-types";
import { CategoryMenu } from "./category-menu";

interface PanelActiveFilter {
  type: PanelFilterType;
  label: string;
}

interface FilterPanelProps {
  filters: CatalogFilters;
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

/**
 * Painel lateral (Sheet) com os filtros avancados: categoria, marca, tipo,
 * estoque e ordenacao.
 */
export function FilterPanel({
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
}: FilterPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={panelFilterCount > 0 ? "default" : "outline"}
          className="h-11 shrink-0 gap-1.5 px-3 shadow-sm sm:px-4"
          disabled={isLoading}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden text-sm sm:inline">Filtros</span>
          {panelFilterCount > 0 && (
            <Badge className="h-5 min-w-5 justify-center px-1.5 text-xs">
              {panelFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[80vw] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
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

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm font-medium">
              Categoria
            </div>
            <CategoryMenu
              categories={categories}
              selectedCategoryId={filters.selectedCategory}
              isLoading={isLoading}
              onCategoryChange={onCategoryChange}
            />
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground text-sm font-medium">
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
            <div className="text-muted-foreground text-sm font-medium">
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
            <div className="text-muted-foreground text-sm font-medium">
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
            <div className="text-muted-foreground text-sm font-medium">
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
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {panelFilterCount > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="text-muted-foreground text-sm font-medium">
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

        <SheetFooter className="supports-[backdrop-filter]:bg-background/80 sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">
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
