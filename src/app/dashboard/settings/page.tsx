import { Suspense } from "react";
import { SiteHeaderWithBreadcrumb } from "@/app/dashboard/_components/header/site-header-with-breadcrumb";
import { RegistryPageShell } from "@/app/dashboard/_components/registry";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { appConfigServiceApi } from "@/services/api-main/app-config";
import { SettingsList } from "./_components/settings-list";
import { parseSettingsSearchParams } from "./_components/settings-list-params";
import {
  type SettingsListItem,
  toSettingsListItem,
} from "./_components/settings-list-types";
import { hasValidSystemClientId } from "./settings-data";

const logger = createLogger("SettingsListPage");

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SettingsListContent({ searchParams }: SettingsPageProps) {
  const [rawSearchParams, { apiContext }] = await Promise.all([
    searchParams,
    getAuthContext(),
  ]);
  const searchState = parseSettingsSearchParams(rawSearchParams);
  let items: SettingsListItem[] = [];
  let hasLoadError = false;

  if (!hasValidSystemClientId(apiContext)) {
    logger.warn("Invalid system client ID while listing app configurations");
    hasLoadError = true;
  } else {
    try {
      const response = await appConfigServiceApi.findAllAppConfigs({
        ...apiContext,
        pe_search: searchState.search || null,
        pe_limit: 50,
      });

      if (!appConfigServiceApi.isValidAppConfigList(response)) {
        throw new Error("Invalid app configuration list response");
      }

      items = appConfigServiceApi
        .extractAppConfigs(response)
        .map(toSettingsListItem);
    } catch (error) {
      logger.error("Failed to load application configuration list", error);
      hasLoadError = true;
    }
  }

  return (
    <SettingsList
      items={items}
      searchState={searchState}
      hasLoadError={hasLoadError}
    />
  );
}

function SettingsListFallback() {
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

export default function SettingsPage(props: SettingsPageProps) {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Configurações"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Configurações", isActive: true },
        ]}
      />
      <RegistryPageShell
        title="Configurações"
        description="Pesquise e gerencie as configurações dos aplicativos deste cliente."
      >
        <Suspense fallback={<SettingsListFallback />}>
          <SettingsListContent searchParams={props.searchParams} />
        </Suspense>
      </RegistryPageShell>
    </>
  );
}
