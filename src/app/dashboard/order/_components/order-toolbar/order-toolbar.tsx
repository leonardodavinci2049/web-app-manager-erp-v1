"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  REGISTRY_DEFAULT_PAGE_LIMIT,
  RegistryActiveFilters,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import {
  buildOrderUrl,
  ORDER_SORT_OPTIONS,
  parseOrderSearchParams,
} from "../lib/search-params";
import {
  ORDER_DELIVERY_STATUS_OPTIONS,
  ORDER_FINANCIAL_STATUS_OPTIONS,
  ORDER_LOCATION_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderFilterOption,
  type OrderPanelFilter,
  type OrderSearchParams,
} from "../types/order-dashboard-types";
import { OrderFilterPanel } from "./order-filter-panel";

const VIEW_MODE_STORAGE_KEY = "orders:sales-view-mode";

interface OrderToolbarProps {
  defaultPeriod: Pick<OrderSearchParams, "startDate" | "endDate">;
  customerOptions: OrderFilterOption[];
  sellerOptions: OrderFilterOption[];
  grid: ReactNode;
  list: ReactNode;
}

function getOptionLabel<T extends number>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value: T,
): string {
  return (
    options.find((option) => option.value === value)?.label ?? String(value)
  );
}

function formatPeriod(startDate: string, endDate: string): string {
  const format = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };
  return `${format(startDate)} a ${format(endDate)}`;
}

export function OrderToolbar({
  defaultPeriod,
  customerOptions,
  sellerOptions,
  grid,
  list,
}: OrderToolbarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const referenceDate = useMemo(
    () => new Date(`${defaultPeriod.endDate}T12:00:00`),
    [defaultPeriod.endDate],
  );
  const filters = useMemo(
    () => parseOrderSearchParams(searchParams, referenceDate),
    [referenceDate, searchParams],
  );
  const latestFilters = useRef(filters);
  latestFilters.current = filters;

  const panelDefaults = useMemo<OrderSearchParams>(
    () => ({
      search: "",
      ...defaultPeriod,
      customerId: 0,
      sellerId: 0,
      orderStatusId: 0,
      financialStatusId: 0,
      deliveryStatusId: 0,
      locationId: 0,
      limit: REGISTRY_DEFAULT_PAGE_LIMIT,
      page: 0,
      accum: 0,
      sort: "default",
    }),
    [defaultPeriod],
  );

  const updateFilters = useCallback(
    (next: OrderSearchParams) => {
      const normalized = { ...next, page: 0, accum: 0 };
      latestFilters.current = normalized;
      startTransition(() => router.replace(buildOrderUrl(normalized)));
    },
    [router],
  );

  const activeFilters = useMemo(() => {
    const result: Array<{ key: string; label: string; value: string }> = [];
    const add = (
      condition: boolean,
      key: string,
      label: string,
      value: string,
    ) => {
      if (condition) result.push({ key, label, value });
    };

    add(Boolean(filters.search), "search", "Pesquisa", filters.search);
    add(
      filters.startDate !== defaultPeriod.startDate ||
        filters.endDate !== defaultPeriod.endDate,
      "period",
      "Período",
      formatPeriod(filters.startDate, filters.endDate),
    );
    add(
      filters.customerId !== 0,
      "customerId",
      "Cliente",
      customerOptions.find(({ id }) => id === filters.customerId)?.label ??
        `ID ${filters.customerId}`,
    );
    add(
      filters.sellerId !== 0,
      "sellerId",
      "Vendedor",
      sellerOptions.find(({ id }) => id === filters.sellerId)?.label ??
        `ID ${filters.sellerId}`,
    );
    add(
      filters.orderStatusId !== 0,
      "orderStatusId",
      "Pedido",
      getOptionLabel(ORDER_STATUS_OPTIONS, filters.orderStatusId),
    );
    add(
      filters.financialStatusId !== 0,
      "financialStatusId",
      "Financeiro",
      getOptionLabel(ORDER_FINANCIAL_STATUS_OPTIONS, filters.financialStatusId),
    );
    add(
      filters.deliveryStatusId !== 0,
      "deliveryStatusId",
      "Entrega",
      getOptionLabel(ORDER_DELIVERY_STATUS_OPTIONS, filters.deliveryStatusId),
    );
    add(
      filters.locationId !== 0,
      "locationId",
      "Localização",
      getOptionLabel(ORDER_LOCATION_OPTIONS, filters.locationId),
    );
    add(
      filters.limit !== REGISTRY_DEFAULT_PAGE_LIMIT,
      "limit",
      "Por página",
      String(filters.limit),
    );
    add(
      filters.sort !== "default",
      "sort",
      "Ordenação",
      ORDER_SORT_OPTIONS.find(({ value }) => value === filters.sort)?.label ??
        filters.sort,
    );
    return result;
  }, [customerOptions, defaultPeriod, filters, sellerOptions]);

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "search") {
        updateFilters({ ...latestFilters.current, search: "" });
        return;
      }
      if (key === "period") {
        updateFilters({ ...latestFilters.current, ...defaultPeriod });
        return;
      }
      const panelKey = key as OrderPanelFilter;
      updateFilters({
        ...latestFilters.current,
        [panelKey]: panelDefaults[panelKey],
      });
    },
    [defaultPeriod, panelDefaults, updateFilters],
  );

  const panelActiveCount = activeFilters.filter(
    ({ key }) => key !== "search",
  ).length;
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={filters.search}
            placeholder="Buscar por pedido, cliente ou vendedor..."
            accessibleLabel="Pesquisar pedidos de venda"
            pending={pending}
            onSearch={(search) =>
              updateFilters({ ...latestFilters.current, search })
            }
          />
          <OrderFilterPanel
            filters={filters}
            customerOptions={customerOptions}
            sellerOptions={sellerOptions}
            open={filterOpen}
            pending={pending}
            activeCount={panelActiveCount}
            onOpenChange={setFilterOpen}
            onApply={updateFilters}
            onClear={() =>
              updateFilters({
                ...panelDefaults,
                search: latestFilters.current.search,
              })
            }
          />
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
        </div>
      </div>

      <RegistryActiveFilters
        filters={activeFilters}
        pending={pending}
        onRemove={removeFilter}
        onClear={() => updateFilters(panelDefaults)}
      />

      <p className="sr-only" aria-live="polite">
        {pending ? "Atualizando consulta" : "Consulta atualizada"}
      </p>
      <RegistryResults pending={pending}>
        {viewMode === "grid" ? grid : list}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="pedidos de venda"
        filterCount={panelActiveCount}
        filterOpen={filterOpen}
        onOpenFilters={() => setFilterOpen(true)}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
    </div>
  );
}
