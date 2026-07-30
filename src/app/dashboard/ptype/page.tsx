import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getPtypeById,
  getPtypesPage,
  PtypeNotFoundError,
} from "@/services/api-main/ptype";
import {
  mapPtypeFiltersToApi,
  PtypeDashboard,
  type PtypeDetailData,
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

  let detailPromise: Promise<PtypeDetailData | undefined> =
    Promise.resolve(undefined);

  if (searchState.ptypeId) {
    const ptypeId = searchState.ptypeId;
    detailPromise = getPtypeById(ptypeId, apiContext)
      .then(
        (item) =>
          ({
            state: item ? "ready" : "not-found",
            item,
          }) satisfies PtypeDetailData,
      )
      .catch((error) => {
        if (error instanceof PtypeNotFoundError) {
          return { state: "not-found" } satisfies PtypeDetailData;
        }
        logger.warn("Erro ao carregar detalhe do tipo de produto", {
          ptypeId,
          error,
        });
        return { state: "error" } satisfies PtypeDetailData;
      });
  }

  const [list, detail] = await Promise.all([listPromise, detailPromise]);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Tipos de produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tipos de produtos", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-3 lg:px-6">
              <PtypeDashboard
                items={list.items}
                total={list.total}
                searchState={searchState}
                detail={detail}
                hasLoadError={hasLoadError}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
