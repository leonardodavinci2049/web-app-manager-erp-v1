import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CustomerNotFoundError,
  getCustomerById,
} from "@/services/api-main/customer-general";
import { getSafeCustomerReturnTo } from "../_components";
import { CustomerDetailLayout } from "./_components/customer-detail-layout";
import {
  CustomerImageGalleryServer,
  CustomerImageGallerySkeleton,
  CustomerImagesListServer,
} from "./_components/image-gallery";

const logger = createLogger("CustomerDetailsPage");

interface CustomerDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CustomerDetailsPage({
  params,
  searchParams,
}: CustomerDetailsPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const customerId = Number(id);
  if (!Number.isSafeInteger(customerId) || customerId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeCustomerReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  const detailPromise = getCustomerById(customerId, apiContext).catch(
    (error) => {
      if (error instanceof CustomerNotFoundError) notFound();
      logger.error("Erro ao carregar detalhe do cliente", error);
      throw error;
    },
  );
  const bundle = await detailPromise;
  if (!bundle) notFound();

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do cliente"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", href: returnTo },
          { label: bundle.customer.name, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <CustomerDetailLayout
                customer={bundle.customer}
                seller={bundle.seller}
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<CustomerImageGallerySkeleton />}>
                    <CustomerImageGalleryServer
                      customerId={bundle.customer.id}
                      customerName={bundle.customer.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<CustomerImageGallerySkeleton />}>
                    <CustomerImagesListServer
                      customerId={bundle.customer.id}
                      initialCustomerImagePath={bundle.customer.imagePath ?? ""}
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
