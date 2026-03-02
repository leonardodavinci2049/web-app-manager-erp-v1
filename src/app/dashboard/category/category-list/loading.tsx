/**
 * Loading skeleton para a página de listagem de categorias
 *
 * Exibido enquanto o Server Component carrega os dados iniciais
 * Localização: /dashboard/category/category-list
 */

import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_KEYS = [
  "sk-cat-a",
  "sk-cat-b",
  "sk-cat-c",
  "sk-cat-d",
  "sk-cat-e",
  "sk-cat-f",
  "sk-cat-g",
  "sk-cat-h",
] as const;

export default function CategoryListLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="px-4 lg:px-6">
            <div className="space-y-6">
              {/* Cabeçalho */}
              <div>
                <Skeleton className="h-9 w-48 rounded-md" />
                <Skeleton className="mt-2 h-5 w-64 rounded-md" />
              </div>

              {/* Filtros */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                  <div className="hidden lg:block lg:flex-1" />
                  <div className="flex items-end gap-2 lg:w-1/3">
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1" />
                  <div className="flex items-center justify-end gap-3">
                    <Skeleton className="h-10 w-40 rounded-md" />
                    <Skeleton className="h-10 w-20 rounded-md" />
                  </div>
                </div>

                <Skeleton className="h-4 w-64 rounded-md" />
              </div>

              {/* Grid de Categorias */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {SKELETON_KEYS.map((key) => (
                  <div key={key} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
