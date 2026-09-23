import "server-only";

import { z } from "zod";
import { serverEnvs } from "@/core/config/envs.server";
import type { AuthContext } from "@/server/auth-context";
import {
  type AppConfig,
  AppConfigNotFoundError,
  appConfigServiceApi,
} from "@/services/api-main/app-config";
import {
  type JsonObject,
  SETTINGS_DEFINITIONS,
  type SettingCardData,
} from "./_components/settings-field-definitions";

type ApiContext = AuthContext["apiContext"];

export function hasValidSystemClientId(apiContext: ApiContext): boolean {
  return (
    Number.isInteger(apiContext.pe_system_client_id) &&
    apiContext.pe_system_client_id > 0
  );
}

export async function getSettingsConfig(
  apiContext: ApiContext,
): Promise<AppConfig> {
  const response = await appConfigServiceApi.findAppConfigById({
    ...apiContext,
    pe_config_id: serverEnvs.CONFIG_ID,
  });
  const config = appConfigServiceApi.extractAppConfigDetail(response);

  if (!config || !Number.isInteger(config.ID) || config.ID <= 0) {
    throw new AppConfigNotFoundError();
  }

  return config;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapSettingsCards(config: AppConfig): SettingCardData[] {
  return SETTINGS_DEFINITIONS.map(({ field }) => {
    const raw = config[field];
    if (raw === null) {
      return { field, value: {}, raw: null, invalid: false };
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (isJsonObject(parsed) && z.json().safeParse(parsed).success) {
        return { field, value: parsed, raw, invalid: false };
      }
    } catch {
      // The card receives the original text so it can be repaired explicitly.
    }

    return { field, value: null, raw, invalid: true };
  });
}
