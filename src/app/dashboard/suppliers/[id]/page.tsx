import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getSupplierById,
  SupplierNotFoundError,
} from "@/services/api-main/supplier";
import { getSafeSupplierReturnTo, SupplierDetails } from "../_components";
import {
  SupplierImageGalleryServer,
  SupplierImageGallerySkeleton,
  SupplierImagesListServer,
} from "./_components/image-gallery";

const logger = createLogger("SupplierDetailsPage");

interface SupplierDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SupplierDetailsPage({
  params,
  searchParams,
}: SupplierDetailsPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const supplierId = Number(id);
  if (!Number.isSafeInteger(supplierId) || supplierId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeSupplierReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();

  const supplier = await getSupplierById(supplierId, apiContext).catch(
    (error) => {
      if (error instanceof SupplierNotFoundError) notFound();
      logger.error("Erro ao carregar detalhe do fornecedor", error);
      throw error;
    },
  );
  if (!supplier) notFound();

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes do fornecedor"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Fornecedores", href: returnTo },
          { label: supplier.name, isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-3 lg:px-6">
              <SupplierDetails
                supplier={supplier}
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<SupplierImageGallerySkeleton />}>
                    <SupplierImageGalleryServer
                      supplierId={supplier.id}
                      supplierName={supplier.name}
                    />
                  </Suspense>
                }
                imageContent={
                  <Suspense fallback={<SupplierImageGallerySkeleton />}>
                    <SupplierImagesListServer
                      supplierId={supplier.id}
                      initialSupplierImagePath={supplier.imagePath ?? ""}
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
