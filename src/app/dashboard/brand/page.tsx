import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getBrandById,
  getBrandsPage,
} from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import {
  BRAND_PAGE_SIZE,
  BRAND_PRODUCT_PAGE_SIZE,
  BrandDashboard,
  type BrandDetailData,
  parseBrandSearchParams,
} from "./_components";

const logger = createLogger("BrandDashboardPage");

interface BrandPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrandPage(props: BrandPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const { apiContext } = await getAuthContext();

  const searchState = parseBrandSearchParams(searchParams);

  const brandsResultPromise = getBrandsPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: BRAND_PAGE_SIZE,
    ...apiContext,
  }).catch((error) => {
    logger.error("Erro ao buscar marcas:", error);
    return { brands: [], total: 0 };
  });

  let detailPromise: Promise<BrandDetailData | undefined> =
    Promise.resolve(undefined);

  if (searchState.brandId) {
    detailPromise = Promise.all([
      getBrandById(searchState.brandId, apiContext).catch((error) => {
        logger.warn("Erro ao buscar detalhe da marca", {
          brandId: searchState.brandId,
          error,
        });
        return undefined;
      }),
      getProductsManager({
        brandId: searchState.brandId,
        recordsQuantity: BRAND_PRODUCT_PAGE_SIZE,
        pageId: searchState.productPage,
        ...apiContext,
      }).catch((error) => {
        logger.warn("Erro ao buscar produtos da marca", {
          brandId: searchState.brandId,
          error,
        });
        return { products: [], total: 0 };
      }),
    ]).then(([brand, productsResult]) => {
      if (!brand) return undefined;
      return {
        brand,
        products: productsResult.products.map((product) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          ref: product.ref,
          model: product.model,
          imagePath: product.imagePath,
        })),
        productTotal: productsResult.total,
      } satisfies BrandDetailData;
    });
  }

  const [brandsResult, detail] = await Promise.all([
    brandsResultPromise,
    detailPromise,
  ]);

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Marcas"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marcas", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <BrandDashboard
                brands={brandsResult.brands}
                total={brandsResult.total}
                pageSize={BRAND_PAGE_SIZE}
                productPageSize={BRAND_PRODUCT_PAGE_SIZE}
                searchState={searchState}
                detail={detail}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
