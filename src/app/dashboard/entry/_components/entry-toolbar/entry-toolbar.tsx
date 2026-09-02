"use client";

import { LayoutGrid, Plus, Rows3, Table2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
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
} from "@/components/registry";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EntryCreateSheet } from "../entry-create/entry-create-sheet";
import { buildEntryDetailHref, buildEntryUrl } from "../lib/search-params";
import {
  ENTRY_PAGE_SIZE,
  type EntryCreateOptionDto,
  type EntryOrder,
  type EntryPageLimit,
  type EntrySearchParams,
  type EntrySort,
} from "../types/entry-dashboard-types";
import { EntryViewModeToggle } from "./entry-view-mode-toggle";
import { useEntryViewMode } from "./use-entry-view-mode";

const VIEW_MODE_STORAGE_KEY = "dashboard:entry-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const SORT_LABELS: Record<EntrySort, string> = {
  "entry-date": "Data de entrada",
  id: "ID",
  "created-at": "Data de cadastro",
};

interface EntryToolbarProps {
  searchState: EntrySearchParams;
  grid: ReactNode;
  table: ReactNode;
  cards: ReactNode;
  supplierOptions: EntryCreateOptionDto[];
  carrierOptions: EntryCreateOptionDto[];
  categoryOptions: EntryCreateOptionDto[];
}

function getDefaultFilters(state: EntrySearchParams): EntrySearchParams {
  return {
    ...state,
    sort: "entry-date",
    order: "desc",
    page: 0,
    limit: ENTRY_PAGE_SIZE,
  };
}

export function EntryToolbar({
  searchState,
  grid,
  table,
  cards,
  supplierOptions,
  carrierOptions,
  categoryOptions,
}: EntryToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState(searchState);
  const { viewMode, updateViewMode } = useEntryViewMode(VIEW_MODE_STORAGE_KEY);

  useEffect(() => setDraft(searchState), [searchState]);

  const navigate = useCallback(
    (nextState: EntrySearchParams) => {
      startTransition(() => {
        router.replace(buildEntryUrl(nextState, pathname));
      });
    },
    [pathname, router],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
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
  }, [searchState]);

  const updateDraft = <Key extends keyof EntrySearchParams>(
    key: Key,
    value: EntrySearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    switch (key) {
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

  const desktopViewOptions = [
    { value: "grid" as const, label: "Grade", icon: LayoutGrid },
    { value: "table" as const, label: "Tabela", icon: Table2 },
  ];
  const mobileViewOptions = [
    { value: "grid" as const, label: "Grade", icon: LayoutGrid },
    { value: "cards" as const, label: "Lista de cards", icon: Rows3 },
  ];

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
            hasChanges={JSON.stringify(draft) !== JSON.stringify(searchState)}
            onOpenChange={(open) => {
              if (open) setDraft(searchState);
              setFilterOpen(open);
            }}
            onClear={clearFilters}
            onApply={() => {
              navigate({ ...draft, page: 0 });
              setFilterOpen(false);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="entry-sort">Ordenar por</Label>
                <select
                  id="entry-sort"
                  className={SELECT_CLASS}
                  value={draft.sort}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("sort", event.target.value as EntrySort)
                  }
                >
                  <option value="entry-date">Data de entrada</option>
                  <option value="id">ID</option>
                  <option value="created-at">Data de cadastro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-order">Direção</Label>
                <select
                  id="entry-order"
                  className={SELECT_CLASS}
                  value={draft.order}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("order", event.target.value as EntryOrder)
                  }
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-limit">Registros por página</Label>
              <select
                id="entry-limit"
                className={SELECT_CLASS}
                value={draft.limit}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "limit",
                    Number(event.target.value) as EntryPageLimit,
                  )
                }
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </RegistryFilterSheet>
          <EntryViewModeToggle
            viewMode={viewMode}
            options={desktopViewOptions}
            onToggle={updateViewMode}
            className="hidden md:inline-flex"
          />
          <EntryViewModeToggle
            viewMode={viewMode}
            options={mobileViewOptions}
            onToggle={updateViewMode}
            className="md:hidden"
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
        onOpenFilters={() => {
          setDraft(searchState);
          setFilterOpen(true);
        }}
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
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
