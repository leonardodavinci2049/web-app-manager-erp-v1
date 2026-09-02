import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCarriersPage } from "@/services/api-main/carrier/carrier-service-api";
import { getEntriesPage } from "@/services/api-main/entry";
import { getSuppliersPage } from "@/services/api-main/supplier/supplier-service-api";
import { getTaxonomies } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
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
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
    logger.error("Erro ao buscar entradas:", error);
    return { items: [], total: 0 };
  });

  const [entriesResult, suppliersResult, carriersResult, categoriesResult] =
    await Promise.all([
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
      getTaxonomies({ recordsQuantity: 100, ...apiContext }).catch((error) => {
        logger.error("Erro ao buscar categorias para o formulário:", error);
        return [];
      }),
    ]);

  const supplierOptions = suppliersResult.items.map((supplier) => ({
    id: supplier.id,
    label: supplier.name,
  }));
  const carrierOptions = carriersResult.items.map((carrier) => ({
    id: carrier.id,
    label: carrier.name,
  }));
  const categoryOptions = categoriesResult.map((category) => ({
    id: category.id,
    label: category.name,
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
          categoryOptions={categoryOptions}
        />
      </RegistryPageShell>
    </>
  );
}
