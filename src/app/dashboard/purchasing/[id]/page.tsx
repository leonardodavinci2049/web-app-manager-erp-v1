import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { z } from "zod";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { getSafePurchasingReturnTo } from "@/app/dashboard/purchasing/_components";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getPurchasingProductById } from "@/services/api-main/purchasing/purchasing-service-api";
import { PurchasingNotFoundError } from "@/services/api-main/purchasing/types/purchasing-types";
import { PurchasingDetailLayout } from "./_components/purchasing-detail-layout";
import { PurchasingDetailSkeleton } from "./_components/purchasing-detail-skeleton";

const logger = createLogger("PurchasingDetailsPage");
const PurchasingPageParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive()),
});

interface PurchasingDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function PurchasingDetailsContent({
  productId,
  returnTo,
}: {
  productId: number;
  returnTo: string;
}) {
  const { apiContext } = await getAuthContext();
  let result: Awaited<ReturnType<typeof getPurchasingProductById>>;

  try {
    result = await getPurchasingProductById(productId, {
      ...apiContext,
      pe_type_business: 1,
    });
  } catch (error) {
    if (error instanceof PurchasingNotFoundError) {
      logger.warn("Purchasing product was not found", { productId });
      notFound();
    }
    logger.error("Failed to load purchasing product detail", {
      productId,
      error,
    });
    throw error;
  }

  if (!result) {
    logger.warn("Purchasing product is unavailable", { productId });
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
          <div className="px-3 sm:px-4 lg:px-6">
            <PurchasingDetailLayout
              product={result.product}
              relatedCategories={result.relatedCategories}
              relatedSuppliers={result.relatedSuppliers}
              returnTo={returnTo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function PurchasingDetailsPage({
  params,
  searchParams,
}: PurchasingDetailsPageProps) {
  await connection();
  const [routeParams, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const parsedParams = PurchasingPageParamsSchema.safeParse(routeParams);

  if (!parsedParams.success) {
    logger.warn("Invalid purchasing product ID", { id: routeParams.id });
    notFound();
  }

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafePurchasingReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes da necessidade de compra"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Necessidade de compra", href: returnTo },
          { label: "Detalhes", isActive: true },
        ]}
      />
      <main className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <Suspense fallback={<PurchasingDetailSkeleton />}>
          <PurchasingDetailsContent
            productId={parsedParams.data.id}
            returnTo={returnTo}
          />
        </Suspense>
      </main>
    </>
  );
}
