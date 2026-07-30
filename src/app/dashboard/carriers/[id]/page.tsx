import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CarrierNotFoundError,
  getCarrierById,
} from "@/services/api-main/carrier";
import { CarrierDetails, getSafeCarrierReturnTo } from "../_components";

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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-3 lg:px-6">
              <CarrierDetails carrier={carrier} returnTo={returnTo} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
