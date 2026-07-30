import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/components/registry";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getBrandById,
  getBrandsPage,
} from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import {
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

  let hasLoadError = false;
  const brandsResultPromise = getBrandsPage({
    search: searchState.search,
    page: searchState.page,
    pageSize: searchState.limit,
    columnId: searchState.sort === "name" ? 1 : 2,
    orderId: searchState.order === "asc" ? 1 : 2,
    ...apiContext,
  }).catch((error) => {
    hasLoadError = true;
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
      <RegistryPageShell
        title="Marcas"
        description="Crie, edite e gerencie as marcas dos seus produtos."
      >
        <BrandDashboard
          brands={brandsResult.brands}
          total={brandsResult.total}
          pageSize={searchState.limit}
          productPageSize={BRAND_PRODUCT_PAGE_SIZE}
          searchState={searchState}
          detail={detail}
          hasLoadError={hasLoadError}
        />
      </RegistryPageShell>
    </>
  );
}
