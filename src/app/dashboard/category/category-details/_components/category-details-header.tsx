"use client";

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";

interface CategoryDetailsHeaderProps {
  categoryName: string;
}

export function CategoryDetailsHeaderClient({
  categoryName,
}: CategoryDetailsHeaderProps) {
  return (
    <SiteHeaderWithBreadcrumb
      title={categoryName}
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        {
          label: "Categorias",
          href: "/dashboard/category/category-list",
        },
        { label: categoryName, isActive: true },
      ]}
    />
  );
}
