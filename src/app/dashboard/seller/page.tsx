import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getSellersPage } from "@/services/api-main/seller";
import {
  mapSellerFiltersToApi,
  parseSellerSearchParams,
  SellerDashboard,
} from "./_components";

const logger = createLogger("SellerDashboardPage");

interface SellerPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SellerPage({ searchParams }: SellerPageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const searchState = parseSellerSearchParams(rawSearchParams);
  const apiFilters = mapSellerFiltersToApi(searchState);
  const { apiContext } = await getAuthContext();

  let hasLoadError = false;
  const result = await getSellersPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: searchState.limit,
    ...apiFilters,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao carregar vendedores", error);
    return { items: [], total: 0 };
  });

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Vendedores"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vendedores", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Vendedores"
        description="Consulte vendedores, contatos, documentos e informações da conta."
      >
        <SellerDashboard
          items={result.items}
          total={result.total}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
