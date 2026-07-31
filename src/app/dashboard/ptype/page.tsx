import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getPtypesPage } from "@/services/api-main/ptype";
import {
  mapPtypeFiltersToApi,
  PtypeDashboard,
  parsePtypeSearchParams,
} from "./_components";

const logger = createLogger("PtypeDashboardPage");

interface PtypePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PtypePage({ searchParams }: PtypePageProps) {
  await connection();
  const rawSearchParams = await searchParams;
  const searchState = parsePtypeSearchParams(rawSearchParams);
  const apiFilters = mapPtypeFiltersToApi(searchState);
  const { apiContext } = await getAuthContext();

  let hasLoadError = false;
  const listPromise = getPtypesPage({
    search: searchState.search,
    statusId: apiFilters.statusId,
    page: searchState.page,
    pageSize: searchState.limit,
    columnId: apiFilters.columnId,
    orderId: apiFilters.orderId,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao carregar tipos de produtos", error);
    return { items: [], total: 0 };
  });

  const list = await listPromise;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Tipos de produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tipos de produtos", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Tipos de produtos"
        description="Organize os tipos usados para classificar os produtos do catálogo."
      >
        <PtypeDashboard
          items={list.items}
          total={list.total}
          searchState={searchState}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
