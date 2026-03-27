import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import type { UserMeta } from "@/database/schema";
import { CACHE_TAGS } from "@/lib/cache-config";
import UserMetaService from "./user-meta.service";

const logger = createLogger("UserMetaCachedService");

export async function getUserMetaByUserId(userId: string): Promise<UserMeta[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.userMeta(userId),
    CACHE_TAGS.userMetaCollection,
    CACHE_TAGS.user(userId),
  );

  try {
    const response = await UserMetaService.findUserMetaByUserId({ userId });

    if (!response.success || !response.data) {
      logger.error("Error loading user meta:", response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch user meta for user ${userId}:`, error);
    return [];
  }
}

export async function getUserMetaByKey(
  userId: string,
  metaKey: string,
): Promise<UserMeta | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.userMeta(userId),
    CACHE_TAGS.userMetaKey(userId, metaKey),
    CACHE_TAGS.userMetaCollection,
    CACHE_TAGS.user(userId),
  );

  try {
    const response = await UserMetaService.findUserMetaByKey({
      userId,
      metaKey,
    });

    if (!response.success || !response.data) {
      if (response.error) {
        logger.error("Error loading user meta by key:", response.error);
      }
      return null;
    }

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch user meta key ${metaKey} for user ${userId}:`,
      error,
    );
    return null;
  }
}
