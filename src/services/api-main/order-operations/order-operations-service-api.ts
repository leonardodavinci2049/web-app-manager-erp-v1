import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { ORDER_OPERATIONS_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderOperAddItemRequest,
  OrderOperAddItemResponse,
  OrderOperCloseRequest,
  OrderOperCloseResponse,
  OrderOperCreateRequest,
  OrderOperCreateResponse,
  OrderOperReverseRequest,
  OrderOperReverseResponse,
  OrderOperSendingByEmailRequest,
  OrderOperSendingByEmailResponse,
  StoredProcedureResponse,
} from "./types/order-operations-types";
import { OrderOperationsError } from "./types/order-operations-types";
import {
  OrderOperAddItemSchema,
  OrderOperCloseSchema,
  OrderOperCreateSchema,
  OrderOperReverseSchema,
  OrderOperSendingByEmailSchema,
} from "./validation/order-operations-schemas";

const logger = createLogger("OrderOperationsServiceApi");

export class OrderOperationsServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async createOrder(
    params: OrderOperCreateRequest,
  ): Promise<OrderOperCreateResponse> {
    try {
      const validatedParams = OrderOperCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderOperCreateResponse>(
        ORDER_OPERATIONS_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar pedido", error);
      throw error;
    }
  }

  async addItem(
    params: OrderOperAddItemRequest,
  ): Promise<OrderOperAddItemResponse> {
    try {
      const validatedParams = OrderOperAddItemSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderOperAddItemResponse>(
        ORDER_OPERATIONS_ENDPOINTS.ADD_ITEM,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao adicionar item ao pedido", error);
      throw error;
    }
  }

  async closeOrder(
    params: OrderOperCloseRequest,
  ): Promise<OrderOperCloseResponse> {
    try {
      const validatedParams = OrderOperCloseSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderOperCloseResponse>(
        ORDER_OPERATIONS_ENDPOINTS.CLOSE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao fechar pedido", error);
      throw error;
    }
  }

  async reverseOrder(
    params: OrderOperReverseRequest,
  ): Promise<OrderOperReverseResponse> {
    try {
      const validatedParams = OrderOperReverseSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderOperReverseResponse>(
        ORDER_OPERATIONS_ENDPOINTS.REVERSE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao estornar pedido", error);
      throw error;
    }
  }

  async sendByEmail(
    params: OrderOperSendingByEmailRequest,
  ): Promise<OrderOperSendingByEmailResponse> {
    try {
      const validatedParams = OrderOperSendingByEmailSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderOperSendingByEmailResponse>(
        ORDER_OPERATIONS_ENDPOINTS.SENDING_BY_EMAIL,
        requestBody,
      );

      return response;
    } catch (error) {
      logger.error("Erro ao enviar pedido por e-mail", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: {
    data: StoredProcedureResponse[];
  }): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new OrderOperationsError(
        spResponse.sp_message || "Erro na operação de pedido",
        "ORDER_OPERATIONS_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(response: {
    data: StoredProcedureResponse[];
  }): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const orderOperationsServiceApi = new OrderOperationsServiceApi();
