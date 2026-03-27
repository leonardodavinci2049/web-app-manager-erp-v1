import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import type { OrganizationMeta } from "@/database/schema";
import { CACHE_TAGS } from "@/lib/cache-config";
import OrganizationMetaService from "./organization-meta.service";

const logger = createLogger("OrganizationMetaCachedService");

export async function getOrganizationMetaByOrganizationId(
  organizationId: string,
): Promise<OrganizationMeta[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.organizationMeta(organizationId),
    CACHE_TAGS.organizationMetaCollection,
    CACHE_TAGS.organization(organizationId),
  );

  try {
    const response =
      await OrganizationMetaService.findOrganizationMetaByOrganizationId({
        organizationId,
      });

    if (!response.success || !response.data) {
      logger.error("Error loading organization meta:", response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch organization meta for organization ${organizationId}:`,
      error,
    );
    return [];
  }
}

export async function getOrganizationMetaByKey(
  organizationId: string,
  metaKey: string,
): Promise<OrganizationMeta | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.organizationMeta(organizationId),
    CACHE_TAGS.organizationMetaKey(organizationId, metaKey),
    CACHE_TAGS.organizationMetaCollection,
    CACHE_TAGS.organization(organizationId),
  );

  try {
    const response = await OrganizationMetaService.findOrganizationMetaByKey({
      organizationId,
      metaKey,
    });

    if (!response.success || !response.data) {
      if (response.error) {
        logger.error("Error loading organization meta by key:", response.error);
      }
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch organization meta key ${metaKey} for organization ${organizationId}:`,
      error,
    );
    return null;
  }
}
