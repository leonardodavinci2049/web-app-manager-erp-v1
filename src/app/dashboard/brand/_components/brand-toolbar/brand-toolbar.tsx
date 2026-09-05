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
import { BrandCreateSheet } from "../brand-create/brand-create-sheet";
import { buildBrandDetailHref, buildBrandUrl } from "../lib/search-params";
import {
  BRAND_PAGE_SIZE,
  type BrandOrder,
  type BrandPageLimit,
  type BrandSearchParams,
  type BrandSort,
} from "../types/brand-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:brand-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface BrandToolbarProps {
  searchState: BrandSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(state: BrandSearchParams): BrandSearchParams {
  return {
    ...state,
    sort: "id",
    order: "desc",
    page: 0,
    limit: BRAND_PAGE_SIZE,
    accum: 0,
  };
}

export function BrandToolbar({ searchState, grid, list }: BrandToolbarProps) {
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
    (nextState: BrandSearchParams) => {
      startTransition(() => {
        router.replace(buildBrandUrl(nextState, pathname));
      });
    },
    [pathname, router],
  );

  const activeFilters = useMemo<RegistryActiveFilter[]>(() => {
    const filters: RegistryActiveFilter[] = [];
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
    if (searchState.limit !== BRAND_PAGE_SIZE) {
      filters.push({
        key: "limit",
        label: "Por página",
        value: String(searchState.limit),
      });
    }
    return filters;
  }, [searchState]);

  const updateDraft = <Key extends keyof BrandSearchParams>(
    key: Key,
    value: BrandSearchParams[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearFilters = () => {
    navigate(getDefaultFilters(searchState));
    setFilterOpen(false);
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case "sort":
        navigate({ ...searchState, sort: "id", page: 0, accum: 0 });
        break;
      case "order":
        navigate({ ...searchState, order: "desc", page: 0, accum: 0 });
        break;
      case "limit":
        navigate({
          ...searchState,
          limit: BRAND_PAGE_SIZE,
          page: 0,
          accum: 0,
        });
        break;
    }
  };

  const handleCreated = useCallback(
    (brandId: number) => {
      startTransition(() => {
        router.replace(buildBrandDetailHref(brandId, searchState, pathname));
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
            placeholder="Buscar marca..."
            accessibleLabel="Pesquisar marcas"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="brand-sort">Ordenar por</Label>
                <select
                  id="brand-sort"
                  className={SELECT_CLASS}
                  value={draft.sort}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("sort", event.target.value as BrandSort)
                  }
                >
                  <option value="id">ID</option>
                  <option value="name">Nome</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-order">Direção</Label>
                <select
                  id="brand-order"
                  className={SELECT_CLASS}
                  value={draft.order}
                  disabled={isPending}
                  onChange={(event) =>
                    updateDraft("order", event.target.value as BrandOrder)
                  }
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-limit">Registros por página</Label>
              <select
                id="brand-limit"
                className={SELECT_CLASS}
                value={draft.limit}
                disabled={isPending}
                onChange={(event) =>
                  updateDraft(
                    "limit",
                    Number(event.target.value) as BrandPageLimit,
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
            aria-label="+ Novo cadastro de marca"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">+ Novo Cadastro</span>
            <span className="sr-only lg:hidden">+ Novo cadastro de marca</span>
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
        {viewMode === "list" ? list : grid}
      </RegistryResults>

      <RegistryMobileBottomBar
        label="marcas"
        filterCount={activeFilters.length}
        filterOpen={filterOpen}
        onOpenFilters={() => {
          setDraft(searchState);
          setFilterOpen(true);
        }}
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        addLabel="Adicionar marca"
        addOpen={createOpen}
        onAdd={() => setCreateOpen(true)}
      />

      <BrandCreateSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
