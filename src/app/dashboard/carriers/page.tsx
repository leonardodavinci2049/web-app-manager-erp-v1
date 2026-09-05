import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCarriersPage } from "@/services/api-main/carrier";
import {
  CarrierDashboard,
  mapCarrierFiltersToApi,
  parseCarrierSearchParams,
} from "./_components";

const logger = createLogger("CarrierDashboardPage");

interface CarriersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CarriersPage({
  searchParams,
}: CarriersPageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const searchState = parseCarrierSearchParams(rawSearchParams);
  const apiFilters = mapCarrierFiltersToApi(searchState);
  const { apiContext } = await getAuthContext();

  let hasLoadError = false;
  const result = await fetchAccumulatedPages(
    (page) =>
      getCarriersPage({
        search: searchState.search,
        statusId: apiFilters.statusId,
        page,
        pageSize: searchState.limit,
        columnId: apiFilters.columnId,
        orderId: apiFilters.orderId,
        ...apiContext,
      }),
    searchState.page,
    searchState.accum,
    (pageResult) => pageResult,
    (carrier) => carrier.id,
    (page, error) => {
      hasLoadError = page === searchState.page;
      logger.error(`Erro ao carregar transportadoras (pagina ${page})`, error);
    },
  );

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Transportadoras"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transportadoras", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Transportadoras"
        description="Gerencie transportadoras, contatos e dados fiscais usados nas entregas."
      >
        <CarrierDashboard
          items={result.items}
          total={result.total}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
