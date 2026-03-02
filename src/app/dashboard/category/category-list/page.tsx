/**
 * Página de Listagem de Categorias - Server Component
 *
 * Renderiza a página principal de categorias como Server Component
 * Busca dados no servidor e passa para Client Component isolado
 *
 * Localização: /dashboard/category/category-list
 */

import { Suspense } from "react";
import { findCategories } from "@/app/actions/action-categories";
import { PageTitleSection } from "@/components/common/page-title-section";
import { CategoryListClient } from "./category-list-client";
import { CategoryListHeaderClient } from "./category-list-header";

type ViewMode = "grid" | "list";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    view?: ViewMode;
  }>;
}

async function CategoryListContent({
  searchParams,
}: {
  searchParams: {
    search?: string;
    sort?: string;
    view?: ViewMode;
  };
}) {
  // Extrair parâmetros
  const search = searchParams.search || "";
  const sort = searchParams.sort || "2-2"; // Padrão: Mais Recente (column: 2, order: 2 - decrescente)
  const view = (searchParams.view || "list") as ViewMode;

  // Parse sort
  const [sortColumn, sortOrder] = sort.includes("-")
    ? sort.split("-").map(Number)
    : [2, 2]; // Fallback: coluna 2, ordem decrescente

  // Buscar categorias no servidor
  const result = await findCategories({
    searchTerm: search,
    searchType: "name",
    sortColumn,
    sortOrder,
    filterStatus: 0,
    page: 0,
    perPage: 20,
  });

  if (!result.success) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            Erro ao carregar categorias
          </p>
          <p className="text-sm text-muted-foreground">
            {result.error || "Tente novamente"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CategoryListClient
      initialCategories={result.data}
      totalCategories={result.total}
      currentSearch={search}
      currentSort={sort}
      currentView={view}
    />
  );
}

export default async function CategoryListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Criar key dinâmica para forçar re-render quando searchParams mudam
  const searchParamsKey = `${resolvedSearchParams.search || ""}-${resolvedSearchParams.sort || ""}-${resolvedSearchParams.view || ""}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header com Breadcrumb - Client Component com i18n */}
        <CategoryListHeaderClient />

        {/* Título da Página */}
        <PageTitleSection
          title="Categorias"
          subtitle="Gerencie categorias de produtos"
        />

        {/* Conteúdo Principal com Suspense */}
        <Suspense
          key={searchParamsKey}
          fallback={<CategoryListLoadingFallback />}
        >
          <CategoryListContent searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Fallback UI enquanto dados carregam
 */
function CategoryListLoadingFallback() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6 py-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-64 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
              <div className="hidden lg:block lg:flex-1" />
              <div className="flex items-end gap-2 lg:w-1/3">
                <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1" />
              <div className="flex items-center justify-end gap-3">
                <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Skeleton em modo lista para evitar flash visual */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_item, index) => (
              <div
                key={`skeleton-loading-${Date.now()}-${index}`}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
