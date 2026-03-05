"use client";

/**
 * Componente de Grid para exibir categorias
 *
 * Exibe cards de categorias em layout responsivo com loading e empty states
 * Suporta modo grid e list
 */

import { FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { CategoryCardGrid } from "./CategoryCardGrid";
import { CategoryCardList } from "./CategoryCardList";

type ViewMode = "grid" | "list";

interface CategoryGridProps {
  categories: TaxonomyData[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  viewMode?: ViewMode;
  onDelete?: (categoryId: number) => void;
}

/**
 * Skeleton para carregamento inicial
 */
function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
        <div key={`skeleton-cat-${index}`} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CategoryGrid({
  categories,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  viewMode = "list",
  onDelete,
}: CategoryGridProps) {
  // Loading inicial
  if (isLoading && categories.length === 0) {
    return viewMode === "grid" ? (
      <CategoryGridSkeleton />
    ) : (
      <CategoryCardList categories={[]} isLoading={true} onDelete={onDelete} />
    );
  }

  // Empty State
  if (categories.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">
          Nenhuma categoria encontrada
        </h3>
        <p className="max-w-md text-muted-foreground">
          Tente ajustar os filtros ou busca
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid ou List de Categorias */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCardGrid
              key={category.ID_TAXONOMY}
              category={category}
              onDelete={() => onDelete?.(category.ID_TAXONOMY)}
            />
          ))}
        </div>
      ) : (
        <CategoryCardList
          categories={categories}
          isLoading={false}
          onDelete={onDelete}
        />
      )}

      {/* Loading State para paginação */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>
      )}

      {/* Botão Carregar Mais */}
      {!isLoadingMore && hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="min-w-[200px]"
            disabled={isLoadingMore}
          >
            Carregar Mais
          </Button>
        </div>
      )}

      {/* Indicador de fim da lista */}
      {!isLoadingMore && !hasMore && categories.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Todas as categorias foram carregadas
          </p>
        </div>
      )}
    </div>
  );
}
