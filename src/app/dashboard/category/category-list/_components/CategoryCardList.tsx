"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

/**
 * Props for CategoryList Component
 */
interface CategoryListProps {
  categories: TaxonomyData[];
  isLoading?: boolean;
  onDelete?: (categoryId: number) => void;
}

/**
 * CategoryList Component
 *
 * Displays categories in a list layout (row format)
 * Each row shows: ID, Image, Name, Slug, Parent, Level, Products
 */
export function CategoryCardList({
  categories,
  isLoading = false,
  onDelete,
}: CategoryListProps) {
  const router = useRouter();

  // Função para navegar para detalhes da categoria
  const handleViewDetails = (categoryId: number) => {
    router.push(`/dashboard/category/category-details?id=${categoryId}`);
  };

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have stable IDs
            key={index}
            className="p-4"
          >
            {/* Layout responsivo do skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Seção superior do skeleton */}
              <div className="flex items-center gap-3 sm:flex-1">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 sm:w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                {/* Botão skeleton mobile */}
                <Skeleton className="h-8 w-8 sm:hidden" />
              </div>

              {/* Seção inferior do skeleton */}
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                {/* Botão skeleton desktop */}
                <Skeleton className="hidden h-8 w-20 sm:block" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-muted-foreground mb-4 mt-2 text-sm">
            Tente ajustar os filtros ou busca
          </p>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <Card
          key={category.ID_TAXONOMY}
          className="hover:bg-accent transition-colors duration-200"
        >
          {/* Layout responsivo: horizontal em desktop, vertical em mobile */}
          <div className="flex flex-col gap-3 px-4 py-1 sm:flex-row sm:items-center sm:gap-4">
            {/* Seção superior: Imagem + Info principal + Botão (mobile) */}
            <div className="flex items-center gap-3 sm:flex-1">
              {/* Image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                {category.PATH_IMAGEM ? (
                  <Image
                    src={category.PATH_IMAGEM}
                    alt={category.TAXONOMIA}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{category.TAXONOMIA}</h3>
                <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:text-sm">
                  <span className="truncate">ID: {category.ID_TAXONOMY}</span>
                  {category.PARENT_ID !== 0 && (
                    <span className="truncate">
                      Categoria Pai: {category.PARENT_ID}
                    </span>
                  )}
                </div>
              </div>

              {/* Botão de Detalhe - visível apenas em mobile */}
              <div className="flex flex-shrink-0 sm:hidden">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => handleViewDetails(category.ID_TAXONOMY)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Seção inferior: Badges + Botão (desktop) */}
            <div className="flex items-center justify-between gap-2 sm:flex-shrink-0 sm:justify-end">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {category.LEVEL !== null && category.LEVEL !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Nível {category.LEVEL}
                  </Badge>
                )}
                {category.QT_RECORDS !== null &&
                  category.QT_RECORDS !== undefined &&
                  category.QT_RECORDS > 0 && (
                    <Badge variant="default" className="text-xs">
                      {category.QT_RECORDS} Produtos
                    </Badge>
                  )}
              </div>

              {/* Botões de Ação - visível apenas em desktop */}
              <div className="hidden sm:flex sm:flex-shrink-0 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleViewDetails(category.ID_TAXONOMY)}
                >
                  <ChevronRight className="h-4 w-4" />
                  Detalhe
                </Button>
                <DeleteCategoryDialog
                  categoryId={category.ID_TAXONOMY}
                  categoryName={category.TAXONOMIA}
                  onSuccess={() => onDelete?.(category.ID_TAXONOMY)}
                  variant="outline"
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
