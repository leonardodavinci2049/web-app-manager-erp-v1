/**
 * Página de Detalhes da Categoria - Server Component
 *
 * Renderiza a página de visualização e edição de detalhes de uma categoria
 * como Server Component, buscando dados no servidor.
 *
 * Rota: /dashboard/category/category-details?id=XXX
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  findCategoryById,
  getCategoryOptions,
  getCategoryParentName,
} from "@/app/actions/action-categories";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CategoryMediaCard,
  CategoryNameCard,
  CategoryNotesCard,
  CategoryOrderCard,
  CategorySeoCard,
  CategoryStatusCard,
  ParentCategoryCard,
} from "./_components/";
import { CategoryDetailsHeaderClient } from "./_components/category-details-header";

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

async function CategoryDetailsHeaderLoader({
  categoryId,
}: {
  categoryId: number;
}) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    return null;
  }

  return <CategoryDetailsHeaderClient categoryName={category.name} />;
}

async function CategoryDetailsContent({ categoryId }: { categoryId: number }) {
  // Buscar categoria no servidor
  const category = await findCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  // Buscar nome da categoria pai se houver
  const parentName = await getCategoryParentName(category.parentId);

  // Buscar lista de categorias para o seletor de categoria pai
  const categories = await getCategoryOptions();

  return (
    <div className="space-y-6 py-6">
      {/* Botão Voltar */}
      <Link href="/dashboard/category/category-list">
        <Button variant="outline" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista de categorias
        </Button>
      </Link>

      {/* Informações do Header */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {category.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Editar detalhes da categoria ID: {category.id}
          </p>
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Categoria Pai
            </p>
            <p className="text-sm font-semibold">{parentName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Nível
            </p>
            <p className="text-sm font-semibold">{category.level || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Ordem
            </p>
            <p className="text-sm font-semibold">{category.order}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              QT Produtos
            </p>
            <p className="text-sm font-semibold">
              {category.productCount || 0}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Cards de Edição Inline */}
      <div className="space-y-6">
        {/* Card 1: Nome da Categoria */}
        <CategoryNameCard
          categoryId={category.id}
          initialName={category.name}
        />

        {/* Card 2: Categoria Pai */}
        <ParentCategoryCard
          categoryId={category.id}
          currentParentId={category.parentId}
          currentParentName={parentName}
          categories={categories}
        />

        {/* Card 6: Anotações */}
        <CategoryNotesCard category={category} />

        {/* Card 5: SEO */}
        <CategorySeoCard category={category} />

        {/* Card 3: Ordem de Exibição */}
        <CategoryOrderCard
          categoryId={category.id}
          parentId={category.parentId}
          initialOrder={category.order}
        />

        {/* Card 4: Mídia */}
        <CategoryMediaCard category={category} />

        {/* Card 7: Status - Movido para o final */}
        <CategoryStatusCard
          categoryId={category.id}
          initialStatus={category.inactive ? 1 : 0}
        />
      </div>
    </div>
  );
}

/**
 * Fallback UI enquanto dados carregam
 */
function CategoryDetailsLoadingFallback() {
  const skeletonFields = ["header-1", "header-2", "header-3", "header-4"];
  const formFields = [
    "field-1",
    "field-2",
    "field-3",
    "field-4",
    "field-5",
    "field-6",
  ];

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-96 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {skeletonFields.map((field) => (
            <div key={field} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-6">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default async function CategoryDetailsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams.id;

  // Validar parâmetro obrigatório
  if (!categoryId) {
    redirect("/dashboard/category/category-list");
  }

  // Converter para número e validar
  const id = Number.parseInt(categoryId, 10);
  if (Number.isNaN(id) || id <= 0) {
    redirect("/dashboard/category/category-list");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Header com Breadcrumb - Será preenchido após buscar dados */}
        <Suspense fallback={null}>
          <CategoryDetailsHeaderLoader categoryId={id} />
        </Suspense>

        {/* Conteúdo Principal com Suspense */}
        <Suspense fallback={<CategoryDetailsLoadingFallback />}>
          <CategoryDetailsContent categoryId={id} />
        </Suspense>
      </div>
    </div>
  );
}
