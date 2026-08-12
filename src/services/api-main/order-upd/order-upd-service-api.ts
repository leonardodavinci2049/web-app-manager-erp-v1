import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { ORDER_UPD_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderUpdCustomerRequest,
  OrderUpdCustomerResponse,
  OrderUpdDiscountRequest,
  OrderUpdDiscountResponse,
  OrderUpdFreteRequest,
  OrderUpdFreteResponse,
  OrderUpdInlineFieldRequest,
  OrderUpdInlineFieldResponse,
  OrderUpdNotesRequest,
  OrderUpdNotesResponse,
  OrderUpdPgMethodRequest,
  OrderUpdPgMethodResponse,
  OrderUpdSellerRequest,
  OrderUpdSellerResponse,
  OrderUpdStatusRequest,
  OrderUpdStatusResponse,
  StoredProcedureResponse,
} from "./types/order-upd-types";
import { OrderUpdError } from "./types/order-upd-types";
import {
  OrderUpdCustomerSchema,
  OrderUpdDiscountSchema,
  OrderUpdFreteSchema,
  OrderUpdInlineFieldSchema,
  OrderUpdNotesSchema,
  OrderUpdPgMethodSchema,
  OrderUpdSellerSchema,
  OrderUpdStatusSchema,
} from "./validation/order-upd-schemas";

const logger = createLogger("OrderUpdServiceApi");

export class OrderUpdServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  private checkStoredProcedureError(response: {
    data: StoredProcedureResponse[];
  }): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new OrderUpdError(
        spResponse.sp_message || "Erro na operação de atualização do pedido",
        "ORDER_UPD_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  async updateCustomer(
    params: OrderUpdCustomerRequest,
  ): Promise<OrderUpdCustomerResponse> {
    try {
      const validatedParams = OrderUpdCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdCustomerResponse>(
        ORDER_UPD_ENDPOINTS.UPD_CUSTOMER_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar cliente do pedido", error);
      throw error;
    }
  }

  async updateDiscount(
    params: OrderUpdDiscountRequest,
  ): Promise<OrderUpdDiscountResponse> {
    try {
      const validatedParams = OrderUpdDiscountSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdDiscountResponse>(
        ORDER_UPD_ENDPOINTS.UPD_DISCOUNT_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar desconto do pedido", error);
      throw error;
    }
  }

  async updateFrete(
    params: OrderUpdFreteRequest,
  ): Promise<OrderUpdFreteResponse> {
    try {
      const validatedParams = OrderUpdFreteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdFreteResponse>(
        ORDER_UPD_ENDPOINTS.UPD_FRETE_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar frete do pedido", error);
      throw error;
    }
  }

  async updateField(
    params: OrderUpdInlineFieldRequest,
  ): Promise<OrderUpdInlineFieldResponse> {
    try {
      const validatedParams = OrderUpdInlineFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdInlineFieldResponse>(
        ORDER_UPD_ENDPOINTS.UPD_INLINE_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar campo inline do pedido", error);
      throw error;
    }
  }

  async updateNotes(
    params: OrderUpdNotesRequest,
  ): Promise<OrderUpdNotesResponse> {
    try {
      const validatedParams = OrderUpdNotesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdNotesResponse>(
        ORDER_UPD_ENDPOINTS.UPD_NOTES_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações do pedido", error);
      throw error;
    }
  }

  async updatePgMethod(
    params: OrderUpdPgMethodRequest,
  ): Promise<OrderUpdPgMethodResponse> {
    try {
      const validatedParams = OrderUpdPgMethodSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdPgMethodResponse>(
        ORDER_UPD_ENDPOINTS.UPD_PG_METHOD_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar método de pagamento do pedido", error);
      throw error;
    }
  }

  async updateSeller(
    params: OrderUpdSellerRequest,
  ): Promise<OrderUpdSellerResponse> {
    try {
      const validatedParams = OrderUpdSellerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdSellerResponse>(
        ORDER_UPD_ENDPOINTS.UPD_SELLER_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar vendedor do pedido", error);
      throw error;
    }
  }

  async updateStatus(
    params: OrderUpdStatusRequest,
  ): Promise<OrderUpdStatusResponse> {
    try {
      const validatedParams = OrderUpdStatusSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderUpdStatusResponse>(
        ORDER_UPD_ENDPOINTS.UPD_STATUS_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar status do pedido", error);
      throw error;
    }
  }

  extractStoredProcedureResult(response: {
    data: StoredProcedureResponse[];
  }): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const orderUpdServiceApi = new OrderUpdServiceApi();
