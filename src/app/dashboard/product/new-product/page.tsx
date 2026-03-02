import { Suspense } from "react";
import { PageTitleSection } from "@/components/common/page-title-section";
import { NewProductForm } from ".//components/new-product-form";
import { NewProductHeader } from ".//components/new-product-header";

/**
 * Página de criação de novo produto
 */
const NewProductPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="container mx-auto max-w-4xl">
        {/* Cabeçalho da página */}
        <NewProductHeader />

        {/* Título da Página */}
        <PageTitleSection
          title="Adicionar Novo Produto"
          subtitle="Crie um novo produto para adicionar ao seu catálogo"
        />

        {/* Formulário de criação */}
        <Suspense fallback={<div>Carregando formulário...</div>}>
          <NewProductForm />
        </Suspense>
      </div>
    </div>
  );
};

export default NewProductPage;
