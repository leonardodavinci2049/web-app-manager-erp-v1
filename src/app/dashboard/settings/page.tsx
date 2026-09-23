import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { AppConfigNotFoundError } from "@/services/api-main/app-config";
import { SiteHeaderWithBreadcrumb } from "../_components/header/site-header-with-breadcrumb";
import { SettingsCards } from "./_components/settings-cards";
import {
  getSettingsConfig,
  hasValidSystemClientId,
  mapSettingsCards,
} from "./settings-data";

const logger = createLogger("SettingsPage");

async function SettingsPageContent() {
  const { apiContext } = await getAuthContext();
  let cards = null;
  let errorMessage: string | null = null;

  if (!hasValidSystemClientId(apiContext)) {
    errorMessage =
      "Cliente de sistema inválido. As configurações não estão disponíveis.";
  } else {
    try {
      const config = await getSettingsConfig(apiContext);
      cards = mapSettingsCards(config);
    } catch (error) {
      if (error instanceof AppConfigNotFoundError) {
        errorMessage = "Nenhuma configuração foi encontrada para este cliente.";
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
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Configurações", isActive: true },
        ]}
      />
      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 py-4 sm:gap-5 sm:py-6">
            <div className="px-3 sm:px-4 lg:px-6">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">
                    Configurações
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Gerencie os dados e a apresentação do aplicativo.
                  </p>
                </div>
                {errorMessage ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {errorMessage}
                  </div>
                ) : cards ? (
                  <SettingsCards cards={cards} />
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

function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageContent />
    </Suspense>
  );
}

export default SettingsPage;
