"use client";

/**
 * Hook customizado para gerenciar filtros de categorias
 *
 * Gerencia estado de busca, filtros, ordenação e paginação
 * para a listagem de categorias.
 */

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type FindCategoriesParams,
  findCategories,
} from "@/app/actions/action-categories";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";

/**
 * Interface para filtros de categoria
 */
export interface CategoryFilterOptions {
  searchTerm: string;
  searchType: "name" | "id";
  sortColumn: number;
  sortOrder: number;
}

/**
 * Hook para gerenciar filtros e paginação de categorias
 */
export function useCategoryFilter() {
  // Estado dos filtros
  const [filters, setFilters] = useState<CategoryFilterOptions>({
    searchTerm: "",
    searchType: "name",
    sortColumn: 2, // Coluna 2: Mais Recente
    sortOrder: 2, // Ordem decrescente (mais recente primeiro)
  });

  // Estado dos dados
  const [categories, setCategories] = useState<TaxonomyData[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // MySQL começa em 0
  const [hasMore, setHasMore] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);

  // Estados de carregamento
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Busca inicial de categorias
   */
  const fetchCategories = useCallback(
    async (resetPagination = true) => {
      const pageToFetch = resetPagination ? 0 : currentPage;

      startTransition(async () => {
        try {
          // Captura os filtros atuais no momento da execução
          setFilters((currentFilters) => {
            const params: FindCategoriesParams = {
              searchTerm: currentFilters.searchTerm,
              searchType: currentFilters.searchType,
              sortColumn: currentFilters.sortColumn,
              sortOrder: currentFilters.sortOrder,
              filterStatus: 0, // Sempre buscar apenas categorias ativas
              page: pageToFetch,
              perPage: 20,
            };

            findCategories(params)
              .then((response) => {
                if (response.success) {
                  if (resetPagination) {
                    setCategories(response.data);
                    setCurrentPage(0);
                  } else {
                    setCategories((prev) => [...prev, ...response.data]);
                  }

                  setHasMore(response.hasMore);
                  setTotalCategories(response.total);
                } else {
                  toast.error(response.error || "Erro ao carregar categorias");
                  setCategories([]);
                  setHasMore(false);
                }
              })
              .catch((error) => {
                toast.error("Erro inesperado ao carregar categorias");
                console.error("Erro ao buscar categorias:", error);
                setCategories([]);
                setHasMore(false);
              });

            return currentFilters;
          });
        } catch (error) {
          toast.error("Erro inesperado ao carregar categorias");
          console.error("Erro ao buscar categorias:", error);
          setCategories([]);
          setHasMore(false);
        }
      });
    },
    [currentPage],
  );
  /**
   * Carrega mais categorias (paginação)
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      // Captura os filtros atuais no momento da execução
      const currentFilters = await new Promise<CategoryFilterOptions>(
        (resolve) => {
          setFilters((filters) => {
            resolve(filters);
            return filters;
          });
        },
      );
      const params: FindCategoriesParams = {
        searchTerm: currentFilters.searchTerm,
        searchType: currentFilters.searchType,
        sortColumn: currentFilters.sortColumn,
        sortOrder: currentFilters.sortOrder,
        filterStatus: 0, // Sempre buscar apenas categorias ativas
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
  }, [currentPage, hasMore, isLoadingMore]);

  /**
   * Atualiza filtros sem recarregar dados automaticamente
   */
  const updateFilters = useCallback(
    (newFilters: Partial<CategoryFilterOptions>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );
  /**
   * Reseta todos os filtros para valores padrão
   */
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      searchType: "name",
      sortColumn: 2, // Coluna 2: Mais Recente
      sortOrder: 2, // Ordem decrescente (mais recente primeiro)
    });
  }, []);

  /**
   * Executa busca (ao clicar no botão buscar)
   */
  const handleSearch = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  /**
   * Limpa busca e recarrega automaticamente
   */
  const clearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
    // Busca automaticamente após limpar para mostrar todos os resultados
    setTimeout(() => fetchCategories(true), 0);
  }, [fetchCategories]);

  return {
    // Estados
    filters,
    categories,
    hasMore,
    totalCategories,
    displayedCategories: categories.length,

    // Loading states
    isLoading: isPending,
    isLoadingMore,

    // Actions
    updateFilters,
    resetFilters,
    handleSearch,
    clearSearch,
    loadMore,
    fetchCategories,
  };
}
