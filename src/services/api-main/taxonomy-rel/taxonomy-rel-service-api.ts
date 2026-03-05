import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiSuccess,
  TAXONOMY_REL_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  StoredProcedureResponse,
  TaxonomyRelCreateRequest,
  TaxonomyRelCreateResponse,
  TaxonomyRelDeleteRequest,
  TaxonomyRelDeleteResponse,
  TaxonomyRelFindAllProductsRequest,
  TaxonomyRelFindAllProductsResponse,
  TaxonomyRelProductItem,
} from "./types/taxonomy-rel-types";
import { TaxonomyRelError } from "./types/taxonomy-rel-types";
import {
  TaxonomyRelCreateSchema,
  TaxonomyRelDeleteSchema,
  TaxonomyRelFindAllProductsSchema,
} from "./validation/taxonomy-rel-schemas";

const logger = createLogger("TaxonomyRelServiceApi");

export class TaxonomyRelServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllProductsByTaxonomy(
    params: TaxonomyRelFindAllProductsRequest,
  ): Promise<TaxonomyRelFindAllProductsResponse> {
    try {
      const validatedParams = TaxonomyRelFindAllProductsSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyRelFindAllProductsResponse>(
        TAXONOMY_REL_ENDPOINTS.FIND_ALL_PRODUCTS,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar produtos por taxonomia", error);
      throw error;
    }
  }

  async createTaxonomyRelation(
    params: TaxonomyRelCreateRequest,
  ): Promise<TaxonomyRelCreateResponse> {
    try {
      const validatedParams = TaxonomyRelCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyRelCreateResponse>(
        TAXONOMY_REL_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar relação taxonomia-produto", error);
      throw error;
    }
  }

  async deleteTaxonomyRelation(
    params: TaxonomyRelDeleteRequest,
  ): Promise<TaxonomyRelDeleteResponse> {
    try {
      const validatedParams = TaxonomyRelDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyRelDeleteResponse>(
        TAXONOMY_REL_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir relação taxonomia-produto", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response: TaxonomyRelCreateResponse | TaxonomyRelDeleteResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new TaxonomyRelError(
        spResponse.sp_message ||
          "Erro na operação de relação taxonomia-produto",
        "TAXONOMY_REL_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: TaxonomyRelFindAllProductsResponse,
  ): TaxonomyRelFindAllProductsResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Brand find All": [],
        },
      };
    }
    return response;
  }

  extractProducts(
    response: TaxonomyRelFindAllProductsResponse,
  ): TaxonomyRelProductItem[] {
    return response.data?.["Brand find All"] ?? [];
  }

  extractStoredProcedureResult(
    response: TaxonomyRelCreateResponse | TaxonomyRelDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidProductList(response: TaxonomyRelFindAllProductsResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Brand find All"])
    );
  }
}

export const taxonomyRelServiceApi = new TaxonomyRelServiceApi();
