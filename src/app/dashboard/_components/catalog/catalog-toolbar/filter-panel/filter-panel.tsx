"use client";

import { Filter, Search, X } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
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
  AdvancedFilterFlag,
  CatalogFilters,
  CategoryOption,
  PanelFilterType,
  SalesListFlag,
  SortOption,
  StockListFlag,
  VariousListFlag,
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
  placeholder?: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function TextFilterInput({
  id,
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: TextFilterInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => setInputValue(value), [value]);

  const normalizedValue = inputValue.trim().slice(0, 200);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (normalizedValue !== value) onChange(normalizedValue);
  };

  return (
    <form className="min-w-0 space-y-1" onSubmit={handleSubmit}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <div className="relative min-w-0">
        <Input
          id={id}
          value={inputValue}
          placeholder={placeholder}
          maxLength={200}
          disabled={disabled}
          className="min-w-0 pr-10"
          onChange={(event) => setInputValue(event.target.value)}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          className="absolute top-0.5 right-0.5"
          disabled={disabled || normalizedValue === value}
          aria-label={`Filtrar por ${label}`}
          title={`Filtrar por ${label}`}
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

interface NumericFilterInputProps {
  id: string;
  label: string;
  placeholder?: string;
  submitManually?: boolean;
  value?: number;
  disabled: boolean;
  onChange: (value: number | undefined) => void;
}

function NumericFilterInput({
  id,
  label,
  placeholder,
  submitManually = false,
  value,
  disabled,
  onChange,
}: NumericFilterInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");

  useEffect(() => setInputValue(value?.toString() ?? ""), [value]);

  const numericValue = inputValue === "" ? undefined : Number(inputValue);
  const normalizedValue =
    numericValue && Number.isSafeInteger(numericValue) && numericValue > 0
      ? numericValue
      : undefined;

  useEffect(() => {
    if (submitManually || normalizedValue === value) return;
    const timer = window.setTimeout(() => onChange(normalizedValue), 500);
    return () => window.clearTimeout(timer);
  }, [normalizedValue, onChange, submitManually, value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (normalizedValue !== value) onChange(normalizedValue);
  };

  return (
    <form className="min-w-0 space-y-1" onSubmit={handleSubmit}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <div className="relative min-w-0">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          className={submitManually ? "min-w-0 pr-10" : "min-w-0"}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue === "" || /^\d+$/.test(nextValue)) {
              setInputValue(nextValue);
            }
          }}
        />
        {submitManually && (
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="absolute top-0.5 right-0.5"
            disabled={disabled || normalizedValue === value}
            aria-label={`Filtrar por ${label}`}
            title={`Filtrar por ${label}`}
          >
            <Search className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
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
    <div className="flex min-h-9 items-center justify-between gap-2 rounded-md border px-2.5 py-1.5">
      <Label htmlFor={id} className="cursor-pointer text-sm leading-tight">
        {label}
      </Label>
      <Switch
        id={id}
        size="sm"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

interface RadioFilterProps<T extends number> {
  id: string;
  label: string;
  value: T;
  options: ReadonlyArray<{ label: string; value: T }>;
  disabled: boolean;
  onValueChange: (value: T) => void;
}

function RadioFilter<T extends number>({
  id,
  label,
  value,
  options,
  disabled,
  onValueChange,
}: RadioFilterProps<T>) {
  const gridColumns = options.length <= 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <fieldset className="space-y-1 rounded-md border px-2.5 py-1.5">
      <legend className="px-1 text-xs font-medium">{label}</legend>
      <div className={`grid ${gridColumns} gap-0.5 rounded-md bg-muted p-0.5`}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          return (
            <div key={option.value} className="min-w-0">
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option.value}
                checked={value === option.value}
                disabled={disabled}
                className="peer sr-only"
                onChange={() => onValueChange(option.value)}
              />
              <Label
                htmlFor={optionId}
                className="min-h-8 cursor-pointer justify-center rounded-sm px-1 text-center text-xs leading-tight transition-colors peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-1.5" aria-label={title}>
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
          {title}
        </span>
        <Separator />
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
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
  const hasValidRegistrationPeriod =
    filters.startDate !== "" &&
    filters.endDate !== "" &&
    filters.startDate <= filters.endDate;

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
        className="flex w-[90vw] max-w-[90vw] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
      >
        <SheetHeader className="space-y-0.5 border-b p-3 pr-12">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="general" className="min-h-0 flex-1 gap-0">
          <div className="border-b px-3 py-2">
            <TabsList className="grid h-8 w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
              <TabsTrigger value="flags">Flags</TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <TabsContent value="general" className="space-y-3">
              <div className="space-y-1">
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

              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0 space-y-1">
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
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as marcas</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1">
                  <Label className="text-muted-foreground">
                    Tipo de produto
                  </Label>
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
                    <SelectTrigger
                      className="w-full"
                      aria-label="Tipo de produto"
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {ptypes.map((ptype) => (
                        <SelectItem key={ptype.id} value={ptype.id.toString()}>
                          {ptype.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumericFilterInput
                  id="filter-supplier"
                  label="Fornecedor"
                  placeholder="Digite o ID"
                  submitManually
                  value={filters.supplierId}
                  disabled={isLoading}
                  onChange={(value) => onFilterChange("supplierId", value)}
                />
                <NumericFilterInput
                  id="filter-physical"
                  label="Produto físico"
                  placeholder="Digite o ID"
                  submitManually
                  value={filters.physicalId}
                  disabled={isLoading}
                  onChange={(value) => onFilterChange("physicalId", value)}
                />
              </div>

              <TextFilterInput
                id="filter-ean"
                label="EAN"
                placeholder="Digite o EAN"
                value={filters.ean}
                disabled={isLoading}
                onChange={(value) => onFilterChange("ean", value)}
              />

              <div className="space-y-1 pt-1">
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

            <TabsContent value="advanced" className="space-y-3">
              <RadioFilter<SalesListFlag>
                id="filter-sales-list"
                label="Lista de vendas"
                value={filters.salesList}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Mais vendidos", value: 1 },
                  { label: "Menos vendidos", value: 2 },
                  { label: "Encalhados", value: 3 },
                ]}
                disabled={isLoading}
                onValueChange={(value) => onFilterChange("salesList", value)}
              />

              <RadioFilter<StockListFlag>
                id="filter-stock-list"
                label="Lista de estoque"
                value={filters.stockList}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Com estoque", value: 1 },
                  { label: "Estoque até 2", value: 2 },
                  { label: "Últimos cadastrados", value: 3 },
                ]}
                disabled={isLoading}
                onValueChange={(value) => onFilterChange("stockList", value)}
              />

              <FilterGroup title="Sem conteúdo">
                <SwitchFilter
                  id="filter-no-image"
                  label="Produtos sem imagem"
                  checked={filters.hasNoImage}
                  disabled={isLoading}
                  onCheckedChange={(value) =>
                    onFilterChange("hasNoImage", value)
                  }
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
              </FilterGroup>

              <RadioFilter<AdvancedFilterFlag>
                id="filter-advanced"
                label="Filtro avançado"
                value={filters.advancedFilter}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Atacado menor que 1", value: 1 },
                  { label: "Serviço", value: 2 },
                ]}
                disabled={isLoading}
                onValueChange={(value) =>
                  onFilterChange("advancedFilter", value)
                }
              />

              <FilterGroup title="Período de cadastro">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="filter-start-date">Data inicial</Label>
                    <Input
                      id="filter-start-date"
                      type="date"
                      value={filters.startDate}
                      max={filters.endDate || undefined}
                      disabled={isLoading}
                      onChange={(event) =>
                        onFilterChange("startDate", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="filter-end-date">Data final</Label>
                    <Input
                      id="filter-end-date"
                      type="date"
                      value={filters.endDate}
                      min={filters.startDate || undefined}
                      disabled={isLoading}
                      onChange={(event) =>
                        onFilterChange("endDate", event.target.value)
                      }
                    />
                  </div>
                </div>
                <SwitchFilter
                  id="filter-registration-period"
                  label="Filtrar pelo período informado"
                  checked={filters.operationList === 1}
                  disabled={isLoading || !hasValidRegistrationPeriod}
                  onCheckedChange={(value) =>
                    onFilterChange("operationList", value ? 1 : 0)
                  }
                />
              </FilterGroup>
            </TabsContent>

            <TabsContent value="flags" className="space-y-2">
              <RadioFilter
                id="filter-inactive"
                label="Produtos inativos"
                value={filters.inactiveStatus}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Inativo", value: 1 },
                  { label: "Ativo", value: 2 },
                ]}
                disabled={isLoading}
                onValueChange={(value) =>
                  onFilterChange("inactiveStatus", value)
                }
              />
              <RadioFilter
                id="filter-imported"
                label="Produtos importados"
                value={filters.importedStatus}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Importado", value: 1 },
                  { label: "Nacional", value: 2 },
                ]}
                disabled={isLoading}
                onValueChange={(value) =>
                  onFilterChange("importedStatus", value)
                }
              />
              <SwitchFilter
                id="filter-premium"
                label="Produtos premium"
                checked={filters.isPremium}
                disabled={isLoading}
                onCheckedChange={(value) => onFilterChange("isPremium", value)}
              />

              <Separator />

              <RadioFilter<VariousListFlag>
                id="filter-various-list"
                label="Listas adicionais"
                value={filters.variousList}
                options={[
                  { label: "Todos", value: 0 },
                  { label: "Promoção", value: 1 },
                  { label: "Destaque", value: 2 },
                  { label: "Consignado", value: 3 },
                  { label: "Descontinuado", value: 4 },
                  { label: "Sem estoque controlado", value: 5 },
                  { label: "Site desativado", value: 6 },
                ]}
                disabled={isLoading}
                onValueChange={(value) => onFilterChange("variousList", value)}
              />
            </TabsContent>

            {panelFilterCount > 0 && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                <div className="text-muted-foreground text-sm font-medium">
                  Filtros ativos
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {panelActiveFilters.map((filter) => (
                    <Badge
                      key={filter.type}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-0.5 text-xs"
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

        <SheetFooter className="supports-[backdrop-filter]:bg-background/80 shrink-0 border-t bg-background/95 p-3 backdrop-blur">
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
