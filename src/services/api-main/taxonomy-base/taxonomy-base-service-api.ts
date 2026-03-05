import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  TAXONOMY_BASE_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  StoredProcedureResponse,
  TaxonomyCreateRequest,
  TaxonomyCreateResponse,
  TaxonomyDeleteRequest,
  TaxonomyDeleteResponse,
  TaxonomyDetail,
  TaxonomyFindAllRequest,
  TaxonomyFindAllResponse,
  TaxonomyFindByIdRequest,
  TaxonomyFindByIdResponse,
  TaxonomyFindMenuRequest,
  TaxonomyFindMenuResponse,
  TaxonomyListItem,
  TaxonomyMenuItem,
  TaxonomyUpdateMetadataRequest,
  TaxonomyUpdateMetadataResponse,
  TaxonomyUpdateRequest,
  TaxonomyUpdateResponse,
} from "./types/taxonomy-base-types";
import {
  TaxonomyBaseError,
  TaxonomyNotFoundError,
} from "./types/taxonomy-base-types";
import {
  TaxonomyCreateSchema,
  TaxonomyDeleteSchema,
  TaxonomyFindAllSchema,
  TaxonomyFindByIdSchema,
  TaxonomyFindMenuSchema,
  TaxonomyUpdateMetadataSchema,
  TaxonomyUpdateSchema,
} from "./validation/taxonomy-base-schemas";

const logger = createLogger("TaxonomyBaseServiceApi");

export class TaxonomyBaseServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllTaxonomies(
    params: Partial<TaxonomyFindAllRequest> = {},
  ): Promise<TaxonomyFindAllResponse> {
    try {
      const validatedParams = TaxonomyFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_parent_id: validatedParams.pe_parent_id ?? 0,
        pe_search: validatedParams.pe_search ?? "",
        pe_flag_inactive: validatedParams.pe_flag_inactive ?? 0,
        pe_records_quantity: validatedParams.pe_records_quantity ?? 20,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      const response = await this.post<TaxonomyFindAllResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todas as taxonomias", error);
      throw error;
    }
  }

  async findTaxonomyById(
    params: TaxonomyFindByIdRequest,
  ): Promise<TaxonomyFindByIdResponse> {
    try {
      const validatedParams = TaxonomyFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyFindByIdResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new TaxonomyNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new TaxonomyBaseError(
          response.message || "Erro ao buscar taxonomia por ID",
          "TAXONOMY_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar taxonomia por ID", error);
      throw error;
    }
  }

  async findTaxonomyMenu(
    params: TaxonomyFindMenuRequest,
  ): Promise<TaxonomyFindMenuResponse> {
    try {
      const validatedParams = TaxonomyFindMenuSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyFindMenuResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_MENU,
        requestBody,
      );

      return this.normalizeEmptyFindMenuResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar menu de taxonomias", error);
      throw error;
    }
  }

  async createTaxonomy(
    params: TaxonomyCreateRequest,
  ): Promise<TaxonomyCreateResponse> {
    try {
      const validatedParams = TaxonomyCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyCreateResponse>(
        TAXONOMY_BASE_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar taxonomia", error);
      throw error;
    }
  }

  async updateTaxonomy(
    params: TaxonomyUpdateRequest,
  ): Promise<TaxonomyUpdateResponse> {
    try {
      const validatedParams = TaxonomyUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyUpdateResponse>(
        TAXONOMY_BASE_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar taxonomia", error);
      throw error;
    }
  }

  async deleteTaxonomy(
    params: TaxonomyDeleteRequest,
  ): Promise<TaxonomyDeleteResponse> {
    try {
      const validatedParams = TaxonomyDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyDeleteResponse>(
        TAXONOMY_BASE_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir taxonomia", error);
      throw error;
    }
  }

  async updateTaxonomyMetadata(
    params: TaxonomyUpdateMetadataRequest,
  ): Promise<TaxonomyUpdateMetadataResponse> {
    try {
      const validatedParams = TaxonomyUpdateMetadataSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyUpdateMetadataResponse>(
        TAXONOMY_BASE_ENDPOINTS.UPDATE_METADATA,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar metadata da taxonomia", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response:
      | TaxonomyCreateResponse
      | TaxonomyUpdateResponse
      | TaxonomyDeleteResponse
      | TaxonomyUpdateMetadataResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new TaxonomyBaseError(
        spResponse.sp_message || "Erro na operação de taxonomia",
        "TAXONOMY_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: TaxonomyFindAllResponse,
  ): TaxonomyFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Taxonomy find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyFindMenuResponse(
    response: TaxonomyFindMenuResponse,
  ): TaxonomyFindMenuResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Taxonomy find Menu": [],
        },
      };
    }
    return response;
  }

  extractTaxonomies(response: TaxonomyFindAllResponse): TaxonomyListItem[] {
    return response.data?.["Taxonomy find All"] ?? [];
  }

  extractTaxonomyById(
    response: TaxonomyFindByIdResponse,
  ): TaxonomyDetail | null {
    return response.data?.["Taxonomy find Id"]?.[0] ?? null;
  }

  extractTaxonomyMenu(response: TaxonomyFindMenuResponse): TaxonomyMenuItem[] {
    return response.data?.["Taxonomy find Menu"] ?? [];
  }

  extractStoredProcedureResult(
    response:
      | TaxonomyCreateResponse
      | TaxonomyUpdateResponse
      | TaxonomyDeleteResponse
      | TaxonomyUpdateMetadataResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidTaxonomyList(response: TaxonomyFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find All"])
    );
  }

  isValidTaxonomyDetail(response: TaxonomyFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find Id"]) &&
      response.data["Taxonomy find Id"].length > 0
    );
  }

  isValidTaxonomyMenu(response: TaxonomyFindMenuResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find Menu"])
    );
  }
}

export const taxonomyBaseServiceApi = new TaxonomyBaseServiceApi();
