/**
 * Componente de cabeçalho para a página de novo produto
 * Inclui breadcrumb de navegação
 */

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

export function NewProductHeader() {
  return (
    <SiteHeaderWithBreadcrumb
      title="Adicionar Novo Produto"
      breadcrumbItems={[
        { label: "Início", href: "/dashboard" },
        {
          label: "Produtos",
          href: "/dashboard/product/catalog",
        },
        { label: "Adicionar Novo Produto", isActive: true },
      ]}
    />
  );
}
