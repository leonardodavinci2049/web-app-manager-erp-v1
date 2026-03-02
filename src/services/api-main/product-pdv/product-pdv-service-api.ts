import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PRODUCT_PDV_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  ProductPdvDetail,
  ProductPdvFindAllRequest,
  ProductPdvFindAllResponse,
  ProductPdvFindByIdRequest,
  ProductPdvFindByIdResponse,
  ProductPdvFindSearchRequest,
  ProductPdvFindSearchResponse,
  ProductPdvListItem,
  ProductPdvRelatedCategory,
  ProductPdvRelatedProduct,
  ProductPdvSearchItem,
} from "./types/product-pdv-types";
import {
  ProductPdvError,
  ProductPdvNotFoundError,
} from "./types/product-pdv-types";
import {
  ProductPdvFindAllSchema,
  ProductPdvFindByIdSchema,
  ProductPdvFindSearchSchema,
} from "./validation/product-pdv-schemas";

const logger = createLogger("ProductPdvServiceApi");

export class ProductPdvServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllProductsPdv(
    params: Partial<ProductPdvFindAllRequest> = {},
  ): Promise<ProductPdvFindAllResponse> {
    try {
      const validatedParams = ProductPdvFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_taxonomy_id: validatedParams.pe_taxonomy_id ?? 0,
        pe_type_id: validatedParams.pe_type_id ?? 0,
        pe_brand_id: validatedParams.pe_brand_id ?? 0,
        pe_flag_stock: validatedParams.pe_flag_stock ?? 0,
        pe_flag_service: validatedParams.pe_flag_service ?? 0,
        pe_records_quantity: validatedParams.pe_records_quantity ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      const response = await this.post<ProductPdvFindAllResponse>(
        PRODUCT_PDV_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os produtos PDV", error);
      throw error;
    }
  }

  async findProductPdvById(
    params: ProductPdvFindByIdRequest,
  ): Promise<ProductPdvFindByIdResponse> {
    try {
      const validatedParams = ProductPdvFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductPdvFindByIdResponse>(
        PRODUCT_PDV_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new ProductPdvNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new ProductPdvError(
          response.message || "Erro ao buscar produto PDV por ID",
          "PRODUCT_PDV_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar produto PDV por ID", error);
      throw error;
    }
  }

  async findProductsPdvSearch(
    params: Partial<ProductPdvFindSearchRequest> = {},
  ): Promise<ProductPdvFindSearchResponse> {
    try {
      const validatedParams =
        ProductPdvFindSearchSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_customer_id: validatedParams.pe_customer_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_flag_stock: validatedParams.pe_flag_stock,
        pe_limit: validatedParams.pe_limit,
      });

      const response = await this.post<ProductPdvFindSearchResponse>(
        PRODUCT_PDV_ENDPOINTS.FIND_SEARCH,
        requestBody,
      );

      return this.normalizeEmptyFindSearchResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar produtos PDV por termo de pesquisa", error);
      throw error;
    }
  }

  private normalizeEmptyFindAllResponse(
    response: ProductPdvFindAllResponse,
  ): ProductPdvFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product Pdv find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyFindSearchResponse(
    response: ProductPdvFindSearchResponse,
  ): ProductPdvFindSearchResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product Pdv find Search": [],
        },
      };
    }
    return response;
  }

  extractProductsPdv(
    response: ProductPdvFindAllResponse,
  ): ProductPdvListItem[] {
    return response.data?.["Product Pdv find All"] ?? [];
  }

  extractProductsPdvSearch(
    response: ProductPdvFindSearchResponse,
  ): ProductPdvSearchItem[] {
    return response.data?.["Product Pdv find Search"] ?? [];
  }

  extractProductPdvById(
    response: ProductPdvFindByIdResponse,
  ): ProductPdvDetail | null {
    return response.data?.["Product Pdv find Id"]?.[0] ?? null;
  }

  extractRelatedCategories(
    response: ProductPdvFindByIdResponse,
  ): ProductPdvRelatedCategory[] {
    return response.data?.["Related Categories"] ?? [];
  }

  extractRelatedProducts(
    response: ProductPdvFindByIdResponse,
  ): ProductPdvRelatedProduct[] {
    return response.data?.["Related Products"] ?? [];
  }

  isValidProductPdvList(response: ProductPdvFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Pdv find All"])
    );
  }

  isValidProductPdvDetail(response: ProductPdvFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Pdv find Id"]) &&
      response.data["Product Pdv find Id"].length > 0
    );
  }

  isValidProductPdvSearchList(response: ProductPdvFindSearchResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Pdv find Search"])
    );
  }
}

export const productPdvServiceApi = new ProductPdvServiceApi();
