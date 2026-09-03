import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { BrandNotFoundError } from "@/services/api-main/brand";
import { getBrandById } from "@/services/api-main/brand/brand-service-api";
import { getProductsManager } from "@/services/api-main/product-manager/product-manager-service-api";
import { BRAND_PRODUCT_PAGE_SIZE, getSafeBrandReturnTo } from "../_components";
import { BrandDetailLayout } from "./_components/brand-detail-layout";
import {
  BrandImageGalleryServer,
  BrandImageGallerySkeleton,
} from "./_components/image-gallery";
import { BrandImagesListServer } from "./_components/image-gallery/brand-images-list-server";

const logger = createLogger("BrandDetailsPage");

interface BrandDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parsePositiveInt(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? value : value?.[0];
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandDetailPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  const brandId = parsePositiveInt(id);
  if (!brandId) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeBrandReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const productPage = parsePositiveInt(rawSearchParams.productPage);
  const { apiContext } = await getAuthContext();

  const brandPromise = getBrandById(brandId, apiContext).catch((error) => {
    if (error instanceof BrandNotFoundError) notFound();
    logger.error("Erro ao carregar detalhe da marca", error);
    throw error;
  });

  let hasProductsError = false;
  const productsPromise = getProductsManager({
    brandId,
    recordsQuantity: BRAND_PRODUCT_PAGE_SIZE,
    pageId: productPage,
    ...apiContext,
  }).catch((error) => {
    hasProductsError = true;
    logger.error("Erro ao carregar produtos relacionados à marca", error);
    return { products: [], total: 0 };
  });

  const [brand, productsResult] = await Promise.all([
    brandPromise,
    productsPromise,
  ]);
  if (!brand) notFound();

  const detailParams = new URLSearchParams({ returnTo });
  if (productPage > 0) detailParams.set("productPage", String(productPage));
  const productReturnTo = `/dashboard/brand/${brandId}?${detailParams.toString()}`;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes da marca"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Marcas", href: returnTo },
          { label: brand.name, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <BrandDetailLayout
                brand={brand}
                products={productsResult.products.map((product) => ({
                  id: product.id,
                  sku: product.sku,
                  name: product.name,
                  ref: product.ref,
                  model: product.model,
                  imagePath: product.imagePath,
                }))}
                productTotal={productsResult.total}
                productPage={productPage}
                productPageSize={BRAND_PRODUCT_PAGE_SIZE}
                returnTo={returnTo}
                productReturnTo={productReturnTo}
                hasProductsError={hasProductsError}
                imageGallery={
                  <Suspense fallback={<BrandImageGallerySkeleton />}>
                    <BrandImageGalleryServer
                      brandId={brand.id}
                      brandName={brand.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<BrandImageGallerySkeleton />}>
                    <BrandImagesListServer
                      brandId={brand.id}
                      initialBrandImagePath={brand.imagePath ?? ""}
                    />
                  </Suspense>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
