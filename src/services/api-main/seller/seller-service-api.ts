import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiSuccess,
  SELLER_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  SellerFindManagerAllRequest,
  SellerFindManagerAllResponse,
  SellerListItem,
  SellerSearchAllRequest,
  SellerSearchAllResponse,
} from "./types/seller-types";
import {
  SellerFindManagerAllSchema,
  SellerSearchAllSchema,
} from "./validation/seller-schemas";

const logger = createLogger("SellerServiceApi");

export class SellerServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async searchAllSellers(
    params: Partial<SellerSearchAllRequest> = {},
  ): Promise<SellerSearchAllResponse> {
    try {
      const validatedParams = SellerSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<SellerSearchAllResponse>(
        SELLER_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptySellerSearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar vendedores", error);
      throw error;
    }
  }

  async findManagerAllSellers(
    params: Partial<SellerFindManagerAllRequest> = {},
  ): Promise<SellerFindManagerAllResponse> {
    try {
      const validatedParams =
        SellerFindManagerAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_category_id: validatedParams.pe_category_id ?? 0,
        pe_flag_no_image: validatedParams.pe_flag_no_image ?? 0,
        pe_status_id: validatedParams.pe_status_id ?? 0,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 2,
        pe_order_id: validatedParams.pe_order_id ?? 2,
      });

      const response = await this.post<SellerFindManagerAllResponse>(
        SELLER_ENDPOINTS.FIND_MANAGER_ALL,
        requestBody,
      );

      return this.normalizeEmptySellerFindManagerAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar vendedores (manager)", error);
      throw error;
    }
  }

  private normalizeEmptySellerSearchAllResponse(
    response: SellerSearchAllResponse,
  ): SellerSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Seller find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptySellerFindManagerAllResponse(
    response: SellerFindManagerAllResponse,
  ): SellerFindManagerAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Seller find manager All": [],
        },
      };
    }
    return response;
  }

  extractSearchSellers(response: SellerSearchAllResponse): SellerListItem[] {
    return response.data?.["Seller find All"] ?? [];
  }

  extractManagerAllSellers(
    response: SellerFindManagerAllResponse,
  ): SellerListItem[] {
    return response.data?.["Seller find manager All"] ?? [];
  }

  isValidSellerSearchList(response: SellerSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Seller find All"])
    );
  }

  isValidSellerManagerList(response: SellerFindManagerAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Seller find manager All"])
    );
  }
}

export const sellerServiceApi = new SellerServiceApi();
