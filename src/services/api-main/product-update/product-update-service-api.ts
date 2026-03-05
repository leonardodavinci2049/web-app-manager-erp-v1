import "server-only";

import { envs } from "@/core/config";
import { PRODUCT_UPDATE_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  ProductUpdateResponse,
  StoredProcedureResponse,
  UpdateProductCharacteristicsRequest,
  UpdateProductFlagsRequest,
  UpdateProductGeneralRequest,
  UpdateProductMetadataRequest,
  UpdateProductPriceRequest,
  UpdateProductTaxValuesRequest,
} from "./types/product-update-types";
import { ProductUpdateError } from "./types/product-update-types";
import {
  UpdateProductCharacteristicsSchema,
  UpdateProductFlagsSchema,
  UpdateProductGeneralSchema,
  UpdateProductMetadataSchema,
  UpdateProductPriceSchema,
  UpdateProductTaxValuesSchema,
} from "./validation/product-update-schemas";

const logger = createLogger("ProductUpdateServiceApi");

export class ProductUpdateServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async updateProductCharacteristics(
    params: UpdateProductCharacteristicsRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductCharacteristicsSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_CHARACTERISTICS,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar características do produto", error);
      throw error;
    }
  }

  async updateProductFlags(
    params: UpdateProductFlagsRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductFlagsSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_FLAGS,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar flags do produto", error);
      throw error;
    }
  }

  async updateProductGeneral(
    params: UpdateProductGeneralRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductGeneralSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_GENERAL,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar informações gerais do produto", error);
      throw error;
    }
  }

  async updateProductMetadata(
    params: UpdateProductMetadataRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductMetadataSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_METADATA,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar metadados do produto", error);
      throw error;
    }
  }

  async updateProductPrice(
    params: UpdateProductPriceRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductPriceSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_PRICE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar preços do produto", error);
      throw error;
    }
  }

  async updateProductTaxValues(
    params: UpdateProductTaxValuesRequest,
  ): Promise<ProductUpdateResponse> {
    try {
      const validatedParams = UpdateProductTaxValuesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductUpdateResponse>(
        PRODUCT_UPDATE_ENDPOINTS.UPDATE_TAX_VALUES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar valores fiscais do produto", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: ProductUpdateResponse): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new ProductUpdateError(
        spResponse.sp_message || "Erro na operação de atualização do produto",
        "PRODUCT_UPDATE_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(
    response: ProductUpdateResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const productUpdateServiceApi = new ProductUpdateServiceApi();
