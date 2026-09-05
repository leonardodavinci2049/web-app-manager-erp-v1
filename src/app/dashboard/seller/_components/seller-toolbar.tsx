"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { buildSellerUrl } from "./lib/search-params";
import {
  DEFAULT_SELLER_LIMIT,
  type SellerCategory,
  type SellerOrder,
  type SellerPageLimit,
  type SellerSearchParams,
  type SellerSort,
  type SellerStatus,
} from "./types/seller-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:seller-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface SellerToolbarProps {
  searchState: SellerSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(search: string): SellerSearchParams {
  return {
    search,
    category: 0,
    noImage: false,
    status: "all",
    sort: "id",
    order: "desc",
    page: 0,
    limit: DEFAULT_SELLER_LIMIT,
  };
}

export function SellerToolbar({ searchState, grid, list }: SellerToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState(searchState);
  const { viewMode, toggleViewMode } = useRegistryViewMode(
    VIEW_MODE_STORAGE_KEY,
  );

  useEffect(() => setDraft(searchState), [searchState]);

  const navigate = useCallback(
    (nextState: SellerSearchParams) => {
      startTransition(() =>
        router.replace(buildSellerUrl(nextState, pathname)),
      );
    },
    [pathname, router],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
    if (searchState.category !== 0) {
      const labels = ["", "Atacado", "Varejo", "Não informado"];
      filters.push({
        key: "category",
        label: "Categoria",
        value: labels[searchState.category],
      });
    }
    if (searchState.status !== "all") {
      filters.push({
        key: "status",
        label: "Status",
        value: searchState.status === "active" ? "Ativos" : "Inativos",
      });
    }
    if (searchState.noImage) {
      filters.push({ key: "noImage", label: "Imagem", value: "Sem imagem" });
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
    if (searchState.limit !== DEFAULT_SELLER_LIMIT) {
      filters.push({
        key: "limit",
        label: "Por página",
        value: String(searchState.limit),
      });
    }
    return filters;
  }, [searchState]);

  const updateDraft = <Key extends keyof SellerSearchParams>(
    key: Key,
    value: SellerSearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState.search));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    const defaults = getDefaultFilters(searchState.search);
    navigate({
      ...searchState,
      [key]: defaults[key as keyof SellerSearchParams],
      page: 0,
    });
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-2">
          <RegistrySearch
            value={searchState.search}
            placeholder="Buscar vendedor..."
            accessibleLabel="Pesquisar vendedores"
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
            <div className="space-y-2">
              <Label htmlFor="seller-category">Categoria</Label>
              <select
                id="seller-category"
                className={SELECT_CLASS}
                value={draft.category}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "category",
                    Number(event.target.value) as SellerCategory,
                  )
                }
              >
                <option value={0}>Todas</option>
                <option value={1}>Atacado</option>
                <option value={2}>Varejo</option>
                <option value={3}>Não informado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-status">Status</Label>
              <select
                id="seller-status"
                className={SELECT_CLASS}
                value={draft.status}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft("status", event.target.value as SellerStatus)
                }
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <label
              htmlFor="seller-no-image"
              className="flex min-h-11 items-center justify-between gap-3 rounded-md border px-3"
            >
              <span className="text-sm">Somente vendedores sem imagem</span>
              <Checkbox
                id="seller-no-image"
                checked={draft.noImage}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  updateDraft("noImage", checked === true)
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="seller-sort">Ordenar por</Label>
                <select
                  id="seller-sort"
                  className={SELECT_CLASS}
                  value={draft.sort}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("sort", event.target.value as SellerSort)
                  }
                >
                  <option value="id">ID</option>
                  <option value="name">Nome</option>
                  <option value="last-purchase">Última compra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller-order">Direção</Label>
                <select
                  id="seller-order"
                  className={SELECT_CLASS}
                  value={draft.order}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("order", event.target.value as SellerOrder)
                  }
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-limit">Registros por página</Label>
              <select
                id="seller-limit"
                className={SELECT_CLASS}
                value={draft.limit}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "limit",
                    Number(event.target.value) as SellerPageLimit,
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
        label="vendedores"
        filterCount={activeFilters.length}
        filterOpen={filterOpen}
        onOpenFilters={() => {
          setDraft(searchState);
          setFilterOpen(true);
        }}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
    </div>
  );
}
