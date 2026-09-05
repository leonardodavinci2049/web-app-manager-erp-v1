"use client";

import { Plus } from "lucide-react";
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
  RegistryViewModeToggle,
  useRegistryViewMode,
} from "@/app/dashboard/_components/registry";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { buildPtypeDetailHref, buildPtypeUrl } from "./lib/search-params";
import { PtypeCreateSheet } from "./ptype-create-sheet";
import {
  DEFAULT_PTYPE_LIMIT,
  type PtypeOrder,
  type PtypePageLimit,
  type PtypeSearchParams,
  type PtypeSort,
  type PtypeStatus,
} from "./types/ptype-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:ptype-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface PtypeToolbarProps {
  searchState: PtypeSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(search: string): PtypeSearchParams {
  return {
    search,
    status: "all",
    sort: "id",
    order: "desc",
    page: 0,
    limit: DEFAULT_PTYPE_LIMIT,
    accum: 0,
  };
}

export function PtypeToolbar({ searchState, grid, list }: PtypeToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState(searchState);
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  useEffect(() => setDraft(searchState), [searchState]);

  const navigate = useCallback(
    (nextState: PtypeSearchParams) => {
      startTransition(() => router.replace(buildPtypeUrl(nextState, pathname)));
    },
    [pathname, router],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
    if (searchState.status !== "all") {
      filters.push({
        key: "status",
        label: "Status",
        value: searchState.status === "active" ? "Ativos" : "Inativos",
      });
    }
    if (searchState.sort !== "id") {
      filters.push({ key: "sort", label: "Ordenação", value: "Nome" });
    }
    if (searchState.order !== "desc") {
      filters.push({
        key: "order",
        label: "Direção",
        value: "Crescente",
      });
    }
    if (searchState.limit !== DEFAULT_PTYPE_LIMIT) {
      filters.push({
        key: "limit",
        label: "Por página",
        value: String(searchState.limit),
      });
    }
    return filters;
  }, [searchState]);

  const updateDraft = <Key extends keyof PtypeSearchParams>(
    key: Key,
    value: PtypeSearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState.search));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    const defaults = getDefaultFilters(searchState.search);
    switch (key) {
      case "status":
        navigate({
          ...searchState,
          status: defaults.status,
          page: 0,
          accum: 0,
        });
        break;
      case "sort":
        navigate({ ...searchState, sort: defaults.sort, page: 0, accum: 0 });
        break;
      case "order":
        navigate({ ...searchState, order: defaults.order, page: 0, accum: 0 });
        break;
      case "limit":
        navigate({ ...searchState, limit: defaults.limit, page: 0, accum: 0 });
        break;
    }
  };

  const handleCreated = (ptypeId: number) => {
    startTransition(() => {
      router.replace(
        buildPtypeDetailHref(ptypeId, {
          ...getDefaultFilters(""),
          limit: searchState.limit,
        }),
      );
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar por nome ou ID..."
            accessibleLabel="Pesquisar tipos de produtos"
            maxLength={100}
            pending={isPending}
            onSearch={(search) =>
              navigate({ ...searchState, search, page: 0, accum: 0 })
            }
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
              navigate({ ...draft, page: 0, accum: 0 });
              setFilterOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="ptype-status">Status</Label>
              <select
                id="ptype-status"
                className={SELECT_CLASS}
                value={draft.status}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft("status", event.target.value as PtypeStatus)
                }
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ptype-sort">Ordenar por</Label>
                <select
                  id="ptype-sort"
                  className={SELECT_CLASS}
                  value={draft.sort}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("sort", event.target.value as PtypeSort)
                  }
                >
                  <option value="id">ID</option>
                  <option value="name">Nome</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptype-order">Direção</Label>
                <select
                  id="ptype-order"
                  className={SELECT_CLASS}
                  value={draft.order}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("order", event.target.value as PtypeOrder)
                  }
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ptype-limit">Registros por página</Label>
              <select
                id="ptype-limit"
                className={SELECT_CLASS}
                value={draft.limit}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "limit",
                    Number(event.target.value) as PtypePageLimit,
                  )
                }
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </RegistryFilterSheet>
          <RegistryViewModeToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            className="hidden md:inline-flex"
          />
          <Button
            type="button"
            className="hidden h-11 shrink-0 md:ml-auto md:inline-flex"
            onClick={() => setCreateOpen(true)}
            aria-label="+ Novo cadastro de tipo"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">+ Novo Cadastro</span>
            <span className="sr-only lg:hidden">+ Novo cadastro de tipo</span>
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
        {viewMode === "grid" ? grid : list}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="tipos de produtos"
        filterCount={activeFilters.length}
        filterOpen={filterOpen}
        onOpenFilters={() => {
          setDraft(searchState);
          setFilterOpen(true);
        }}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        addLabel="Adicionar tipo"
        addOpen={createOpen}
        onAdd={() => setCreateOpen(true)}
      />

      <PtypeCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
