import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getSellerById, SellerNotFoundError } from "@/services/api-main/seller";
import { getSafeSellerReturnTo } from "../_components";
import {
  SellerImageGalleryServer,
  SellerImageGallerySkeleton,
  SellerImagesListServer,
} from "./_components/image-gallery";
import { SellerDetailLayout } from "./_components/seller-detail-layout";

const logger = createLogger("SellerDetailsPage");

interface SellerDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SellerDetailsPage({
  params,
  searchParams,
}: SellerDetailsPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const sellerId = Number(id);
  if (!Number.isSafeInteger(sellerId) || sellerId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeSellerReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  const seller = await getSellerById(sellerId, apiContext).catch((error) => {
    if (error instanceof SellerNotFoundError) notFound();
    logger.error("Erro ao carregar detalhe do vendedor", error);
    throw error;
  });
  if (!seller) notFound();

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do vendedor"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vendedores", href: returnTo },
          { label: seller.name, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <SellerDetailLayout
                seller={seller}
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<SellerImageGallerySkeleton />}>
                    <SellerImageGalleryServer
                      sellerId={seller.id}
                      sellerName={seller.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<SellerImageGallerySkeleton />}>
                    <SellerImagesListServer
                      sellerId={seller.id}
                      initialSellerImagePath={seller.imagePath ?? ""}
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
