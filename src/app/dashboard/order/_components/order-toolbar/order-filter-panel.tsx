"use client";

import { useEffect, useMemo, useState } from "react";
import {
  REGISTRY_PAGE_LIMITS,
  RegistryFilterSheet,
} from "@/app/dashboard/_components/registry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchOrderFilterCustomers,
  searchOrderFilterSellers,
} from "../../_actions/order-filter-actions";
import { ORDER_SORT_OPTIONS } from "../lib/search-params";
import {
  ORDER_DELIVERY_STATUS_OPTIONS,
  ORDER_FINANCIAL_STATUS_OPTIONS,
  ORDER_LOCATION_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderDeliveryStatusId,
  type OrderFilterOption,
  type OrderFinancialStatusId,
  type OrderLocationId,
  type OrderSearchParams,
  type OrderStatusId,
} from "../types/order-dashboard-types";
import { OrderFilterCombobox } from "./order-filter-combobox";

const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        className={SELECT_CLASS}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

interface OrderFilterPanelProps {
  filters: OrderSearchParams;
  customerOptions: OrderFilterOption[];
  sellerOptions: OrderFilterOption[];
  open: boolean;
  pending: boolean;
  activeCount: number;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: OrderSearchParams) => void;
  onClear: () => void;
}

export function OrderFilterPanel({
  filters,
  customerOptions,
  sellerOptions,
  open,
  pending,
  activeCount,
  onOpenChange,
  onApply,
  onClear,
}: OrderFilterPanelProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => setDraft(filters), [filters]);

  const hasValidPeriod =
    draft.startDate !== "" &&
    draft.endDate !== "" &&
    draft.startDate <= draft.endDate;
  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(filters),
    [draft, filters],
  );

  return (
    <RegistryFilterSheet
      open={open}
      pending={pending}
      activeCount={activeCount}
      hasChanges={hasChanges && hasValidPeriod}
      onOpenChange={onOpenChange}
      onApply={() => {
        if (!hasValidPeriod) return;
        onApply(draft);
        onOpenChange(false);
      }}
      onClear={() => {
        onClear();
        onOpenChange(false);
      }}
    >
      <div className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Período</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="order-start-date">Data inicial</Label>
            <Input
              id="order-start-date"
              type="date"
              value={draft.startDate}
              max={draft.endDate}
              disabled={pending}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-end-date">Data final</Label>
            <Input
              id="order-end-date"
              type="date"
              value={draft.endDate}
              min={draft.startDate}
              disabled={pending}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </div>
        </div>
        {!hasValidPeriod && (
          <p className="text-destructive text-xs" role="alert">
            Informe um período válido, com a data inicial anterior à final.
          </p>
        )}
      </div>

      <OrderFilterCombobox
        id="order-customer"
        label="Cliente"
        value={draft.customerId}
        options={customerOptions}
        searchPlaceholder="Pesquisar cliente..."
        emptyMessage="Nenhum cliente encontrado."
        disabled={pending}
        onValueChange={(customerId) =>
          setDraft((current) => ({ ...current, customerId }))
        }
        onSearch={searchOrderFilterCustomers}
      />

      <OrderFilterCombobox
        id="order-seller"
        label="Vendedor"
        value={draft.sellerId}
        options={sellerOptions}
        searchPlaceholder="Pesquisar vendedor..."
        emptyMessage="Nenhum vendedor encontrado."
        disabled={pending}
        onValueChange={(sellerId) =>
          setDraft((current) => ({ ...current, sellerId }))
        }
        onSearch={searchOrderFilterSellers}
      />

      <FilterSelect
        id="order-status"
        label="Status do pedido"
        value={String(draft.orderStatusId)}
        disabled={pending}
        onChange={(value) =>
          setDraft((current) => ({
            ...current,
            orderStatusId: Number(value) as OrderStatusId,
          }))
        }
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="order-financial-status"
          label="Status financeiro"
          value={String(draft.financialStatusId)}
          disabled={pending}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              financialStatusId: Number(value) as OrderFinancialStatusId,
            }))
          }
        >
          {ORDER_FINANCIAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="order-delivery-status"
          label="Status da entrega"
          value={String(draft.deliveryStatusId)}
          disabled={pending}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              deliveryStatusId: Number(value) as OrderDeliveryStatusId,
            }))
          }
        >
          {ORDER_DELIVERY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
      </div>

      <FilterSelect
        id="order-location"
        label="Localização"
        value={String(draft.locationId)}
        disabled={pending}
        onChange={(value) =>
          setDraft((current) => ({
            ...current,
            locationId: Number(value) as OrderLocationId,
          }))
        }
      >
        {ORDER_LOCATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelect
          id="order-sort"
          label="Ordenação"
          value={draft.sort}
          disabled={pending}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              sort: value as OrderSearchParams["sort"],
            }))
          }
        >
          {ORDER_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="order-limit"
          label="Registros por página"
          value={String(draft.limit)}
          disabled={pending}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              limit: Number(value) as OrderSearchParams["limit"],
            }))
          }
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
