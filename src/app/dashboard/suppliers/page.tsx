import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getSuppliersPage } from "@/services/api-main/supplier";
import {
  mapSupplierFiltersToApi,
  parseSupplierSearchParams,
  SupplierDashboard,
} from "./_components";

const logger = createLogger("SupplierDashboardPage");

interface SupplierPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SupplierPage({
  searchParams,
}: SupplierPageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const searchState = parseSupplierSearchParams(rawSearchParams);
  const apiFilters = mapSupplierFiltersToApi(searchState);
  const { apiContext } = await getAuthContext();

  let hasLoadError = false;
  const result = await getSuppliersPage({
    search: searchState.search,
    statusId: apiFilters.statusId,
    page: searchState.page,
    pageSize: searchState.limit,
    columnId: apiFilters.columnId,
    orderId: apiFilters.orderId,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao carregar fornecedores", error);
    return { items: [], total: 0 };
  });

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Fornecedores"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Fornecedores", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Fornecedores"
        description="Consulte e mantenha os fornecedores utilizados nas operações de compra."
      >
        <SupplierDashboard
          items={result.items}
          total={result.total}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
