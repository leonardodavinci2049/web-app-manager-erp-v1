import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
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
  const result = await getCustomersPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: searchState.limit,
    ...apiFilters,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao carregar clientes", error);
    return { items: [], total: 0 };
  });

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
