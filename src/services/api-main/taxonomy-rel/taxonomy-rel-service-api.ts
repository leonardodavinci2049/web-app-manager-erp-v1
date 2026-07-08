import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  TAXONOMY_REL_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformTaxonomyRelProductList,
  type UITaxonomyRelProduct,
} from "./transformers/transformers";
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
    if (isApiError(response.statusCode)) {
      throw new TaxonomyRelError(
        response.message || "Erro na operação de relação taxonomia-produto",
        "TAXONOMY_REL_OPERATION_ERROR",
        response.statusCode,
      );
    }

    const spResponse = this.extractStoredProcedureResult(response);

    if (!spResponse) {
      throw new TaxonomyRelError(
        "A API não confirmou a operação de relação taxonomia-produto",
        "TAXONOMY_REL_INVALID_RESPONSE",
        response.statusCode,
      );
    }

    if (spResponse.sp_error_id !== 0) {
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
        data: {},
      };
    }
    return response;
  }

  extractProducts(
    response: TaxonomyRelFindAllProductsResponse,
  ): TaxonomyRelProductItem[] {
    if (!response.data) return [];

    const products = Object.values(response.data).find(Array.isArray);
    return products ?? [];
  }

  extractStoredProcedureResult(
    response: TaxonomyRelCreateResponse | TaxonomyRelDeleteResponse,
  ): StoredProcedureResponse | null {
    const firstResult: unknown = response.data?.[0];

    // Keep compatibility with responses that still wrap result sets.
    if (Array.isArray(firstResult)) {
      return (firstResult[0] as StoredProcedureResponse | undefined) ?? null;
    }

    return (firstResult as StoredProcedureResponse | undefined) ?? null;
  }

  isValidProductList(response: TaxonomyRelFindAllProductsResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Object.values(response.data).some(Array.isArray)
    );
  }
}

export const taxonomyRelServiceApi = new TaxonomyRelServiceApi();

export async function getProductsByTaxonomy(
  taxonomyId: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UITaxonomyRelProduct[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await taxonomyRelServiceApi.findAllProductsByTaxonomy({
    pe_record_id: taxonomyId,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const products = taxonomyRelServiceApi.extractProducts(response);
  return transformTaxonomyRelProductList(products);
}
