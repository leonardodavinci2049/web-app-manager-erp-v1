import { PageTitleSection } from "@/components/common/page-title-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaxonomyServiceApi } from "@/services/api/taxonomy/taxonomy-service-api";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { CategoryTree } from "./CategoryTree";
import { CategoryOverviewsHeaderClient } from "./category-overviews-header";
import type { CategoryNode } from "./category-tree.types";
import {
  transformTaxonomyToHierarchy,
  validateTaxonomyData,
} from "./utils/taxonomy-transform";

/**
 * Página de visualização hierárquica de categorias
 * Server Component que renderiza a estrutura de categorias em árvore interativa
 */
export default async function CategoryOverviewsPage() {
  const { categories, error } = await fetchCategoryHierarchy();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header com Breadcrumb - Client Component com i18n */}
        <CategoryOverviewsHeaderClient />

        {/* Título da Página */}
        <PageTitleSection
          titleKey="dashboard.category.overviews.title"
          subtitleKey="dashboard.category.overviews.subtitle"
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
              {/* Árvore de categorias interativa */}
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
                    <p className="text-muted-foreground">
                      Nenhuma categoria encontrada
                    </p>
                  </div>
                )}
              </div>
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
  const response = await TaxonomyServiceApi.findTaxonomyMenu({
    pe_id_tipo: 1,
    // pe_parent_id is optional, defaults to 0 (root level)
  });

  if (!TaxonomyServiceApi.isValidTaxonomyMenuResponse(response)) {
    return [];
  }

  const taxonomyData = TaxonomyServiceApi.extractTaxonomyMenuList(response);
  if (!validateTaxonomyData(taxonomyData)) {
    return [];
  }

  return transformTaxonomyToHierarchy(taxonomyData);
}

async function tryBuildHierarchyFromList(): Promise<CategoryNode[]> {
  const perPage = 100;
  const collected: TaxonomyData[] = [];
  const maxPages = 5;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await TaxonomyServiceApi.findTaxonomies({
      pe_id_parent: -1,
      pe_flag_inativo: 0,
      pe_qt_registros: perPage,
      pe_pagina_id: page,
      pe_coluna_id: 2,
      pe_ordem_id: 1,
    });

    if (!TaxonomyServiceApi.isValidTaxonomyResponse(response)) {
      break;
    }

    const pageData = TaxonomyServiceApi.extractTaxonomyList(response);
    if (!validateTaxonomyData(pageData)) {
      break;
    }

    collected.push(...pageData);

    const total = response.quantity ?? collected.length;
    if (collected.length >= total) {
      break;
    }

    if (pageData.length < perPage) {
      break;
    }
  }

  if (collected.length === 0) {
    return [];
  }

  return transformTaxonomyToHierarchy(collected);
}
