import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailBackLink } from "@/app/dashboard/_components/detail-page";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { AppConfigNotFoundError } from "@/services/api-main/app-config";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { getSafeSettingsReturnTo } from "../_components/settings-list-params";
import {
  getSettingsConfig,
  hasValidSystemClientId,
  mapSettingsCards,
} from "../_utils/settings-data";
import {
  SettingsImageGalleryServer,
  SettingsImageGallerySkeleton,
} from "./_components/image-gallery";
import { SettingsDetailLayout } from "./_components/settings-detail-layout";
import type { SettingsDetailData } from "./_components/settings-detail-types";

const logger = createLogger("SettingsPage");

interface SettingsDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parsePositiveInt(value: string): number {
  if (!/^\d+$/.test(value)) return 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

async function SettingsPageContent({
  params,
  searchParams,
}: SettingsDetailPageProps) {
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  const configId = parsePositiveInt(id);
  if (!configId) notFound();

  const rawReturnTo = rawSearchParams.returnTo;
  const returnTo = getSafeSettingsReturnTo(
    typeof rawReturnTo === "string" ? rawReturnTo : rawReturnTo?.[0],
  );
  const { apiContext } = await getAuthContext();
  let cards = null;
  let errorMessage: string | null = null;
  let appConfig: SettingsDetailData | null = null;

  if (!hasValidSystemClientId(apiContext)) {
    logger.warn("Invalid system client ID while loading app configuration", {
      configId,
    });
    notFound();
  } else {
    try {
      const config = await getSettingsConfig(apiContext, configId);
      cards = mapSettingsCards(config);
      appConfig = {
        id: config.ID,
        name: config.APP_NAME,
        domain: config.DOMINIO,
        imagePath: config.PATH_IMAGEM,
        maintenance: config.FLAG_MAINTENANCE,
        active: config.IS_ACTIVE,
        notes: config.NOTES,
      };
    } catch (error) {
      if (error instanceof AppConfigNotFoundError) {
        notFound();
      } else {
        logger.error("Failed to load application settings", error);
        errorMessage =
          "Não foi possível carregar as configurações. Tente novamente.";
      }
    }
  }

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Configuração"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Configurações", href: returnTo },
          {
            label: appConfig?.name?.trim() || `Configuração ${configId}`,
            isActive: true,
          },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-5 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              {errorMessage ? (
                <div className="space-y-4 sm:space-y-5">
                  <DetailBackLink
                    href={returnTo}
                    label="Voltar para configurações"
                  />
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {errorMessage}
                  </div>
                </div>
              ) : appConfig && cards ? (
                <SettingsDetailLayout
                  config={appConfig}
                  cards={cards}
                  returnTo={returnTo}
                  imageGallery={
                    <Suspense fallback={<SettingsImageGallerySkeleton />}>
                      <SettingsImageGalleryServer
                        configId={appConfig.id}
                        appName={
                          appConfig.name?.trim() ||
                          `Configuração ${appConfig.id}`
                        }
                      />
                    </Suspense>
                  }
                  mobileImageGallery={
                    <Suspense fallback={<SettingsImageGallerySkeleton />}>
                      <SettingsImageGalleryServer
                        configId={appConfig.id}
                        appName={
                          appConfig.name?.trim() ||
                          `Configuração ${appConfig.id}`
                        }
                      />
                    </Suspense>
                  }
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsPageFallback() {
  return (
    <div
      className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner aria-hidden="true" />
      <span className="text-sm">Carregando configurações...</span>
    </div>
  );
}

function SettingsPage(props: SettingsDetailPageProps) {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageContent
        params={props.params}
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}

export default SettingsPage;
