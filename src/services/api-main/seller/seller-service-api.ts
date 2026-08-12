import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  SELLER_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformSellerDetail,
  transformSellerList,
  type UISellerDetail,
  type UISellerListItem,
} from "./transformers/transformers";

import type {
  SellerDetail,
  SellerFindByIdRequest,
  SellerFindByIdResponse,
  SellerFindManagerAllRequest,
  SellerFindManagerAllResponse,
  SellerFindManagerByIdRequest,
  SellerFindManagerByIdResponse,
  SellerListItem,
  SellerManagerDetail,
  SellerSearchAllRequest,
  SellerSearchAllResponse,
} from "./types/seller-types";
import { SellerError, SellerNotFoundError } from "./types/seller-types";
import {
  SellerFindByIdSchema,
  SellerFindManagerAllSchema,
  SellerFindManagerByIdSchema,
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

  async findSellerById(
    params: SellerFindByIdRequest,
  ): Promise<SellerFindByIdResponse> {
    try {
      const validatedParams = SellerFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SellerFindByIdResponse>(
        SELLER_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new SellerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new SellerError(
          response.message || "Erro ao buscar vendedor por ID",
          "SELLER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar vendedor por ID", error);
      throw error;
    }
  }

  async findManagerSellerById(
    params: SellerFindManagerByIdRequest,
  ): Promise<SellerFindManagerByIdResponse> {
    try {
      const validatedParams = SellerFindManagerByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SellerFindManagerByIdResponse>(
        SELLER_ENDPOINTS.FIND_MANAGER_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new SellerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new SellerError(
          response.message || "Erro ao buscar vendedor por ID no manager",
          "SELLER_FIND_MANAGER_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar vendedor por ID no manager", error);
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

  extractSellerById(response: SellerFindByIdResponse): SellerDetail | null {
    return (
      response.data?.["Seller find ID"]?.[0] ??
      response.data?.["Seller find Id"]?.[0] ??
      null
    );
  }

  extractManagerSellerById(
    response: SellerFindManagerByIdResponse,
  ): SellerManagerDetail | null {
    return response.data?.["Seller Information"]?.[0] ?? null;
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

  isValidSellerDetail(response: SellerFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      this.extractSellerById(response) !== null
    );
  }

  isValidSellerManagerDetail(response: SellerFindManagerByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      this.extractManagerSellerById(response) !== null
    );
  }
}

export const sellerServiceApi = new SellerServiceApi();

export interface GetSellersPageParams {
  search?: string;
  categoryId?: number;
  noImage?: number;
  statusId?: number;
  page?: number;
  pageSize?: number;
  columnId?: number;
  orderId?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

export async function getSellersPage(
  params: GetSellersPageParams = {},
): Promise<{ items: UISellerListItem[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], total: 0 };
  }

  const response = await sellerServiceApi.findManagerAllSellers({
    pe_search: params.search ?? "",
    pe_category_id: params.categoryId ?? 0,
    pe_flag_no_image: params.noImage ?? 0,
    pe_status_id: params.statusId ?? 0,
    pe_qt_records: params.pageSize ?? 50,
    pe_page_id: params.page ?? 0,
    pe_column_id: params.columnId ?? 2,
    pe_order_id: params.orderId ?? 2,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const sellers = sellerServiceApi.extractManagerAllSellers(response);
  const normalizedTotal = Number(response.recordId);
  const fallbackTotal =
    Number.isFinite(response.quantity) && response.quantity >= 0
      ? response.quantity
      : sellers.length;

  return {
    items: transformSellerList(sellers),
    total:
      Number.isFinite(normalizedTotal) && normalizedTotal >= 0
        ? normalizedTotal
        : fallbackTotal,
  };
}

export async function getSellerById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UISellerDetail | undefined> {
  if (!params.pe_system_client_id) return undefined;

  const response = await sellerServiceApi.findSellerById({
    pe_seller_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });
  const seller = sellerServiceApi.extractSellerById(response);
  return seller ? transformSellerDetail(seller) : undefined;
}
