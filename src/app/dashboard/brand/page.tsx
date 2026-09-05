import { connection } from "next/server";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrandsPage } from "@/services/api-main/brand/brand-service-api";
import { BrandDashboard, parseBrandSearchParams } from "./_components";

const logger = createLogger("BrandDashboardPage");

interface BrandPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrandPage(props: BrandPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const searchState = parseBrandSearchParams(searchParams);

  let hasLoadError = false;
  const brandsResultPromise = getBrandsPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: searchState.limit,
    columnId: searchState.sort === "name" ? 1 : 2,
    orderId: searchState.order === "asc" ? 1 : 2,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao buscar marcas:", error);
    return { brands: [], total: 0 };
  });

  const brandsResult = await brandsResultPromise;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Marcas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marcas", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Marcas"
        description="Crie, edite e gerencie as marcas dos seus produtos."
      >
        <BrandDashboard
          brands={brandsResult.brands}
          total={brandsResult.total}
          pageSize={searchState.limit}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
