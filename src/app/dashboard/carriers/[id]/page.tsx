import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CarrierNotFoundError,
  getCarrierById,
} from "@/services/api-main/carrier";
import { getSafeCarrierReturnTo } from "../_components";
import { CarrierDetailLayout } from "./_components/carrier-detail-layout";
import {
  CarrierImageGalleryServer,
  CarrierImageGallerySkeleton,
  CarrierImagesListServer,
} from "./_components/image-gallery";

const logger = createLogger("CarrierDetailsPage");

interface CarrierDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CarrierDetailsPage({
  params,
  searchParams,
}: CarrierDetailsPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const carrierId = Number(id);
  if (!Number.isSafeInteger(carrierId) || carrierId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeCarrierReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  const carrier = await getCarrierById(carrierId, apiContext).catch((error) => {
    if (error instanceof CarrierNotFoundError) notFound();
    logger.error("Erro ao carregar detalhe da transportadora", error);
    throw error;
  });
  if (!carrier) notFound();

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes da transportadora"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transportadoras", href: returnTo },
          { label: carrier.name, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <CarrierDetailLayout
                carrier={carrier}
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<CarrierImageGallerySkeleton />}>
                    <CarrierImageGalleryServer
                      carrierId={carrier.id}
                      carrierName={carrier.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<CarrierImageGallerySkeleton />}>
                    <CarrierImagesListServer
                      carrierId={carrier.id}
                      initialCarrierImagePath={carrier.imagePath ?? ""}
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
