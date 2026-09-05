"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  type RegistryActiveFilter,
  RegistryActiveFilters,
  RegistryFilterSheet,
  RegistryMobileBottomBar,
  RegistryResults,
  RegistrySearch,
  RegistryViewModeToggle,
} from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import { EntryCreateSheet } from "../entry-create/entry-create-sheet";
import { buildEntryDetailHref, buildEntryUrl } from "../lib/search-params";
import {
  ENTRY_MODEL_OPTIONS,
  ENTRY_OPERATION_LIST_OPTIONS,
  ENTRY_PAGE_SIZE,
  type EntryCreateOptionDto,
  type EntrySearchParams,
} from "../types/entry-dashboard-types";
import { EntryFilterPanel } from "./entry-filter-panel";
import { useEntryViewMode } from "./use-entry-view-mode";

const VIEW_MODE_STORAGE_KEY = "dashboard:entry-view-mode";

const SORT_LABELS: Record<EntrySearchParams["sort"], string> = {
  "entry-date": "Data de entrada",
  id: "ID",
  "created-at": "Data de cadastro",
};

const MODEL_LABELS = new Map(
  ENTRY_MODEL_OPTIONS.map((option) => [option.value, option.label]),
);
const OPERATION_LIST_LABELS = new Map(
  ENTRY_OPERATION_LIST_OPTIONS.map((option) => [option.value, option.label]),
);

const PERIOD_RESET: Pick<
  EntrySearchParams,
  "operationList" | "startDate" | "endDate"
> = { operationList: 0, startDate: "", endDate: "" };

function formatIsoDateToBr(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

interface EntryToolbarProps {
  searchState: EntrySearchParams;
  grid: ReactNode;
  table: ReactNode;
  cards: ReactNode;
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
}

function getDefaultFilters(state: EntrySearchParams): EntrySearchParams {
  return {
    ...state,
    sort: "entry-date",
    order: "desc",
    page: 0,
    limit: ENTRY_PAGE_SIZE,
    supplierId: 0,
    carrierId: 0,
    modelId: 0,
    categoryId: 0,
    operationList: 0,
    startDate: "",
    endDate: "",
  };
}

export function EntryToolbar({
  searchState,
  grid,
  table,
  cards,
  supplierOptions,
  carrierOptions,
}: EntryToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { viewMode, updateViewMode } = useEntryViewMode(VIEW_MODE_STORAGE_KEY);

  const navigate = useCallback(
    (nextState: EntrySearchParams) => {
      startTransition(() => {
        router.replace(buildEntryUrl(nextState, pathname));
      });
    },
    [pathname, router],
  );

  const applyFilters = useCallback(
    (patch: Partial<EntrySearchParams>) => {
      navigate({ ...searchState, ...patch, page: 0 });
    },
    [navigate, searchState],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
    if (searchState.supplierId > 0) {
      filters.push({
        key: "supplier",
        label: "Fornecedor",
        value:
          supplierOptions.find((option) => option.id === searchState.supplierId)
            ?.label ?? `ID ${searchState.supplierId}`,
      });
    }
    if (searchState.carrierId > 0) {
      filters.push({
        key: "carrier",
        label: "Transportadora",
        value:
          carrierOptions.find((option) => option.id === searchState.carrierId)
            ?.label ?? `ID ${searchState.carrierId}`,
      });
    }
    if (searchState.modelId !== 0) {
      filters.push({
        key: "model",
        label: "Modelo",
        value: MODEL_LABELS.get(searchState.modelId) ?? "—",
      });
    }
    if (searchState.categoryId !== 0) {
      filters.push({
        key: "category",
        label: "Categoria",
        value: "Entrada de Produtos",
      });
    }
    if (searchState.operationList !== 0) {
      filters.push({
        key: "operationList",
        label: "Período",
        value: `${OPERATION_LIST_LABELS.get(searchState.operationList) ?? "—"} (${formatIsoDateToBr(searchState.startDate)} a ${formatIsoDateToBr(searchState.endDate)})`,
      });
    }
    if (searchState.sort !== "entry-date") {
      filters.push({
        key: "sort",
        label: "Ordenação",
        value: SORT_LABELS[searchState.sort],
      });
    }
    if (searchState.order !== "desc") {
      filters.push({
        key: "order",
        label: "Direção",
        value: "Crescente",
      });
    }
    if (searchState.limit !== ENTRY_PAGE_SIZE) {
      filters.push({
        key: "limit",
        label: "Por página",
        value: String(searchState.limit),
      });
    }
    return filters;
  }, [searchState, supplierOptions, carrierOptions]);

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState));
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case "supplier":
        navigate({ ...searchState, supplierId: 0, page: 0 });
        break;
      case "carrier":
        navigate({ ...searchState, carrierId: 0, page: 0 });
        break;
      case "model":
        navigate({ ...searchState, modelId: 0, page: 0 });
        break;
      case "category":
        navigate({ ...searchState, categoryId: 0, page: 0 });
        break;
      case "operationList":
        navigate({ ...searchState, ...PERIOD_RESET, page: 0 });
        break;
      case "sort":
        navigate({ ...searchState, sort: "entry-date", page: 0 });
        break;
      case "order":
        navigate({ ...searchState, order: "desc", page: 0 });
        break;
      case "limit":
        navigate({ ...searchState, limit: ENTRY_PAGE_SIZE, page: 0 });
        break;
    }
  };

  const handleCreated = useCallback(
    (entryId: number) => {
      startTransition(() => {
        router.replace(buildEntryDetailHref(entryId, searchState, pathname));
        router.refresh();
      });
    },
    [pathname, router, searchState],
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar entrada..."
            accessibleLabel="Pesquisar entradas"
            pending={isPending}
            onSearch={(search) => navigate({ ...searchState, search, page: 0 })}
          />
          <RegistryFilterSheet
            open={filterOpen}
            pending={isPending}
            activeCount={activeFilters.length}
            onOpenChange={setFilterOpen}
            onClear={clearFilters}
          >
            <EntryFilterPanel
              state={searchState}
              supplierOptions={supplierOptions}
              carrierOptions={carrierOptions}
              pending={isPending}
              onChange={applyFilters}
            />
          </RegistryFilterSheet>
          <RegistryViewModeToggle
            viewMode={viewMode === "table" ? "list" : "grid"}
            onToggle={() =>
              updateViewMode(viewMode === "table" ? "grid" : "table")
            }
            className="hidden md:inline-flex"
          />
          <Button
            type="button"
            className="hidden h-11 shrink-0 md:ml-auto md:inline-flex"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Nova entrada</span>
            <span className="sr-only lg:hidden">Nova entrada</span>
          </Button>
        </div>
      </div>

      <RegistryActiveFilters
        filters={activeFilters}
        pending={isPending}
        onRemove={removeFilter}
        onClear={clearFilters}
      />

      <RegistryResults pending={isPending}>
        {viewMode === "table" ? table : viewMode === "cards" ? cards : grid}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="entradas"
        filterCount={activeFilters.length}
        filterOpen={filterOpen}
        onOpenFilters={() => setFilterOpen(true)}
        viewMode={viewMode === "grid" ? "grid" : "list"}
        onToggleView={() =>
          updateViewMode(viewMode === "grid" ? "cards" : "grid")
        }
        addLabel="Nova entrada"
        addOpen={createOpen}
        onAdd={() => setCreateOpen(true)}
      />

      <EntryCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
        supplierOptions={supplierOptions}
        carrierOptions={carrierOptions}
      />
    </div>
  );
}
