/**
 * Página de criação de nova categoria - Modernizada
 *
 * Implementação otimizada seguindo Next.js 15 e diretrizes do projeto:
 * - Server Component por padrão
 * - Carregamento de dados no servidor
 * - Componentes Client isolados para interatividade
 */

import { Suspense } from "react";
import { connection } from "next/server";
import { getCategoryOptions } from "@/app/actions/action-categories";
import { PageTitleSection } from "@/components/common/page-title-section";
import { NewCategoryForm, NewCategoryHeader } from "./_components/";

/**
 * Componente Client para header com traduções - mantém padrão do projeto
 */
function NewCategoryHeaderClient() {
  return <NewCategoryHeader />;
}

/**
 * Skeleton para carregamento do formulário
 */
function CategoryFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="space-y-4">
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}

/**
 * Conteúdo do formulário com dados carregados no servidor
 */
async function CategoryFormContent() {
  await connection();
  // Carregar categorias no servidor
  const categories = await getCategoryOptions();

  return <NewCategoryForm categories={categories} />;
}

/**
 * Página principal de criação de categoria - Server Component
 */
export default function NewCategoryPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Cabeçalho da página - Client Component para traduções */}
        <NewCategoryHeaderClient />

        {/* Título da Página - Client Component para traduções */}
        <PageTitleSection
          title="Nova Categoria"
          subtitle="Criar uma nova categoria de produtos"
        />

        {/* Formulário de criação com dados carregados no servidor */}
        <Suspense fallback={<CategoryFormSkeleton />}>
          <CategoryFormContent />
        </Suspense>
      </div>
    </div>
  );
}
