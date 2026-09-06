import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import { getPurchasingProducts } from "@/services/api-main/purchasing/purchasing-service-api";
import { getTaxonomyMenu } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import {
  buildPurchasingReturnTo,
  flattenPurchasingCategories,
  mapPurchasingSort,
  PurchasingDashboard,
  parsePurchasingFilters,
  parsePurchasingPaging,
} from "./_components";

const logger = createLogger("PurchasingPage");

interface PurchasingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PurchasingPage({
  searchParams: searchParamsPromise,
}: PurchasingPageProps) {
  await connection();
  const searchParams = await searchParamsPromise;
  const { apiContext } = await getAuthContext();
  const filters = parsePurchasingFilters(searchParams);
  const paging = parsePurchasingPaging(searchParams);
  const sort = mapPurchasingSort(filters.sort);
  const returnTo = buildPurchasingReturnTo(searchParams);
  const hasActiveQuery = Boolean(
    filters.searchTerm ||
      filters.categoryId ||
      filters.brandId ||
      filters.typeId ||
      filters.supplierId ||
      filters.salesList ||
      filters.stockList ||
      filters.advancedFilter ||
      filters.origin ||
      filters.premium ||
      filters.criticality ||
      filters.sort !== "name-desc",
  );

  const [productsResult, brands, categories, ptypes] = await Promise.all([
    fetchAccumulatedPages(
      (page) =>
        getPurchasingProducts({
          search: filters.searchTerm,
          taxonomyId: filters.categoryId,
          brandId: filters.brandId,
          typeId: filters.typeId,
          supplierId: filters.supplierId,
          flagSalesList: filters.salesList,
          flagStockList: filters.stockList,
          flagAdvanced: filters.advancedFilter,
          flagImported: filters.origin,
          flagPremium: filters.premium ? 1 : 0,
          criticalityLevel: filters.criticality,
          flagVariousLists: 0,
          qtRecords: filters.pageLimit,
          pageId: page,
          columnId: sort.columnId,
          orderId: sort.orderId,
          ...apiContext,
        }),
      paging.page,
      paging.accum,
      (result) => ({ items: result.products, total: result.total }),
      (product) => product.id,
      (page, error) =>
        logger.error(
          `Erro ao buscar necessidade de compra (pagina ${page}):`,
          error,
        ),
    ),
    getBrands({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar marcas para os filtros de compras:", error);
      return [] as Awaited<ReturnType<typeof getBrands>>;
    }),
    getTaxonomyMenu(2, 0, apiContext)
      .then(flattenPurchasingCategories)
      .catch((error) => {
        logger.error(
          "Erro ao buscar categorias para os filtros de compras:",
          error,
        );
        return [];
      }),
    getPtypes({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar tipos para os filtros de compras:", error);
      return [] as Awaited<ReturnType<typeof getPtypes>>;
    }),
  ]);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Necessidade de compra"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Necessidade de compra", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Produtos com necessidade de compra"
        description="Consulte os produtos que precisam de reposição, avalie a criticidade e identifique o fornecedor principal."
      >
        <PurchasingDashboard
          products={productsResult.items}
          total={productsResult.total}
          page={paging.page}
          pageSize={filters.pageLimit}
          returnTo={returnTo}
          hasLoadError={productsResult.hasBaseFailure}
          hasActiveQuery={hasActiveQuery}
          brands={brands}
          categories={categories}
          ptypes={ptypes}
        />
      </RegistryPageShell>
    </>
  );
}
