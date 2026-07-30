"use client";

import { Grid3X3, List, Plus, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerCreateSheet } from "./customer-create-sheet";
import { CustomerFilterPanel } from "./customer-filter-panel";
import {
  buildCustomerDetailHref,
  buildCustomerUrl,
  countCustomerFilters,
} from "./lib/search-params";
import {
  type CustomerSearchParams,
  type CustomerViewMode,
  DEFAULT_CUSTOMER_LIMIT,
} from "./types/customer-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:customer-view-mode";

interface CustomerToolbarProps {
  searchState: CustomerSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

function getDefaultFilters(search: string): CustomerSearchParams {
  return {
    search,
    categoryId: 0,
    clientType: 0,
    personType: 0,
    noImage: false,
    approved: 0,
    gender: 0,
    restricted: 0,
    enabled: 0,
    statusId: 0,
    operation: 0,
    startDate: "",
    endDate: "",
    sort: "id",
    order: "desc",
    page: 0,
    limit: DEFAULT_CUSTOMER_LIMIT,
  };
}

export function CustomerToolbar({
  searchState,
  grid,
  list,
}: CustomerToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchState.search);
  const [viewMode, setViewMode] = useState<CustomerViewMode>("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const filterCount = countCustomerFilters(searchState);

  useEffect(() => setSearch(searchState.search), [searchState.search]);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "grid" || stored === "list") setViewMode(stored);
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }, []);

  const navigate = useCallback(
    (nextState: CustomerSearchParams) => {
      startTransition(() =>
        router.replace(buildCustomerUrl(nextState, pathname)),
      );
    },
    [pathname, router],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ ...searchState, search: search.trim(), page: 0 });
  };

  const toggleViewMode = () => {
    const next: CustomerViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(next);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  };

  const handleCreated = (customerId: number) => {
    const recentState = getDefaultFilters("");
    startTransition(() => {
      router.push(buildCustomerDetailHref(customerId, recentState));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="flex min-w-[min(100%,18rem)] flex-1 items-center"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                maxLength={300}
                placeholder="Buscar cliente..."
                className="h-11 rounded-r-none border-r-0 pr-9 pl-9"
                disabled={isPending}
                aria-label="Pesquisar clientes"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    if (searchState.search)
                      navigate({ ...searchState, search: "", page: 0 });
                  }}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 px-3"
                  aria-label="Limpar pesquisa"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 rounded-l-none"
              disabled={isPending || search.trim() === searchState.search}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </Button>
          </form>

          <CustomerFilterPanel
            filters={searchState}
            open={isFilterOpen}
            pending={isPending}
            onOpenChange={setIsFilterOpen}
            onApply={navigate}
            onClear={() => navigate(getDefaultFilters(searchState.search))}
          />

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={toggleViewMode}
            aria-label={
              viewMode === "grid" ? "Exibir como lista" : "Exibir como grade"
            }
          >
            {viewMode === "grid" ? (
              <List className="size-4" />
            ) : (
              <Grid3X3 className="size-4" />
            )}
          </Button>

          <Button
            type="button"
            className="h-11"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" />
            <span className="hidden lg:inline">Adicionar cliente</span>
            <span className="sr-only lg:hidden">Adicionar cliente</span>
          </Button>
        </div>
      </div>

      {filterCount > 0 && (
        <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
          <p className="text-sm">
            {filterCount}{" "}
            {filterCount === 1
              ? "filtro ou ordenação aplicado"
              : "filtros ou ordenações aplicados"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => navigate(getDefaultFilters(searchState.search))}
          >
            Limpar filtros
          </Button>
        </div>
      )}

      <div className="relative">
        {isPending && (
          <div className="bg-background/70 absolute inset-0 z-10 flex items-start justify-center pt-16 backdrop-blur-sm">
            <span className="text-muted-foreground text-sm">
              Atualizando resultados...
            </span>
          </div>
        )}
        <div className={isPending ? "opacity-50" : undefined}>
          {viewMode === "grid" ? grid : list}
        </div>
      </div>

      <CustomerCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
