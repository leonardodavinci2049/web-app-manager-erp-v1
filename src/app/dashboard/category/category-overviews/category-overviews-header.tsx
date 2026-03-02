"use client";

import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { useTranslation } from "@/hooks/use-translation";

export function CategoryOverviewsHeaderClient() {
  const { t } = useTranslation();

  return (
    <SiteHeaderWithBreadcrumb
      title={t("dashboard.category.overviews.title")}
      breadcrumbItems={[
        { label: t("dashboard.breadcrumb.dashboard"), href: "/dashboard" },
        {
          label: t("dashboard.category.list.title"),
          href: "/dashboard/category/category-list",
        },
        { label: t("dashboard.category.overviews.title"), isActive: true },
      ]}
    />
  );
}
