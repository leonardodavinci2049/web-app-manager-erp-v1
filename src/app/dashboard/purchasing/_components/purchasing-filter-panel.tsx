"use client";

import { useEffect, useMemo, useState } from "react";
import {
  REGISTRY_PAGE_LIMITS,
  RegistryFilterSheet,
} from "@/app/dashboard/_components/registry";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import type { UIPtype } from "@/services/api-main/ptype/transformers/transformers";
import { PURCHASING_SORT_OPTIONS } from "./lib/search-params";
import type {
  PurchasingCategoryOption,
  PurchasingFilters,
} from "./types/purchasing-dashboard-types";

interface PurchasingFilterPanelProps {
  filters: PurchasingFilters;
  brands: UIBrand[];
  categories: PurchasingCategoryOption[];
  ptypes: UIPtype[];
  open: boolean;
  pending: boolean;
  activeCount: number;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: PurchasingFilters) => void;
  onClear: () => void;
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  children: React.ReactNode;
  onChange: (value: string) => void;
}

function FilterSelect({
  id,
  label,
  value,
  disabled,
  children,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export function PurchasingFilterPanel({
  filters,
  brands,
  categories,
  ptypes,
  open,
  pending,
  activeCount,
  onOpenChange,
  onApply,
  onClear,
}: PurchasingFilterPanelProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => setDraft(filters), [filters]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(filters),
    [draft, filters],
  );

  const setNumber = <K extends keyof PurchasingFilters>(
    key: K,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value === "" ? undefined : Number(value),
    }));
  };

  return (
    <RegistryFilterSheet
      open={open}
      pending={pending}
      activeCount={activeCount}
      hasChanges={hasChanges}
      onOpenChange={onOpenChange}
      onApply={() => {
        onApply(draft);
        onOpenChange(false);
      }}
      onClear={() => {
        onClear();
        onOpenChange(false);
      }}
    >
      <FilterSelect
        id="purchasing-category"
        label="Categoria"
        value={draft.categoryId?.toString() ?? ""}
        disabled={pending}
        onChange={(value) => setNumber("categoryId", value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.displayName}
          </option>
        ))}
      </FilterSelect>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="purchasing-brand"
          label="Marca"
          value={draft.brandId?.toString() ?? ""}
          disabled={pending}
          onChange={(value) => setNumber("brandId", value)}
        >
          <option value="">Todas</option>
          {brands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="purchasing-type"
          label="Tipo"
          value={draft.typeId?.toString() ?? ""}
          disabled={pending}
          onChange={(value) => setNumber("typeId", value)}
        >
          <option value="">Todos</option>
          {ptypes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="purchasing-supplier">ID do fornecedor</Label>
        <Input
          id="purchasing-supplier"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft.supplierId?.toString() ?? ""}
          disabled={pending}
          placeholder="Ex.: 123"
          onChange={(event) => {
            if (/^\d*$/.test(event.target.value))
              setNumber("supplierId", event.target.value);
          }}
        />
      </div>

      <FilterSelect
        id="purchasing-criticality"
        label="Criticidade"
        value={String(draft.criticality)}
        disabled={pending}
        onChange={(value) => setNumber("criticality", value)}
      >
        <option value="0">Todos os níveis</option>
        <option value="1">Nível 1</option>
        <option value="2">Nível 2</option>
        <option value="3">Nível 3</option>
        <option value="4">Nível 4</option>
      </FilterSelect>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="purchasing-sales-list"
          label="Lista de vendas"
          value={String(draft.salesList)}
          disabled={pending}
          onChange={(value) => setNumber("salesList", value)}
        >
          <option value="0">Todos</option>
          <option value="1">Mais vendidos</option>
          <option value="2">Menos vendidos</option>
          <option value="3">Produtos encalhados</option>
        </FilterSelect>
        <FilterSelect
          id="purchasing-stock-list"
          label="Lista de estoque"
          value={String(draft.stockList)}
          disabled={pending}
          onChange={(value) => setNumber("stockList", value)}
        >
          <option value="0">Todos</option>
          <option value="1">Com estoque</option>
          <option value="2">Estoque até 2</option>
          <option value="3">Últimos cadastrados</option>
        </FilterSelect>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="purchasing-advanced"
          label="Filtro avançado"
          value={String(draft.advancedFilter)}
          disabled={pending}
          onChange={(value) => setNumber("advancedFilter", value)}
        >
          <option value="0">Todos</option>
          <option value="1">Atacado menor que 1</option>
          <option value="2">Produtos de serviço</option>
        </FilterSelect>
        <FilterSelect
          id="purchasing-origin"
          label="Origem"
          value={String(draft.origin)}
          disabled={pending}
          onChange={(value) => setNumber("origin", value)}
        >
          <option value="0">Todas</option>
          <option value="1">Importados</option>
          <option value="2">Nacionais</option>
        </FilterSelect>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-3">
        <Checkbox
          id="purchasing-premium"
          checked={draft.premium}
          disabled={pending}
          onCheckedChange={(checked) =>
            setDraft((current) => ({ ...current, premium: checked === true }))
          }
        />
        <Label htmlFor="purchasing-premium">Somente produtos premium</Label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="purchasing-sort"
          label="Ordenação"
          value={draft.sort}
          disabled={pending}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              sort: value as PurchasingFilters["sort"],
            }))
          }
        >
          {PURCHASING_SORT_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="purchasing-limit"
          label="Registros por página"
          value={String(draft.pageLimit)}
          disabled={pending}
          onChange={(value) => setNumber("pageLimit", value)}
        >
          {REGISTRY_PAGE_LIMITS.map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </FilterSelect>
      </div>
    </RegistryFilterSheet>
  );
}
