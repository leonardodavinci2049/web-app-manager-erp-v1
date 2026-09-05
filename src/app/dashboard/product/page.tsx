import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { fetchAccumulatedPages } from "@/app/dashboard/_components/registry/fetch-accumulated-pages";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import {
  getTaxonomyMenu,
  getTaxonomyMenuManager,
} from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import {
  buildCatalogReturnTo,
  flattenCategories,
  mapSortToApiParams,
  ProductDashboard,
  parseCatalogPagingState,
  parseCatalogSearchParams,
} from "./_components";

const logger = createLogger("CatalogPage");
const CATALOG_PATHNAME = "/dashboard/product";
const CATEGORY_MENU_LIMIT = 10_000;

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage(props: CatalogPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const filters = parseCatalogSearchParams(searchParams);
  const paging = parseCatalogPagingState(searchParams);
  const sort = mapSortToApiParams(filters.sortBy);
  const catalogReturnTo = buildCatalogReturnTo(searchParams, CATALOG_PATHNAME);
  let hasProductsLoadError = false;

  const [productsResult, brands, categories, ptypes, newProductTaxonomy] =
    await Promise.all([
      fetchAccumulatedPages(
        (page) =>
          getProductsManager({
            search: filters.searchTerm,
            taxonomyId:
              filters.selectedCategory === "all"
                ? undefined
                : Number(filters.selectedCategory),
            brandId: filters.selectedBrand
              ? Number(filters.selectedBrand)
              : undefined,
            typeId: filters.selectedPtype
              ? Number(filters.selectedPtype)
              : undefined,
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
            recordsQuantity: filters.pageLimit,
            pageId: page,
            columnId: sort.columnId,
            orderId: sort.orderId,
            ...apiContext,
          }),
        paging.page,
        paging.accum,
        (result) => ({ items: result.products, total: result.total }),
        (product) => product.id,
        (page, error) => {
          hasProductsLoadError = page === paging.page;
          logger.error(`Erro ao buscar produtos (pagina ${page}):`, error);
        },
      ),
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
      getTaxonomyMenuManager({
        limit: CATEGORY_MENU_LIMIT,
        ...apiContext,
      })
        .then(({ items }) => ({
          available: true,
          options: items
            .filter(
              (item) => !item.inactive && item.level >= 1 && item.level <= 3,
            )
            .sort(
              (left, right) =>
                left.order - right.order || left.name.localeCompare(right.name),
            )
            .map((item) => ({
              id: item.id,
              parentId: item.parentId,
              name: item.name,
              level: item.level,
            })),
        }))
        .catch((error) => {
          logger.error("Erro ao buscar hierarquia para o novo produto:", error);
          return { available: false, options: [] };
        }),
    ]);

  const { items: products, total } = productsResult;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo de Produtos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Cadastro de Produtos", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Catálogo de produtos"
        description="Consulte, filtre e mantenha os produtos disponíveis no catálogo."
      >
        <ProductDashboard
          products={products}
          total={total}
          page={paging.page}
          pageSize={filters.pageLimit}
          brands={brands}
          categories={categories}
          ptypes={ptypes}
          newProductTaxonomy={newProductTaxonomy.options}
          isNewProductTaxonomyAvailable={newProductTaxonomy.available}
          catalogReturnTo={catalogReturnTo}
          hasProductsLoadError={hasProductsLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
