import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { EntryNotFoundError, getEntryById } from "@/services/api-main/entry";
import { getSafeEntryReturnTo } from "../_components";
import { EntryDetailLayout } from "./_components/entry-detail-layout";
import {
  EntryImageGalleryServer,
  EntryImageGallerySkeleton,
} from "./_components/image-gallery";
import {
  EntryItemsTabServer,
  EntryItemsTabSkeleton,
} from "./_components/tabs/entry-items-tab-server";

const logger = createLogger("EntryDetailsPage");

interface EntryDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EntryDetailsPage({
  params,
  searchParams,
}: EntryDetailsPageProps) {
  await connection();
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();
  const entryId = Number(id);
  if (!Number.isSafeInteger(entryId) || entryId <= 0) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeEntryReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();

  const entry = await getEntryById(entryId, apiContext).catch((error) => {
    if (error instanceof EntryNotFoundError) notFound();
    logger.error("Erro ao carregar detalhe da entrada", error);
    throw error;
  });
  if (!entry) notFound();

  const breadcrumbLabel = entry.invoiceNumber?.trim()
    ? `Nota ${entry.invoiceNumber}`
    : `Entrada ${entry.id}`;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Detalhes da entrada"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Entradas", href: returnTo },
          { label: breadcrumbLabel, isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-6 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <EntryDetailLayout
                entry={entry}
                entryItemsTab={
                  <Suspense fallback={<EntryItemsTabSkeleton />}>
                    <EntryItemsTabServer
                      entryId={entry.id}
                      apiContext={apiContext}
                    />
                  </Suspense>
                }
                returnTo={returnTo}
                imageGallery={
                  <Suspense fallback={<EntryImageGallerySkeleton />}>
                    <EntryImageGalleryServer
                      supplierId={entry.supplierId}
                      supplierName={entry.supplier}
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
