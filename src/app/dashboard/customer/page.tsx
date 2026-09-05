import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCustomersPage } from "@/services/api-main/customer-general";
import {
  CustomerDashboard,
  mapCustomerFiltersToApi,
  parseCustomerSearchParams,
} from "./_components";

const logger = createLogger("CustomerDashboardPage");

interface CustomerPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CustomerPage({
  searchParams,
}: CustomerPageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const searchState = parseCustomerSearchParams(rawSearchParams);
  const apiFilters = mapCustomerFiltersToApi(searchState);
  const { apiContext } = await getAuthContext();

  let hasLoadError = false;
  const result = await fetchAccumulatedPages(
    (page) =>
      getCustomersPage({
        search: searchState.search,
        page,
        pageSize: searchState.limit,
        ...apiFilters,
        ...apiContext,
      }),
    searchState.page,
    searchState.accum,
    (pageResult) => pageResult,
    (customer) => customer.customerId,
    (page, error) => {
      hasLoadError = page === searchState.page;
      logger.error(`Erro ao carregar clientes (pagina ${page})`, error);
    },
  );

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Clientes"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Clientes"
        description="Gerencie cadastros, contatos, endereços e relacionamento comercial."
      >
        <CustomerDashboard
          items={result.items}
          total={result.total}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
