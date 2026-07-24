import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import { getTaxonomyMenu } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import {
  buildCatalogReturnTo,
  CatalogShell,
  flattenCategories,
  mapSortToApiParams,
  parseCatalogSearchParams,
} from "./_components";

const logger = createLogger("CatalogPage");
const CATALOG_PATHNAME = "/dashboard/catalog";

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage(props: CatalogPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const filters = parseCatalogSearchParams(searchParams);
  const sort = mapSortToApiParams(filters.sortBy);
  const rawLimit = Number(searchParams.limit);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 50;
  const rawPage = Number(searchParams.page);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const catalogReturnTo = buildCatalogReturnTo(searchParams, CATALOG_PATHNAME);

  const [productsResult, brands, categories, ptypes] = await Promise.all([
    getProductsManager({
      search: filters.searchTerm,
      taxonomyId:
        filters.selectedCategory === "all"
          ? undefined
          : Number(filters.selectedCategory),
      brandId: filters.selectedBrand
        ? Number(filters.selectedBrand)
        : undefined,
      typeId: filters.selectedPtype ? Number(filters.selectedPtype) : undefined,
      supplierId: filters.supplierId,
      physicalId: filters.physicalId,
      ean: filters.ean,
      flagSalesList: filters.salesList,
      flagStockList: filters.stockList,
      flagAdvanced: filters.advancedFilter,
      flagVariousLists: filters.variousList,
      flagOperationList: filters.operationList,
      startDate: filters.startDate,
      endDate: filters.endDate,
      flagNoImage: filters.hasNoImage ? 1 : undefined,
      flagNoDescription: filters.hasNoDescription ? 1 : undefined,
      flagNoSalesCopy: filters.hasNoSalesCopy ? 1 : undefined,
      flagImported: filters.importedStatus,
      flagInactive: filters.inactiveStatus,
      flagPremium: filters.isPremium ? 1 : undefined,
      recordsQuantity: limit,
      pageId: page,
      columnId: sort.columnId,
      orderId: sort.orderId,
      ...apiContext,
    }).catch((error) => {
      logger.error("Erro ao buscar produtos do Manager:", error);
      return {
        products: [],
        total: 0,
      } as Awaited<ReturnType<typeof getProductsManager>>;
    }),
    getBrands({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar marcas:", error);
      return [] as Awaited<ReturnType<typeof getBrands>>;
    }),
    getTaxonomyMenu(2, 0, apiContext)
      .then((menuItems) => flattenCategories(menuItems))
      .catch((error) => {
        logger.error("Erro ao buscar categorias:", error);
        return [];
      }),
    getPtypes({ limit: 100, ...apiContext }).catch((error) => {
      logger.error("Erro ao buscar tipos:", error);
      return [] as Awaited<ReturnType<typeof getPtypes>>;
    }),
  ]);

  const { products, total } = productsResult;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-4 py-3">
            <div className="px-3 lg:px-6">
              <div className="space-y-4">
                <CatalogShell
                  products={products}
                  total={total}
                  brands={brands}
                  categories={categories}
                  ptypes={ptypes}
                  catalogReturnTo={catalogReturnTo}
                  limit={limit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
