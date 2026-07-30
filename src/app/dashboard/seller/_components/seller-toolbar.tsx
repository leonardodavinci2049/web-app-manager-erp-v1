"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Grid3X3,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { buildSellerUrl } from "./lib/search-params";
import type {
  SellerCategory,
  SellerOrder,
  SellerPageLimit,
  SellerSearchParams,
  SellerSort,
  SellerStatus,
  SellerViewMode,
} from "./types/seller-dashboard-types";

const VIEW_MODE_STORAGE_KEY = "dashboard:seller-view-mode";
const SELECT_CLASS =
  "border-input bg-background h-10 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface SellerToolbarProps {
  searchState: SellerSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

export function SellerToolbar({ searchState, grid, list }: SellerToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchState.search);
  const [viewMode, setViewMode] = useState<SellerViewMode>("grid");

  useEffect(() => setSearch(searchState.search), [searchState.search]);
  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === "grid" || stored === "list") setViewMode(stored);
  }, []);

  const navigate = useCallback(
    (
      changes: Partial<SellerSearchParams>,
      options: { resetPage?: boolean } = {},
    ) => {
      const nextState: SellerSearchParams = {
        ...searchState,
        ...changes,
        page: options.resetPage ? 0 : (changes.page ?? searchState.page),
      };
      startTransition(() =>
        router.replace(buildSellerUrl(nextState, pathname)),
      );
    },
    [pathname, router, searchState],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ search: search.trim() }, { resetPage: true });
  };

  const toggleViewMode = () => {
    const next: SellerViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(next);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 space-y-3 border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
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
                placeholder="Buscar vendedor..."
                className="h-11 rounded-r-none border-r-0 pr-9 pl-9"
                disabled={isPending}
                aria-label="Pesquisar vendedores"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    if (searchState.search)
                      navigate({ search: "" }, { resetPage: true });
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
          <Button type="button" className="h-10" disabled>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Adicionar vendedor</span>
            <Badge variant="secondary">Pendente de API</Badge>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Categoria</span>
            <select
              className={SELECT_CLASS}
              value={searchState.category}
              disabled={isPending}
              onChange={(event) =>
                navigate(
                  {
                    category: Number(event.target.value) as SellerCategory,
                  },
                  { resetPage: true },
                )
              }
            >
              <option value={0}>Todas</option>
              <option value={1}>Atacado</option>
              <option value={2}>Varejo</option>
              <option value={3}>Não informado</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Status</span>
            <select
              className={SELECT_CLASS}
              value={searchState.status}
              disabled={isPending}
              onChange={(event) =>
                navigate(
                  { status: event.target.value as SellerStatus },
                  { resetPage: true },
                )
              }
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </label>
          <label
            htmlFor="seller-no-image"
            className="flex h-10 items-center gap-2 rounded-md border px-3"
          >
            <Checkbox
              id="seller-no-image"
              checked={searchState.noImage}
              disabled={isPending}
              onCheckedChange={(checked) =>
                navigate({ noImage: checked === true }, { resetPage: true })
              }
            />
            <span className="text-xs">Sem imagem</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Ordenar</span>
            <select
              className={SELECT_CLASS}
              value={searchState.sort}
              disabled={isPending}
              onChange={(event) =>
                navigate(
                  { sort: event.target.value as SellerSort },
                  { resetPage: true },
                )
              }
            >
              <option value="id">ID</option>
              <option value="name">Nome</option>
              <option value="last-purchase">Última compra</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            disabled={isPending}
            onClick={() =>
              navigate(
                {
                  order: (searchState.order === "asc"
                    ? "desc"
                    : "asc") satisfies SellerOrder,
                },
                { resetPage: true },
              )
            }
            aria-label={
              searchState.order === "asc"
                ? "Alterar para ordem decrescente"
                : "Alterar para ordem crescente"
            }
          >
            {searchState.order === "asc" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowUpAZ className="size-4" />
            )}
          </Button>
          <label className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Por página</span>
            <select
              className={SELECT_CLASS}
              value={searchState.limit}
              disabled={isPending}
              onChange={(event) =>
                navigate(
                  { limit: Number(event.target.value) as SellerPageLimit },
                  { resetPage: true },
                )
              }
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

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
    </div>
  );
}
