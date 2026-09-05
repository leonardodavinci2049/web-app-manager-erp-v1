import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
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
  const result = await fetchAccumulatedPages(
    (page) =>
      getSellersPage({
        search: searchState.search,
        page,
        pageSize: searchState.limit,
        ...apiFilters,
        ...apiContext,
      }),
    searchState.page,
    searchState.accum,
    (pageResult) => pageResult,
    (seller) => seller.id,
    (page, error) => {
      hasLoadError = page === searchState.page;
      logger.error(`Erro ao carregar vendedores (pagina ${page})`, error);
    },
  );

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
