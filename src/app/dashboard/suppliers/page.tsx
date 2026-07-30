import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-3 lg:px-6">
              <SupplierDashboard
                items={result.items}
                total={result.total}
                searchState={searchState}
                hasLoadError={hasLoadError}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
