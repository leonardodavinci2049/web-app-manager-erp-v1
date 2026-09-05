import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
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
  const list = await fetchAccumulatedPages(
    (page) =>
      getPtypesPage({
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
    (ptype) => ptype.id,
    (page, error) => {
      hasLoadError = page === searchState.page;
      logger.error(
        `Erro ao carregar tipos de produtos (pagina ${page})`,
        error,
      );
    },
  );

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
