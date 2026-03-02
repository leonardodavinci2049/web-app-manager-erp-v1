"use client";

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

export function CategoryListHeaderClient() {
  return (
    <SiteHeaderWithBreadcrumb
      title="Categorias"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Categorias", isActive: true },
      ]}
    />
  );
}
