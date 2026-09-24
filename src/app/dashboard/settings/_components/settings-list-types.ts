import type { AppConfigSummary } from "@/services/api-main/app-config";

export interface SettingsSearchState {
  search: string;
}

export interface SettingsListItem {
  id: number;
  name: string;
  domain: string | null;
  imagePath: string | null;
  active: number | null;
  maintenance: number | null;
  updatedAt: string | null;
}

export function toSettingsListItem(config: AppConfigSummary): SettingsListItem {
  if (!Number.isSafeInteger(config.ID) || config.ID <= 0) {
    throw new Error("Invalid app configuration ID returned by the API");
  }

  return {
    id: config.ID,
    name: config.APP_NAME?.trim() || `Configuração ${config.ID}`,
    domain: config.DOMINIO?.trim() || null,
    imagePath: config.PATH_IMAGEM,
    active: config.IS_ACTIVE,
    maintenance: config.FLAG_MAINTENANCE,
    updatedAt: config.UPDATEDAT,
  };
}
