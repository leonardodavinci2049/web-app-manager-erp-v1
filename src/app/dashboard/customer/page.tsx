import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-3 lg:px-6">
              <CustomerDashboard
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
