import "server-only";

import { envs } from "@/core/config";
import { TAXONOMY_INLINE_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  StoredProcedureResponse,
  TaxonomyInlineResponse,
  UpdateTaxonomyImagePathInlineRequest,
  UpdateTaxonomyInactiveInlineRequest,
  UpdateTaxonomyNameInlineRequest,
  UpdateTaxonomyNotesInlineRequest,
  UpdateTaxonomyOrderInlineRequest,
  UpdateTaxonomyParentIdInlineRequest,
  UpdateTaxonomyQtProductsInlineRequest,
  UpdateTaxonomySlugInlineRequest,
} from "./types/taxonomy-inline-types";
import { TaxonomyInlineError } from "./types/taxonomy-inline-types";
import {
  UpdateTaxonomyImagePathInlineSchema,
  UpdateTaxonomyInactiveInlineSchema,
  UpdateTaxonomyNameInlineSchema,
  UpdateTaxonomyNotesInlineSchema,
  UpdateTaxonomyOrderInlineSchema,
  UpdateTaxonomyParentIdInlineSchema,
  UpdateTaxonomyQtProductsInlineSchema,
  UpdateTaxonomySlugInlineSchema,
} from "./validation/taxonomy-inline-schemas";

const logger = createLogger("TaxonomyInlineServiceApi");

export class TaxonomyInlineServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async updateTaxonomyImagePathInline(
    params: UpdateTaxonomyImagePathInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyImagePathInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_IMAGE_PATH,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar caminho da imagem da taxonomia inline",
        error,
      );
      throw error;
    }
  }

  async updateTaxonomyInactiveInline(
    params: UpdateTaxonomyInactiveInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyInactiveInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_INACTIVE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar status inativo da taxonomia inline",
        error,
      );
      throw error;
    }
  }

  async updateTaxonomyNameInline(
    params: UpdateTaxonomyNameInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyNameInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_NAME,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar nome da taxonomia inline", error);
      throw error;
    }
  }

  async updateTaxonomyNotesInline(
    params: UpdateTaxonomyNotesInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyNotesInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_NOTES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações da taxonomia inline", error);
      throw error;
    }
  }

  async updateTaxonomyOrderInline(
    params: UpdateTaxonomyOrderInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyOrderInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_ORDER,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar ordem da taxonomia inline", error);
      throw error;
    }
  }

  async updateTaxonomyParentIdInline(
    params: UpdateTaxonomyParentIdInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomyParentIdInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_PARENT_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar parent ID da taxonomia inline", error);
      throw error;
    }
  }

  async updateTaxonomyQtProductsInline(
    params: UpdateTaxonomyQtProductsInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams =
        UpdateTaxonomyQtProductsInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_QT_PRODUCTS,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar quantidade de produtos da taxonomia inline",
        error,
      );
      throw error;
    }
  }

  async updateTaxonomySlugInline(
    params: UpdateTaxonomySlugInlineRequest,
  ): Promise<TaxonomyInlineResponse> {
    try {
      const validatedParams = UpdateTaxonomySlugInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyInlineResponse>(
        TAXONOMY_INLINE_ENDPOINTS.UPDATE_SLUG,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar slug da taxonomia inline", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: TaxonomyInlineResponse): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new TaxonomyInlineError(
        spResponse.sp_message || "Erro na operação de taxonomia inline",
        "TAXONOMY_INLINE_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(
    response: TaxonomyInlineResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const taxonomyInlineServiceApi = new TaxonomyInlineServiceApi();
