import "server-only";

import { envs } from "@/core/config";
import type { OrganizationMeta } from "@/database/schema";
import { getAuthContext } from "@/server/auth-context";
import { getOrganizationMetaByOrganizationId } from "./organization-meta-cached-service";

export type OrganizationMetaMap = Record<string, string | null>;

/**
 * Converte array de OrganizationMeta em um mapa chave-valor.
 */
export function toOrganizationMetaMap(
  metaList: OrganizationMeta[],
): OrganizationMetaMap {
  const map: OrganizationMetaMap = {};

  for (const meta of metaList) {
    map[meta.metaKey.toUpperCase()] = meta.metaValue ?? null;
  }

  return map;
}

/**
 * Carrega todos os metadados da organização ativa do usuário logado
 * como um mapa chave-valor. Utiliza cache "use cache" (1h).
 *
 * Para Server Components: chamar diretamente.
 * Para Client Components: usar via OrganizationMetaProvider.
 */
export async function getOrganizationConfig(): Promise<{
  organizationId: string;
  meta: OrganizationMetaMap;
  imageBaseUrl: string;
}> {
  const { apiContext } = await getAuthContext();
  const organizationId = apiContext.pe_organization_id;

  const metaList = await getOrganizationMetaByOrganizationId(organizationId);

  return {
    organizationId,
    meta: toOrganizationMetaMap(metaList),
    imageBaseUrl: envs.NEXT_PUBLIC_EXTERNAL_PATH_IMAGES_URL,
  };
}
