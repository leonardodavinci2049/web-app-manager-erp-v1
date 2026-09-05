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
import { buildSupplierDetailHref, buildSupplierUrl } from "./lib/search-params";
import { SupplierCreateSheet } from "./supplier-create-sheet";
import {
  DEFAULT_SUPPLIER_LIMIT,
  type SupplierOrder,
  type SupplierPageLimit,
  type SupplierSearchParams,
  type SupplierSort,
  type SupplierStatus,
} from "./types/supplier-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:supplier-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface SupplierToolbarProps {
  searchState: SupplierSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(search: string): SupplierSearchParams {
  return {
    search,
    status: "all",
    sort: "id",
    order: "desc",
    page: 0,
    limit: DEFAULT_SUPPLIER_LIMIT,
    accum: 0,
  };
}

export function SupplierToolbar({
  searchState,
  grid,
  list,
}: SupplierToolbarProps) {
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
    (nextState: SupplierSearchParams) => {
      startTransition(() =>
        router.replace(buildSupplierUrl(nextState, pathname)),
      );
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
      filters.push({
        key: "sort",
        label: "Ordenação",
        value: searchState.sort === "name" ? "Nome" : "Data da última compra",
      });
    }
    if (searchState.order !== "desc") {
      filters.push({
        key: "order",
        label: "Direção",
        value: "Crescente",
      });
    }
    if (searchState.limit !== DEFAULT_SUPPLIER_LIMIT) {
      filters.push({
        key: "limit",
        label: "Por página",
        value: String(searchState.limit),
      });
    }
    return filters;
  }, [searchState]);

  const updateDraft = <Key extends keyof SupplierSearchParams>(
    key: Key,
    value: SupplierSearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState.search));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case "status":
        navigate({ ...searchState, status: "all", page: 0, accum: 0 });
        break;
      case "sort":
        navigate({ ...searchState, sort: "id", page: 0, accum: 0 });
        break;
      case "order":
        navigate({ ...searchState, order: "desc", page: 0, accum: 0 });
        break;
      case "limit":
        navigate({
          ...searchState,
          limit: DEFAULT_SUPPLIER_LIMIT,
          page: 0,
          accum: 0,
        });
        break;
    }
  };

  const handleCreated = (supplierId: number) => {
    const recentState = {
      ...getDefaultFilters(""),
      limit: searchState.limit,
    };
    startTransition(() => {
      router.push(buildSupplierDetailHref(supplierId, recentState));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar fornecedor..."
            accessibleLabel="Pesquisar fornecedores"
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
              <Label htmlFor="supplier-status">Status</Label>
              <select
                id="supplier-status"
                className={SELECT_CLASS}
                value={draft.status}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft("status", event.target.value as SupplierStatus)
                }
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="supplier-sort">Ordenar por</Label>
                <select
                  id="supplier-sort"
                  className={SELECT_CLASS}
                  value={draft.sort}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("sort", event.target.value as SupplierSort)
                  }
                >
                  <option value="id">ID</option>
                  <option value="name">Nome</option>
                  <option value="last-purchase">Última compra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-order">Direção</Label>
                <select
                  id="supplier-order"
                  className={SELECT_CLASS}
                  value={draft.order}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("order", event.target.value as SupplierOrder)
                  }
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-limit">Registros por página</Label>
              <select
                id="supplier-limit"
                className={SELECT_CLASS}
                value={draft.limit}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "limit",
                    Number(event.target.value) as SupplierPageLimit,
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
            aria-label="+ Novo cadastro de fornecedor"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">+ Novo Cadastro</span>
            <span className="sr-only lg:hidden">
              + Novo cadastro de fornecedor
            </span>
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
        label="fornecedores"
        filterCount={activeFilters.length}
        filterOpen={filterOpen}
        onOpenFilters={() => {
          setDraft(searchState);
          setFilterOpen(true);
        }}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        addLabel="Adicionar fornecedor"
        addOpen={createOpen}
        onAdd={() => setCreateOpen(true)}
      />

      <SupplierCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
