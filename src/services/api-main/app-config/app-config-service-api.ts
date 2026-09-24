import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  APP_CONFIG_ENDPOINTS,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  type AppConfig,
  AppConfigError,
  type AppConfigFindAllRequest,
  type AppConfigFindAllResponse,
  type AppConfigFindByIdRequest,
  type AppConfigFindByIdResponse,
  type AppConfigMutationResponse,
  AppConfigNotFoundError,
  type AppConfigSummary,
  type AppConfigUpdateGeneralFieldRequest,
  type AppMenuEntry,
  type AppMenuFindByTypeRequest,
  type AppMenuFindByTypeResponse,
  type StoredProcedureResponse,
} from "./types/app-config-types";
import {
  AppConfigFindAllSchema,
  AppConfigFindByIdSchema,
  AppConfigUpdateGeneralFieldSchema,
  AppMenuFindByTypeSchema,
} from "./validation/app-config-schemas";

const logger = createLogger("AppConfigServiceApi");

export class AppConfigServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllAppConfigs(
    params: AppConfigFindAllRequest,
  ): Promise<AppConfigFindAllResponse> {
    try {
      const validatedParams = AppConfigFindAllSchema.parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search,
        pe_limit: validatedParams.pe_limit,
      });

      const response = await this.post<AppConfigFindAllResponse>(
        APP_CONFIG_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyAppConfigFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar configurações do aplicativo", error);
      throw error;
    }
  }

  async findAppConfigById(
    params: AppConfigFindByIdRequest,
  ): Promise<AppConfigFindByIdResponse> {
    try {
      const validatedParams = AppConfigFindByIdSchema.parse(params);
      const configId = validatedParams.pe_config_id;
      const requestBody = this.buildBasePayload({
        ...validatedParams,
      });

      const response = await this.post<AppConfigFindByIdResponse>(
        APP_CONFIG_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (
        response.statusCode === API_STATUS_CODES.NOT_FOUND ||
        response.statusCode === API_STATUS_CODES.EMPTY_RESULT
      ) {
        throw new AppConfigNotFoundError({
          pe_config_id: configId,
        });
      }

      if (
        !isApiSuccess(response.statusCode) ||
        response.errorId !== 0 ||
        !Array.isArray(response.data?.["App Config"])
      ) {
        throw new AppConfigError(
          response.message ||
            "Erro ao buscar configuração do aplicativo por ID",
          "APP_CONFIG_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar configuração do aplicativo por ID", error);
      throw error;
    }
  }

  async findAppMenuByType(
    params: Partial<AppMenuFindByTypeRequest> = {},
  ): Promise<AppMenuFindByTypeResponse> {
    try {
      const validatedParams = AppMenuFindByTypeSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_customer_id: validatedParams.pe_customer_id ?? 0,
        pe_type: validatedParams.pe_type,
      });

      const response = await this.post<AppMenuFindByTypeResponse>(
        APP_CONFIG_ENDPOINTS.MENU_FIND_TYPE,
        requestBody,
      );

      return this.normalizeEmptyAppMenuFindByTypeResponse(response);
    } catch (error) {
      logger.error("Erro ao listar menu do aplicativo por tipo", error);
      throw error;
    }
  }

  async updateAppConfigGeneralField(
    params: AppConfigUpdateGeneralFieldRequest,
  ): Promise<AppConfigMutationResponse> {
    try {
      const validatedParams = AppConfigUpdateGeneralFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<AppConfigMutationResponse>(
        APP_CONFIG_ENDPOINTS.UPD_GENERAL_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar campo genérico da configuração do aplicativo",
        error,
      );
      throw error;
    }
  }

  private checkStoredProcedureError(response: AppConfigMutationResponse): void {
    const spResponse = response.data?.[0];
    if (
      response.statusCode !== API_STATUS_CODES.SUCCESS ||
      response.errorId !== 0 ||
      !spResponse ||
      spResponse.sp_error_id !== 0 ||
      !Number.isInteger(spResponse.sp_return_id) ||
      spResponse.sp_return_id <= 0
    ) {
      throw new AppConfigError(
        spResponse?.sp_message ||
          response.message ||
          "Erro na operação de configuração do aplicativo",
        "APP_CONFIG_OPERATION_ERROR",
        response.statusCode,
      );
    }
  }

  private normalizeEmptyAppConfigFindAllResponse(
    response: AppConfigFindAllResponse,
  ): AppConfigFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "App Config": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyAppMenuFindByTypeResponse(
    response: AppMenuFindByTypeResponse,
  ): AppMenuFindByTypeResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "App Menu": [],
        },
      };
    }
    return response;
  }

  extractAppConfigs(response: AppConfigFindAllResponse): AppConfigSummary[] {
    return response.data?.["App Config"] ?? [];
  }

  extractAppConfigDetail(
    response: AppConfigFindByIdResponse,
  ): AppConfig | null {
    return response.data?.["App Config"]?.[0] ?? null;
  }

  extractAppMenuEntries(response: AppMenuFindByTypeResponse): AppMenuEntry[] {
    return response.data?.["App Menu"] ?? [];
  }

  extractStoredProcedureResult(
    response: AppConfigMutationResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0] ?? null;
  }

  isValidAppConfigList(response: AppConfigFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.["App Config"])
    );
  }

  isValidAppConfigDetail(response: AppConfigFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.["App Config"]) &&
      response.data["App Config"].length > 0
    );
  }

  isValidAppMenuList(response: AppMenuFindByTypeResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.["App Menu"])
    );
  }
}

export const appConfigServiceApi = new AppConfigServiceApi();
