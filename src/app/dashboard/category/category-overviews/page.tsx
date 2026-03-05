import { connection } from "next/server";
import { Suspense } from "react";
import { PageTitleSection } from "@/components/common/page-title-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import {
  getTaxonomies,
  getTaxonomyMenu,
} from "@/services/api-main/taxonomy-base/taxonomy-base-cached-service";
import { CategoryTree } from "./_components/CategoryTree";
import { CategoryOverviewsHeaderClient } from "./_components/category-overviews-header";
import type { CategoryNode } from "./_components/category-tree.types";
import {
  transformTaxonomyToHierarchy,
  validateTaxonomyData,
} from "./utils/taxonomy-transform";

/**
 * Página de visualização hierárquica de categorias
 * Server Component que renderiza a estrutura de categorias em árvore interativa
 */
export default async function CategoryOverviewsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header com Breadcrumb - Client Component com i18n */}
        <CategoryOverviewsHeaderClient />

        {/* Título da Página */}
        <PageTitleSection
          title="Visão Geral das Categorias"
          subtitle="Visualize a estrutura hierárquica de categorias de produtos"
        />

        <div className="space-y-6">
          {/* Card com árvore de categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Hierarquia de Categorias</CardTitle>
              <CardDescription>
                Família → Grupo → Subgrupo (3 níveis de profundidade)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<CategoryTreeSkeleton />}>
                <CategoryTreeContent />
              </Suspense>
            </CardContent>
          </Card>

          {/* Card com instruções de uso */}
          <Card>
            <CardHeader>
              <CardTitle>Como usar</CardTitle>
              <CardDescription>
                Instruções para navegação e interação com a árvore de categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Expandir/Colapsar:</strong> Clique no ícone de seta
                    para expandir ou colapsar categorias
                  </li>
                  <li>
                    <strong>Selecionar:</strong> Clique uma vez no nome da
                    categoria para selecioná-la
                  </li>
                  <li>
                    <strong>Detalhes:</strong> Clique duas vezes no nome da
                    categoria para visualizar detalhes completos
                  </li>
                  <li>
                    <strong>Teclado:</strong> Use as setas (← →) para
                    expandir/colapsar e Enter para selecionar
                  </li>
                  <li>
                    <strong>Quantidade:</strong> O número entre parênteses
                    indica a quantidade de produtos relacionados
                  </li>
                </ul>

                <div className="mt-4 pt-3 border-t border-muted">
                  <h4 className="font-semibold text-sm mb-2">
                    Ícones dos Níveis:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">
                        📁
                      </span>
                      <strong>Nível 1 (Família):</strong> Categorias principais
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">
                        📦
                      </span>
                      <strong>Nível 2 (Grupo):</strong> Subcategorias
                      intermediárias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-600 dark:text-orange-400">
                        🏷️
                      </span>
                      <strong>Nível 3 (Subgrupo):</strong> Especializações
                      finais
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estrutura de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground">Níveis:</p>
                  <ul className="mt-2 space-y-1 ml-4 text-muted-foreground">
                    <li>
                      • <strong>Nível 1 (Família):</strong> Categorias
                      principais (Eletrônicos, Informática, Perfumes)
                    </li>
                    <li>
                      • <strong>Nível 2 (Grupo):</strong> Subcategorias
                      intermediárias (Computadores, Periféricos, etc)
                    </li>
                    <li>
                      • <strong>Nível 3 (Subgrupo):</strong> Especializações
                      finais (Notebooks, Mouses, etc)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function fetchCategoryHierarchy(): Promise<{
  categories: CategoryNode[];
  error: string | null;
}> {
  try {
    const menuHierarchy = await tryBuildHierarchyFromMenu();
    if (menuHierarchy.length > 0) {
      return { categories: menuHierarchy, error: null };
    }
  } catch (error) {
    console.error("Erro ao carregar categorias via menu:", error);
  }

  try {
    const fallbackHierarchy = await tryBuildHierarchyFromList();
    if (fallbackHierarchy.length > 0) {
      return { categories: fallbackHierarchy, error: null };
    }
    return {
      categories: [],
      error: null,
    };
  } catch (error) {
    console.error("Erro ao carregar categorias via fallback:", error);
    return {
      categories: [],
      error: "Falha na conexão com a API. Tente novamente mais tarde.",
    };
  }
}

async function tryBuildHierarchyFromMenu(): Promise<CategoryNode[]> {
  const { apiContext } = await getAuthContext();
  const menuItems = await getTaxonomyMenu(1, 0, apiContext);

  if (menuItems.length === 0) {
    return [];
  }

  if (!validateTaxonomyData(menuItems)) {
    return [];
  }

  return transformTaxonomyToHierarchy(menuItems);
}

async function tryBuildHierarchyFromList(): Promise<CategoryNode[]> {
  const { apiContext } = await getAuthContext();
  const taxonomies = await getTaxonomies({
    parentId: -1,
    inactive: 0,
    recordsQuantity: 500,
    pageId: 0,
    columnId: 2,
    orderId: 1,
    ...apiContext,
  });

  if (taxonomies.length === 0) {
    return [];
  }

  if (!validateTaxonomyData(taxonomies)) {
    return [];
  }

  return transformTaxonomyToHierarchy(taxonomies);
}

/** Componente async que busca e renderiza a árvore de categorias (dinâmico, dentro do Suspense) */
async function CategoryTreeContent() {
  await connection();
  const { categories, error } = await fetchCategoryHierarchy();

  return (
    <div className="rounded-lg border border-muted bg-card p-4">
      {error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">
            ⚠️ Erro ao carregar categorias
          </p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : categories.length > 0 ? (
        <CategoryTree categories={categories} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
        </div>
      )}
    </div>
  );
}

function CategoryTreeSkeleton() {
  return (
    <div className="rounded-lg border border-muted bg-card p-4 animate-pulse">
      <div className="space-y-3">
        {[100, 80, 60, 40, 20].map((width) => (
          <div key={`sk-${width}`} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div
              className="h-4 rounded bg-muted"
              style={{ width: `${width}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
