"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { BrandCreateSheet } from "../brand-create/brand-create-sheet";
import { buildBrandUrl } from "../lib/search-params";
import type {
  BrandSearchParams,
  BrandViewMode,
} from "../types/brand-dashboard-types";
import { BrandSearch } from "./brand-search";
import { BrandViewModeToggle } from "./brand-view-mode-toggle";

interface BrandToolbarProps {
  searchState: BrandSearchParams;
  grid: ReactNode;
  list: ReactNode;
}

/**
 * Toolbar client da central de marcas. Mantem busca e pagina na URL e o modo de
 * visualizacao + painel de criacao como estado efemero da sessao. Recebe as
 * variantes grid e list ja produzidas no servidor e decide qual exibir.
 */
export function BrandToolbar({ searchState, grid, list }: BrandToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<BrandViewMode>("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSearch = useCallback(
    (term: string) => {
      startTransition(() => {
        router.replace(
          buildBrandUrl(
            { search: term, page: 0, brandId: searchState.brandId },
            pathname,
          ),
        );
        router.refresh();
      });
    },
    [router, pathname, searchState.brandId],
  );

  const handleCreated = useCallback(
    (brandId: number) => {
      startTransition(() => {
        router.replace(
          buildBrandUrl(
            {
              search: searchState.search,
              page: searchState.page,
              brandId,
              productPage: 0,
            },
            pathname,
          ),
        );
        router.refresh();
      });
    },
    [router, pathname, searchState.search, searchState.page],
  );

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-3 flex border-b px-3 py-3 shadow-sm backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex w-full flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <BrandSearch
              searchTerm={searchState.search}
              isLoading={isPending}
              onSearch={handleSearch}
              actions={
                <BrandViewModeToggle
                  viewMode={viewMode}
                  onChange={setViewMode}
                />
              }
            />
          </div>
          <Button
            type="button"
            className="h-11 shrink-0 gap-2 shadow-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Adicionar marca</span>
            <span className="sr-only sm:hidden">Adicionar marca</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        {isPending && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="border-primary border-t-transparent h-6 w-6 animate-spin rounded-full border-2" />
                <span className="text-lg font-medium">
                  Pesquisando marcas...
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Aguarde enquanto carregamos os resultados
              </p>
            </div>
          </div>
        )}
        <div className={isPending ? "opacity-50" : undefined}>
          {viewMode === "list" ? list : grid}
        </div>
      </div>

      <BrandCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
