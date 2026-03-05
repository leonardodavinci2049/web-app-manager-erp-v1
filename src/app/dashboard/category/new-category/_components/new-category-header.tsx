"use client";

/**
 * Header para nova categoria - mantém padrão do projeto como Client Component
 */

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

/**
 * Header de nova categoria seguindo padrão do projeto
 */
export function NewCategoryHeader() {
  return (
    <SiteHeaderWithBreadcrumb
      title="Nova Categoria"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: "Categorias",
          href: "/dashboard/category/category-list",
        },
        { label: "Nova Categoria", isActive: true },
      ]}
    />
  );
}
