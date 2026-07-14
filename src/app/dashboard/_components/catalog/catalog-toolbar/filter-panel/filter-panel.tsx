"use client";

import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  value: string;
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
  onFilterChange: <K extends PanelFilterType>(
    key: K,
    value: CatalogFilters[K],
  ) => void;
  onClearPanelFilters: () => void;
  onRemovePanelFilter: (filterType: PanelFilterType) => void;
}

interface TextFilterInputProps {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function TextFilterInput({
  id,
  label,
  value,
  disabled,
  onChange,
}: TextFilterInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => setInputValue(value), [value]);

  useEffect(() => {
    const normalizedValue = inputValue.trim().slice(0, 200);
    if (normalizedValue === value) return;
    const timer = window.setTimeout(() => onChange(normalizedValue), 500);
    return () => window.clearTimeout(timer);
  }, [inputValue, onChange, value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={inputValue}
        maxLength={200}
        disabled={disabled}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </div>
  );
}

interface NumericFilterInputProps {
  id: string;
  label: string;
  value?: number;
  disabled: boolean;
  onChange: (value: number | undefined) => void;
}

function NumericFilterInput({
  id,
  label,
  value,
  disabled,
  onChange,
}: NumericFilterInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");

  useEffect(() => setInputValue(value?.toString() ?? ""), [value]);

  useEffect(() => {
    const numericValue = inputValue === "" ? undefined : Number(inputValue);
    const normalizedValue =
      numericValue && Number.isSafeInteger(numericValue) && numericValue > 0
        ? numericValue
        : undefined;
    if (normalizedValue === value) return;
    const timer = window.setTimeout(() => onChange(normalizedValue), 500);
    return () => window.clearTimeout(timer);
  }, [inputValue, onChange, value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        value={inputValue}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (nextValue === "" || /^\d+$/.test(nextValue)) {
            setInputValue(nextValue);
          }
        }}
      />
    </div>
  );
}

interface SwitchFilterProps {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SwitchFilter({
  id,
  label,
  checked,
  disabled,
  onCheckedChange,
}: SwitchFilterProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2.5">
      <Label htmlFor={id} className="cursor-pointer leading-snug">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

/** Painel lateral com todos os filtros de dados do catalogo. */
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
  onFilterChange,
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
        className="flex w-[80vw] max-w-[80vw] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
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

        <Tabs defaultValue="general" className="min-h-0 flex-1 gap-0">
          <div className="border-b px-4 py-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="flags">Flags</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <TabsContent value="general" className="space-y-5">
              <TextFilterInput
                id="filter-reference"
                label="Referência"
                value={filters.reference}
                disabled={isLoading}
                onChange={(value) => onFilterChange("reference", value)}
              />
              <TextFilterInput
                id="filter-model"
                label="Modelo"
                value={filters.model}
                disabled={isLoading}
                onChange={(value) => onFilterChange("model", value)}
              />

              <div className="space-y-2">
                <Label className="text-muted-foreground">Categoria</Label>
                <CategoryMenu
                  categories={categories}
                  selectedCategoryId={filters.selectedCategory}
                  isLoading={isLoading}
                  onCategoryChange={(value) =>
                    onFilterChange("selectedCategory", value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Marca</Label>
                <Select
                  value={filters.selectedBrand || "all"}
                  onValueChange={(value) =>
                    onFilterChange(
                      "selectedBrand",
                      value === "all" ? undefined : value,
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full" aria-label="Marca">
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
                <Label className="text-muted-foreground">Tipo</Label>
                <Select
                  value={filters.selectedPtype || "all"}
                  onValueChange={(value) =>
                    onFilterChange(
                      "selectedPtype",
                      value === "all" ? undefined : value,
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full" aria-label="Tipo">
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

              <NumericFilterInput
                id="filter-supplier"
                label="ID do fornecedor"
                value={filters.supplierId}
                disabled={isLoading}
                onChange={(value) => onFilterChange("supplierId", value)}
              />
              <NumericFilterInput
                id="filter-physical"
                label="ID do produto físico"
                value={filters.physicalId}
                disabled={isLoading}
                onChange={(value) => onFilterChange("physicalId", value)}
              />
              <TextFilterInput
                id="filter-ean"
                label="EAN"
                value={filters.ean}
                disabled={isLoading}
                onChange={(value) => onFilterChange("ean", value)}
              />
            </TabsContent>

            <TabsContent value="flags" className="space-y-3">
              <SwitchFilter
                id="filter-stock"
                label="Apenas produtos em estoque"
                checked={filters.onlyInStock}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("onlyInStock", value)
                }
              />
              <SwitchFilter
                id="filter-service"
                label="Produtos de serviço"
                checked={filters.isService}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isService", value)}
              />
              <SwitchFilter
                id="filter-no-image"
                label="Produtos sem imagem"
                checked={filters.hasNoImage}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("hasNoImage", value)}
              />
              <SwitchFilter
                id="filter-no-description"
                label="Produtos sem descrição"
                checked={filters.hasNoDescription}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("hasNoDescription", value)
                }
              />
              <SwitchFilter
                id="filter-no-sales-copy"
                label="Produtos sem descrição de venda"
                checked={filters.hasNoSalesCopy}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("hasNoSalesCopy", value)
                }
              />
              <SwitchFilter
                id="filter-promotion"
                label="Produtos em promoção"
                checked={filters.isPromotion}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("isPromotion", value)
                }
              />
              <SwitchFilter
                id="filter-featured"
                label="Produtos em destaque"
                checked={filters.isFeatured}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isFeatured", value)}
              />
              <SwitchFilter
                id="filter-imported"
                label="Produtos importados"
                checked={filters.isImported}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isImported", value)}
              />
              <SwitchFilter
                id="filter-inactive"
                label="Produtos inativos"
                checked={filters.isInactive}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isInactive", value)}
              />
              <SwitchFilter
                id="filter-consignment"
                label="Produtos consignados"
                checked={filters.isConsignment}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("isConsignment", value)
                }
              />
              <SwitchFilter
                id="filter-discontinued"
                label="Produtos descontinuados"
                checked={filters.isDiscontinued}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("isDiscontinued", value)
                }
              />
              <SwitchFilter
                id="filter-no-inventory"
                label="Produtos sem controle de estoque"
                checked={filters.hasNoInventory}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("hasNoInventory", value)
                }
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-3">
              <SwitchFilter
                id="filter-lowest-selling"
                label="Menos vendidos"
                checked={filters.isLowestSelling}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("isLowestSelling", value)
                }
              />
              <SwitchFilter
                id="filter-stalled"
                label="Produtos parados"
                checked={filters.isStalled}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isStalled", value)}
              />
              <SwitchFilter
                id="filter-latest-arrivals"
                label="Últimos cadastrados"
                checked={filters.isLatestArrival}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("isLatestArrival", value)
                }
              />
              <SwitchFilter
                id="filter-price-less-than"
                label="Preço de atacado menor que 1"
                checked={filters.hasPriceLessThanOne}
                disabled={isLoading}
                onCheckedChange={(value) =>
                  onFilterChange("hasPriceLessThanOne", value)
                }
              />
              <NumericFilterInput
                id="filter-low-stock"
                label="Estoque baixo até"
                value={filters.lowStockThreshold}
                disabled={isLoading}
                onChange={(value) => onFilterChange("lowStockThreshold", value)}
              />

              <div className="space-y-2 pt-2">
                <Label className="text-muted-foreground">Ordenação</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    onFilterChange("sortBy", value as SortOption)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full" aria-label="Ordenação">
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
            </TabsContent>

            {panelFilterCount > 0 && (
              <div className="mt-5 space-y-2 border-t pt-4">
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
                      <span>
                        {filter.label}: {filter.value}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remover filtro ${filter.label}`}
                        onClick={() => onRemovePanelFilter(filter.type)}
                        className="text-muted-foreground hover:text-foreground rounded-sm transition-colors focus-visible:outline-2 disabled:opacity-50"
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
        </Tabs>

        <SheetFooter className="supports-[backdrop-filter]:bg-background/80 shrink-0 border-t bg-background/95 p-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={onClearPanelFilters}
            className="w-full"
            disabled={isLoading || panelFilterCount === 0}
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
