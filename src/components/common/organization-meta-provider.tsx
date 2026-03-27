"use client";

import { createContext, use } from "react";
import type { OrganizationMetaMap } from "@/services/db/organization-meta/organization-meta-helpers";

interface OrganizationMetaContextValue {
  organizationId: string;
  meta: OrganizationMetaMap;
  imageBaseUrl: string;
}

const OrganizationMetaContext =
  createContext<OrganizationMetaContextValue | null>(null);

export function OrganizationMetaProvider({
  organizationId,
  meta,
  imageBaseUrl,
  children,
}: {
  organizationId: string;
  meta: OrganizationMetaMap;
  imageBaseUrl: string;
  children: React.ReactNode;
}) {
  return (
    <OrganizationMetaContext value={{ organizationId, meta, imageBaseUrl }}>
      {children}
    </OrganizationMetaContext>
  );
}

export function useOrganizationMeta(): OrganizationMetaContextValue {
  const context = use(OrganizationMetaContext);

  if (!context) {
    throw new Error(
      "useOrganizationMeta deve ser usado dentro de OrganizationMetaProvider",
    );
  }

  return context;
}

/**
 * Retorna o valor de uma metaKey específica da organização.
 *
 * @example
 * const logoUrl = useOrganizationMetaValue("IMAGE1");
 */
export function useOrganizationMetaValue(metaKey: string): string | null {
  const { meta } = useOrganizationMeta();
  return meta[metaKey.toUpperCase()] ?? null;
}
