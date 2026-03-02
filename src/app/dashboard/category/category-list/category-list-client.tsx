"use client";

/**
 * Componente Client isolado para gerenciar interatividade da lista de categorias
 *
 * Responsabilidades:
 * - Gerenciar estado local de paginação (load more)
 * - Gerenciar modo de visualização
 * - Navegar com URL params quando filtros mudam
 * - Delegar busca de dados ao servidor
 *
 * Localização: /dashboard/category/category-list
 */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { FindCategoriesParams } from "@/app/actions/action-categories";
import { findCategories } from "@/app/actions/action-categories";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { CategoryFiltersClient } from "./_components/CategoryFiltersClient";
import { CategoryGrid } from "./_components/CategoryGrid";

type ViewMode = "grid" | "list";

interface CategoryListClientProps {
  initialCategories: TaxonomyData[];
  totalCategories: number;
  currentSearch: string;
  currentSort: string;
  currentView: ViewMode;
}

export function CategoryListClient({
  initialCategories,
  totalCategories,
  currentSearch,
  currentSort,
  currentView,
}: CategoryListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado local para paginação de load more (lista infinita)
  const [categories, setCategories] =
    useState<TaxonomyData[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCategories.length === 20);

  // Estado local para modo de visualização - usar "list" como padrão para evitar flash
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => currentView || "list",
  );

  useEffect(() => {
    if (!currentView) {
      return;
    }

    setViewMode((previous) => {
      if (previous === currentView) {
        return previous;
      }

      return currentView;
    });
  }, [currentView]);

  // Loading states
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Busca = muda URL + Server Component recarrega
   * Reset local automático via novo render
   */
  const handleSearch = useCallback(
    (term: string) => {
      startTransition(() => {
        const searchParams = new URLSearchParams(
          typeof window !== "undefined" ? window.location.search : "",
        );

        if (term.trim()) {
          searchParams.set("search", term.trim());
        } else {
          searchParams.delete("search");
        }

        if (viewMode === "list") {
          searchParams.delete("view");
        } else {
          searchParams.set("view", viewMode);
        }

        const queryString = searchParams.toString();
        router.push(queryString ? `?${queryString}` : "?");
        // Server Component recarrega com novo search
        // Estado local reseta automaticamente
      });
    },
    [router, viewMode],
  );

  /**
   * Ordenação = muda URL + Server Component recarrega
   */
  const handleSort = useCallback(
    (column: string, order: string) => {
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );

      searchParams.set("sort", `${column}-${order}`);

      if (viewMode === "list") {
        searchParams.delete("view");
      } else {
        searchParams.set("view", viewMode);
      }

      const queryString = searchParams.toString();
      router.push(queryString ? `?${queryString}` : "?");
    },
    [router, viewMode],
  );
  /**
   * Modo de visualização = muda URL
   * Não afeta os dados, apenas a apresentação
   */
  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (mode === "list") {
      params.delete("view");
    } else {
      params.set("view", mode);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, []);

  /**
   * Load More = incrementa página LOCAL e busca mais dados
   * Mantém URL igual (paginação em estado, não na URL)
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      const params: FindCategoriesParams = {
        searchTerm: currentSearch,
        searchType: "name",
        sortColumn: currentSort.includes("-")
          ? Number(currentSort.split("-")[0])
          : 2, // Fallback: coluna 2 (Mais Recente)
        sortOrder: currentSort.includes("-")
          ? Number(currentSort.split("-")[1])
          : 2, // Fallback: ordem decrescente (mais recente primeiro)
        filterStatus: 0,
        page: nextPage,
        perPage: 20,
      };

      const response = await findCategories(params);

      if (response.success) {
        setCategories((prev) => [...prev, ...response.data]);
        setCurrentPage(nextPage);
        setHasMore(response.hasMore);
      } else {
        toast.error(response.error || "Erro ao carregar mais categorias");
      }
    } catch (error) {
      toast.error("Erro ao carregar mais categorias");
      console.error("Erro ao carregar mais:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, currentSearch, currentSort]);

  /**
   * Limpar busca = muda URL com campo vazio
   */
  const handleClear = useCallback(() => {
    const searchParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );

    searchParams.delete("search");
    searchParams.delete("sort");

    if (viewMode === "list") {
      searchParams.delete("view");
    } else {
      searchParams.set("view", viewMode);
    }

    const queryString = searchParams.toString();
    router.push(queryString ? `?${queryString}` : "?");
  }, [router, viewMode]);

  /**
   * Handle delete = Remove item da lista localmente e depois atualiza do servidor
   */
  const handleDelete = useCallback(
    (categoryId: number) => {
      // Remove imediatamente da lista local para feedback rápido
      setCategories((prev) =>
        prev.filter((cat) => cat.ID_TAXONOMY !== categoryId),
      );

      // Depois atualiza do servidor em background
      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            <div className="space-y-6">
              {/* Filtros - muda URL ao interagir */}
              <CategoryFiltersClient
                currentSearch={currentSearch}
                currentSort={currentSort}
                onSearch={handleSearch}
                onSort={handleSort}
                onClear={handleClear}
                onViewChange={handleViewChange}
                totalCategories={totalCategories}
                displayedCategories={categories.length}
                viewMode={viewMode}
              />

              {/* Grid - acumula dados ao clicar "Carregar Mais" */}
              <CategoryGrid
                categories={categories}
                isLoading={isPending}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                viewMode={viewMode}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
