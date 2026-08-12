import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  ORDER_ITEMS_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderItemDetailEntity,
  OrderItemListEntity,
  OrderItemsDeleteRequest,
  OrderItemsDeleteResponse,
  OrderItemsDiscountAdmRequest,
  OrderItemsDiscountAdmResponse,
  OrderItemsDiscountRequest,
  OrderItemsDiscountResponse,
  OrderItemsFindAllRequest,
  OrderItemsFindAllResponse,
  OrderItemsFindByIdRequest,
  OrderItemsFindByIdResponse,
  OrderItemsFreteVlRequest,
  OrderItemsFreteVlResponse,
  OrderItemsInlineFieldRequest,
  OrderItemsInlineFieldResponse,
  OrderItemsInsuranceVlRequest,
  OrderItemsInsuranceVlResponse,
  OrderItemsNotesRequest,
  OrderItemsNotesResponse,
  OrderItemsQtRequest,
  OrderItemsQtResponse,
  OrderItemsValueRequest,
  OrderItemsValueResponse,
  StoredProcedureResponse,
} from "./types/order-items-types";
import {
  OrderItemsError,
  OrderItemsNotFoundError,
} from "./types/order-items-types";
import {
  OrderItemsDeleteSchema,
  OrderItemsDiscountAdmSchema,
  OrderItemsDiscountSchema,
  OrderItemsFindAllSchema,
  OrderItemsFindByIdSchema,
  OrderItemsFreteVlSchema,
  OrderItemsInlineFieldSchema,
  OrderItemsInsuranceVlSchema,
  OrderItemsNotesSchema,
  OrderItemsQtSchema,
  OrderItemsValueSchema,
} from "./validation/order-items-schemas";

const logger = createLogger("OrderItemsServiceApi");

export class OrderItemsServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllOrderItems(
    params: Partial<OrderItemsFindAllRequest> = {},
  ): Promise<OrderItemsFindAllResponse> {
    try {
      const validatedParams = OrderItemsFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_order_id: validatedParams.pe_order_id ?? 0,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<OrderItemsFindAllResponse>(
        ORDER_ITEMS_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os itens de pedido", error);
      throw error;
    }
  }

  async findOrderItemById(
    params: OrderItemsFindByIdRequest,
  ): Promise<OrderItemsFindByIdResponse> {
    try {
      const validatedParams = OrderItemsFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsFindByIdResponse>(
        ORDER_ITEMS_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new OrderItemsNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new OrderItemsError(
          response.message || "Erro ao buscar item de pedido por ID",
          "ORDER_ITEMS_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar item de pedido por ID", error);
      throw error;
    }
  }

  async deleteOrderItem(
    params: OrderItemsDeleteRequest,
  ): Promise<OrderItemsDeleteResponse> {
    try {
      const validatedParams = OrderItemsDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsDeleteResponse>(
        ORDER_ITEMS_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir item de pedido", error);
      throw error;
    }
  }

  async updateField(
    params: OrderItemsInlineFieldRequest,
  ): Promise<OrderItemsInlineFieldResponse> {
    try {
      const validatedParams = OrderItemsInlineFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsInlineFieldResponse>(
        ORDER_ITEMS_ENDPOINTS.UPD_INLINE_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar campo inline do item de pedido", error);
      throw error;
    }
  }

  async updateDiscount(
    params: OrderItemsDiscountRequest,
  ): Promise<OrderItemsDiscountResponse> {
    try {
      const validatedParams = OrderItemsDiscountSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsDiscountResponse>(
        ORDER_ITEMS_ENDPOINTS.DISCOUNT,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar desconto do item", error);
      throw error;
    }
  }

  async updateDiscountAdm(
    params: OrderItemsDiscountAdmRequest,
  ): Promise<OrderItemsDiscountAdmResponse> {
    try {
      const validatedParams = OrderItemsDiscountAdmSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsDiscountAdmResponse>(
        ORDER_ITEMS_ENDPOINTS.DISCOUNT_ADM,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar desconto ADM do item", error);
      throw error;
    }
  }

  async updateFreteVl(
    params: OrderItemsFreteVlRequest,
  ): Promise<OrderItemsFreteVlResponse> {
    try {
      const validatedParams = OrderItemsFreteVlSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsFreteVlResponse>(
        ORDER_ITEMS_ENDPOINTS.FRETE_VL,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar frete do item", error);
      throw error;
    }
  }

  async updateInsuranceVl(
    params: OrderItemsInsuranceVlRequest,
  ): Promise<OrderItemsInsuranceVlResponse> {
    try {
      const validatedParams = OrderItemsInsuranceVlSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsInsuranceVlResponse>(
        ORDER_ITEMS_ENDPOINTS.INSURANCE_VL,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar seguro do item", error);
      throw error;
    }
  }

  async updateNotes(
    params: OrderItemsNotesRequest,
  ): Promise<OrderItemsNotesResponse> {
    try {
      const validatedParams = OrderItemsNotesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsNotesResponse>(
        ORDER_ITEMS_ENDPOINTS.NOTES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações do item", error);
      throw error;
    }
  }

  async updateQuantity(
    params: OrderItemsQtRequest,
  ): Promise<OrderItemsQtResponse> {
    try {
      const validatedParams = OrderItemsQtSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsQtResponse>(
        ORDER_ITEMS_ENDPOINTS.QT,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar quantidade do item", error);
      throw error;
    }
  }

  async updateValue(
    params: OrderItemsValueRequest,
  ): Promise<OrderItemsValueResponse> {
    try {
      const validatedParams = OrderItemsValueSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemsValueResponse>(
        ORDER_ITEMS_ENDPOINTS.VALUE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar valor do item", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: {
    data: StoredProcedureResponse[];
  }): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new OrderItemsError(
        spResponse.sp_message || "Erro na operação de item de pedido",
        "ORDER_ITEMS_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: OrderItemsFindAllResponse,
  ): OrderItemsFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          orderItems: [],
        },
      };
    }
    return response;
  }

  extractOrderItems(
    response: OrderItemsFindAllResponse,
  ): OrderItemListEntity[] {
    return response.data?.orderItems ?? [];
  }

  extractOrderItemById(
    response: OrderItemsFindByIdResponse,
  ): OrderItemDetailEntity | null {
    return response.data?.orderItem?.[0] ?? null;
  }

  extractStoredProcedureResult(response: {
    data: StoredProcedureResponse[];
  }): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidOrderItemList(response: OrderItemsFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data.orderItems)
    );
  }

  isValidOrderItemDetail(response: OrderItemsFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data.orderItem) &&
      response.data.orderItem.length > 0
    );
  }
}

export const orderItemsServiceApi = new OrderItemsServiceApi();
