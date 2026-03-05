import "server-only";

import { envs } from "@/core/config";
import { PRODUCT_INLINE_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  ProductInlineResponse,
  StoredProcedureResponse,
  UpdateProductBrandInlineRequest,
  UpdateProductDescriptionInlineRequest,
  UpdateProductImagePathInlineRequest,
  UpdateProductNameInlineRequest,
  UpdateProductShortDescriptionInlineRequest,
  UpdateProductStockInlineRequest,
  UpdateProductStockMinInlineRequest,
  UpdateProductTypeInlineRequest,
  UpdateProductVariousInlineRequest,
} from "./types/product-inline-types";
import { ProductInlineError } from "./types/product-inline-types";
import {
  UpdateProductBrandInlineSchema,
  UpdateProductDescriptionInlineSchema,
  UpdateProductImagePathInlineSchema,
  UpdateProductNameInlineSchema,
  UpdateProductShortDescriptionInlineSchema,
  UpdateProductStockInlineSchema,
  UpdateProductStockMinInlineSchema,
  UpdateProductTypeInlineSchema,
  UpdateProductVariousInlineSchema,
} from "./validation/product-inline-schemas";

const logger = createLogger("ProductInlineServiceApi");

export class ProductInlineServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async updateProductBrandInline(
    params: UpdateProductBrandInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductBrandInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_BRAND,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar marca do produto inline", error);
      throw error;
    }
  }

  async updateProductDescriptionInline(
    params: UpdateProductDescriptionInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams =
        UpdateProductDescriptionInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_DESCRIPTION,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar descrição do produto inline", error);
      throw error;
    }
  }

  async updateProductNameInline(
    params: UpdateProductNameInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductNameInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_NAME,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar nome do produto inline", error);
      throw error;
    }
  }

  async updateProductImagePathInline(
    params: UpdateProductImagePathInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductImagePathInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_IMAGE_PATH,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar caminho da imagem do produto inline",
        error,
      );
      throw error;
    }
  }

  async updateProductShortDescriptionInline(
    params: UpdateProductShortDescriptionInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams =
        UpdateProductShortDescriptionInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_SHORT_DESCRIPTION,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar descrição curta do produto inline",
        error,
      );
      throw error;
    }
  }

  async updateProductStockMinInline(
    params: UpdateProductStockMinInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductStockMinInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_STOCK_MIN,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar estoque mínimo do produto inline", error);
      throw error;
    }
  }

  async updateProductStockInline(
    params: UpdateProductStockInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductStockInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_STOCK,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar estoque do produto inline", error);
      throw error;
    }
  }

  async updateProductTypeInline(
    params: UpdateProductTypeInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductTypeInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_TYPE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar tipo do produto inline", error);
      throw error;
    }
  }

  async updateProductVariousInline(
    params: UpdateProductVariousInlineRequest,
  ): Promise<ProductInlineResponse> {
    try {
      const validatedParams = UpdateProductVariousInlineSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductInlineResponse>(
        PRODUCT_INLINE_ENDPOINTS.UPDATE_VARIOUS,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar termo do produto inline", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: ProductInlineResponse): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new ProductInlineError(
        spResponse.sp_message || "Erro na operação de produto inline",
        "PRODUCT_INLINE_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(
    response: ProductInlineResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const productInlineServiceApi = new ProductInlineServiceApi();
