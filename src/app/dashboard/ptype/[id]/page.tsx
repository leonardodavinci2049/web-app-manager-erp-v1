import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getPtypeById, PtypeNotFoundError } from "@/services/api-main/ptype";
import { getSafePtypeReturnTo } from "../_components";
import {
  PtypeImageGalleryServer,
  PtypeImageGallerySkeleton,
  PtypeImagesListServer,
} from "./_components/image-gallery";
import { PtypeDetailLayout } from "./_components/ptype-detail-layout";

const logger = createLogger("PtypeDetailsPage");

interface PtypeDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PtypeDetailPage({
  params,
  searchParams,
}: PtypeDetailPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const ptypeId = Number(id);
  if (!Number.isSafeInteger(ptypeId) || ptypeId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafePtypeReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  const item = await getPtypeById(ptypeId, apiContext).catch((error) => {
    if (error instanceof PtypeNotFoundError) notFound();
    logger.error("Erro ao carregar detalhe do tipo de produto", error);
    throw error;
  });
  if (!item) notFound();

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do tipo de produto"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tipos de produtos", href: returnTo },
          { label: item.name, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <PtypeDetailLayout
                item={item}
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<PtypeImageGallerySkeleton />}>
                    <PtypeImageGalleryServer
                      ptypeId={item.id}
                      ptypeName={item.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<PtypeImageGallerySkeleton />}>
                    <PtypeImagesListServer
                      ptypeId={item.id}
                      initialPtypeImagePath={item.imagePath ?? ""}
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
