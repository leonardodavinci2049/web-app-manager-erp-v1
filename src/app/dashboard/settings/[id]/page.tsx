import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailBackLink } from "@/app/dashboard/_components/detail-page";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { AppConfigNotFoundError } from "@/services/api-main/app-config";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { SettingsAppImage } from "../_components/settings-app-image";
import { getSafeSettingsReturnTo } from "../_components/settings-list-params";
import {
  getSettingsConfig,
  hasValidSystemClientId,
  mapSettingsCards,
} from "../settings-data";
import { SettingsCards } from "./_components/settings-cards";

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
  let appConfig: {
    id: number;
    name: string | null;
    imagePath: string | null;
  } | null = null;

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
        imagePath: config.PATH_IMAGEM,
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
              <div className="space-y-4 sm:space-y-5">
                <DetailBackLink
                  href={returnTo}
                  label="Voltar para configurações"
                />
                <div className="flex items-center gap-3">
                  {appConfig && (
                    <SettingsAppImage
                      appName={appConfig.name}
                      imagePath={appConfig.imagePath}
                    />
                  )}
                  <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                      Configurações
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Gerencie os dados e a apresentação do aplicativo.
                    </p>
                  </div>
                </div>
                {errorMessage ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {errorMessage}
                  </div>
                ) : cards ? (
                  <SettingsCards configId={configId} cards={cards} />
                ) : null}
              </div>
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
