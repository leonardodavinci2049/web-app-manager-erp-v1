import { connection } from "next/server";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCarriersPage } from "@/services/api-main/carrier/carrier-service-api";
import { getEntriesPage } from "@/services/api-main/entry";
import { getSuppliersPage } from "@/services/api-main/supplier/supplier-service-api";
import { EntryDashboard, parseEntrySearchParams } from "./_components";

const logger = createLogger("EntryDashboardPage");

interface EntryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EntryPage(props: EntryPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const searchState = parseEntrySearchParams(searchParams);

  let hasLoadError = false;
  const entriesResultPromise = getEntriesPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: searchState.limit,
    columnId:
      searchState.sort === "id" ? 2 : searchState.sort === "created-at" ? 3 : 1,
    orderId: searchState.order === "asc" ? 1 : 2,
    supplierId: searchState.supplierId,
    carrierId: searchState.carrierId,
    modelId: searchState.modelId,
    categoryId: searchState.categoryId,
    operationList: searchState.operationList,
    startDate: searchState.startDate || undefined,
    endDate: searchState.endDate || undefined,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao buscar entradas:", error);
    return { items: [], total: 0 };
  });

  const [entriesResult, suppliersResult, carriersResult] = await Promise.all([
    entriesResultPromise,
    getSuppliersPage({ page: 0, pageSize: 100, ...apiContext }).catch(
      (error) => {
        logger.error("Erro ao buscar fornecedores para o formulário:", error);
        return { items: [], total: 0 };
      },
    ),
    getCarriersPage({ page: 0, pageSize: 100, ...apiContext }).catch(
      (error) => {
        logger.error(
          "Erro ao buscar transportadoras para o formulário:",
          error,
        );
        return { items: [], total: 0 };
      },
    ),
  ]);

  const supplierOptions = suppliersResult.items.map((supplier) => ({
    id: supplier.id,
    label: supplier.name,
  }));
  const carrierOptions = carriersResult.items.map((carrier) => ({
    id: carrier.id,
    label: carrier.name,
  }));

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Entradas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Entradas", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Entradas"
        description="Consulte as entradas de mercadoria e registre novas notas de entrada."
      >
        <EntryDashboard
          entries={entriesResult.items}
          total={entriesResult.total}
          pageSize={searchState.limit}
          searchState={searchState}
          hasLoadError={hasLoadError}
          supplierOptions={supplierOptions}
          carrierOptions={carrierOptions}
        />
      </RegistryPageShell>
    </>
  );
}
