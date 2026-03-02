"use client";

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

export function CategoryOverviewsHeaderClient() {
  return (
    <SiteHeaderWithBreadcrumb
      title="Visão Geral das Categorias"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: "Categorias",
          href: "/dashboard/category/category-list",
        },
        { label: "Visão Geral das Categorias", isActive: true },
      ]}
    />
  );
}
