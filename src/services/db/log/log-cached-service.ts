import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createLogger } from "@/core/logger";
import type { TblLogLogin, TblLogOperation } from "@/database/schema";
import { CACHE_TAGS } from "@/lib/cache-config";
import logService from "./log.service";
import type {
  TblLogLoginFindAll,
  TblLoglogOperationFindAll,
} from "./types/log.type";

const logger = createLogger("LogCachedService");

export type LogLoginListItem = TblLogLogin & {
  user_name: string;
  user_email: string;
  organization_name: string;
};
export type LogOperationListItem = TblLogOperation & {
  app_name: string;
  organization_name: string;
  user_name: string;
};

function transformLogLogin(log: TblLogLoginFindAll): LogLoginListItem {
  return {
    log_id: log.log_id,
    app_id: log.app_id,
    organization_Id: log.organization_Id,
    organization_name: log.organization_name,
    user_id: log.user_id,
    user_name: log.user_name,
    user_email: log.user_email,
    module_id: Number(log.module_id),
    record_id: log.record_id,
    log: log.log,
    note: log.note,
    createdAt: log.createdAt,
  };
}

function transformLogOperation(
  log: TblLoglogOperationFindAll,
): LogOperationListItem {
  return {
    log_id: log.log_id,
    app_id: log.app_id,
    app_name: log.app_name,
    organization_Id: log.organization_Id,
    organization_name: log.organization_name,
    user_id: log.user_id,
    user_name: log.user_name,
    module_id: Number(log.module_id),
    record_id: log.record_id,
    log: log.log,
    note: log.note,
    createdAt: log.createdAt,
  };
}

export async function getAllLoginLogs(
  organizationId?: string,
  userId?: string,
  searchTerm?: string,
  limit?: number,
): Promise<LogLoginListItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.logLogins);

  try {
    const response = await logService.execLogLoginFindAllQuery({
      PE_ORGANIZATION_ID: organizationId,
      PE_USER_ID: userId,
      PE_SEARCH_USER: searchTerm,
      PE_LIMIT: limit,
    });

    // console.log("Login logs response:", response);

    if (response.statusCode !== 100200 || !response.data) {
      logger.error("Error loading login logs:", response.message);
      return [];
    }

    const rawLogs = Array.isArray(response.data) ? response.data : [];

    return rawLogs.map(transformLogLogin);
  } catch (error) {
    logger.error("Failed to fetch login logs:", error);
    return [];
  }
}

export async function getAllOperationLogs(
  organizationId?: string,
  userId?: string,
  searchTerm?: string,
  limit?: number,
): Promise<LogOperationListItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.logOperations);

  try {
    const response = await logService.execLogOperationFindAllQuery({
      PE_ORGANIZATION_ID: organizationId,
      PE_USER_ID: userId,
      PE_SEARCH_USER: searchTerm,
      PE_LIMIT: limit,
    });

    if (response.statusCode !== 100200 || !response.data) {
      logger.error("Error loading operation logs:", response.message);
      return [];
    }

    const rawLogs = Array.isArray(response.data) ? response.data : [];

    return rawLogs.map(transformLogOperation);
  } catch (error) {
    logger.error("Failed to fetch operation logs:", error);
    return [];
  }
}
