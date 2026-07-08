import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getBrands } from "@/services/api-main/brand/brand-service-api";
import { getProductsPdv } from "@/services/api-main/product-pdv/product-pdv-service-api";
import { getPtypes } from "@/services/api-main/ptype/ptype-service-api";
import { getTaxonomyMenu } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import {
  buildCatalogReturnTo,
  CatalogShell,
  flattenCategories,
  mapSortToApiParams,
  parseViewMode,
} from "./_components/catalog";

const logger = createLogger("DashboardPage");
const CATALOG_PATHNAME = "/dashboard";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    type?: string;
    stock?: string;
    sort?: string;
    limit?: string;
    page?: string;
    view?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const sort = mapSortToApiParams(searchParams.sort);
  const limit = Number(searchParams.limit) || 20;
  const viewMode = parseViewMode(searchParams.view);
  const catalogReturnTo = buildCatalogReturnTo(searchParams, CATALOG_PATHNAME);

  const [products, brands, categories, ptypes] = await Promise.all([
    getProductsPdv({
      search: searchParams.search,
      taxonomyId: searchParams.category
        ? Number(searchParams.category)
        : undefined,
      brandId: searchParams.brand ? Number(searchParams.brand) : undefined,
      typeId: searchParams.type ? Number(searchParams.type) : undefined,
      flagStock: searchParams.stock === "1" ? 1 : undefined,
      recordsQuantity: limit,
      pageId: Number(searchParams.page) || 0,
      columnId: sort.columnId,
      orderId: sort.orderId,
      ...apiContext,
    }).catch((error) => {
      logger.error("Erro ao buscar produtos PDV:", error);
      return [] as Awaited<ReturnType<typeof getProductsPdv>>;
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

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Catálogo"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie e visualize todos os produtos do seu catálogo com
                    filtros avançados.
                  </p>
                </div>

                <CatalogShell
                  products={products}
                  brands={brands}
                  categories={categories}
                  ptypes={ptypes}
                  viewMode={viewMode}
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
