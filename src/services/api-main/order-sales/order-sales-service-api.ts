import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  ORDER_SALES_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderCarrierEntity,
  OrderCustomerEntity,
  OrderDashboardDetailsEntity,
  OrderDashboardItemEntity,
  OrderDeliveryEntity,
  OrderEquipmentEntity,
  OrderFindCoCarrierIdResponse,
  OrderFindCoCustomerIdResponse,
  OrderFindCoDeliveryIdResponse,
  OrderFindCoHistoryIdResponse,
  OrderFindCoNfIdResponse,
  OrderFindCoPgFormaIdResponse,
  OrderFindCoProtocolIdResponse,
  OrderFindCoSellerIdResponse,
  OrderFindCoSummaryIdResponse,
  OrderFindCoTipoFreteResponse,
  OrderFindDashboardIdResponse,
  OrderFindEquipmentIdResponse,
  OrderHistoryEntity,
  OrderNfEntity,
  OrderPgFormaEntity,
  OrderProtocolEntity,
  OrderSalesDashboardRequest,
  OrderSalesFindByIdRequest,
  OrderSalesFindTipoFreteRequest,
  OrderSalesSummaryEntity,
  OrderSellerEntity,
  OrderTipoFreteEntity,
} from "./types/order-sales-types";
import {
  OrderSalesError,
  OrderSalesNotFoundError,
} from "./types/order-sales-types";
import {
  OrderSalesDashboardSchema,
  OrderSalesFindByIdSchema,
  OrderSalesFindTipoFreteSchema,
} from "./validation/order-sales-schemas";

const logger = createLogger("OrderSalesServiceApi");

export class OrderSalesServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  private async findById<T extends { statusCode: number; message: string }>(
    endpoint: string,
    params: OrderSalesFindByIdRequest,
    errorLabel: string,
  ): Promise<T> {
    const validatedParams = OrderSalesFindByIdSchema.parse(params);
    const requestBody = this.buildBasePayload(validatedParams);

    const response = await this.post<T>(endpoint, requestBody);

    if (
      (response as { statusCode: number }).statusCode ===
      API_STATUS_CODES.NOT_FOUND
    ) {
      throw new OrderSalesNotFoundError(validatedParams);
    }

    if (isApiError((response as { statusCode: number }).statusCode)) {
      throw new OrderSalesError(
        (response as { message: string }).message ||
          `Erro ao buscar ${errorLabel}`,
        `ORDER_SALES_${errorLabel.toUpperCase().replace(/ /g, "_")}_ERROR`,
        (response as { statusCode: number }).statusCode,
      );
    }

    return response;
  }

  // === Métodos de consulta ===

  async findCoCarrierId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoCarrierIdResponse> {
    try {
      return await this.findById<OrderFindCoCarrierIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_CARRIER_ID,
        params,
        "transportadora do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar transportadora do pedido", error);
      throw error;
    }
  }

  async findCoCustomerId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoCustomerIdResponse> {
    try {
      return await this.findById<OrderFindCoCustomerIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_CUSTOMER_ID,
        params,
        "cliente do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar cliente do pedido", error);
      throw error;
    }
  }

  async findCoDeliveryId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoDeliveryIdResponse> {
    try {
      return await this.findById<OrderFindCoDeliveryIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_DELIVERY_ID,
        params,
        "entrega do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar entrega do pedido", error);
      throw error;
    }
  }

  async findCoHistoryId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoHistoryIdResponse> {
    try {
      return await this.findById<OrderFindCoHistoryIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_HISTORY_ID,
        params,
        "histórico do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar histórico do pedido", error);
      throw error;
    }
  }

  async findCoNfId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoNfIdResponse> {
    try {
      return await this.findById<OrderFindCoNfIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_NF_ID,
        params,
        "nota fiscal do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar nota fiscal do pedido", error);
      throw error;
    }
  }

  async findCoPgFormaId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoPgFormaIdResponse> {
    try {
      return await this.findById<OrderFindCoPgFormaIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_PG_FORMA_ID,
        params,
        "forma de pagamento do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar forma de pagamento do pedido", error);
      throw error;
    }
  }

  async findCoProtocolId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoProtocolIdResponse> {
    try {
      return await this.findById<OrderFindCoProtocolIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_PROTOCOL_ID,
        params,
        "protocolo do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar protocolo do pedido", error);
      throw error;
    }
  }

  async findCoSellerId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoSellerIdResponse> {
    try {
      return await this.findById<OrderFindCoSellerIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_SELLER_ID,
        params,
        "vendedor do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar vendedor do pedido", error);
      throw error;
    }
  }

  async findCoSummaryId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindCoSummaryIdResponse> {
    try {
      return await this.findById<OrderFindCoSummaryIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_SUMMARY_ID,
        params,
        "resumo do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar resumo do pedido", error);
      throw error;
    }
  }

  async findCoTipoFrete(
    params: OrderSalesFindTipoFreteRequest,
  ): Promise<OrderFindCoTipoFreteResponse> {
    try {
      const validatedParams = OrderSalesFindTipoFreteSchema.parse(params);

      return await this.findById<OrderFindCoTipoFreteResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CO_TIPO_FRETE,
        validatedParams,
        "tipos de frete do cliente",
      );
    } catch (error) {
      logger.error("Erro ao buscar tipos de frete do cliente", error);
      throw error;
    }
  }

  async findCartId(
    params: OrderSalesDashboardRequest,
  ): Promise<OrderFindDashboardIdResponse | null> {
    try {
      const validatedParams = OrderSalesDashboardSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindDashboardIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_CART_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        logger.warn(
          `Cart não encontrado para os parâmetros: orderId=${params.pe_order_id}, customerId=${params.pe_id_customer}`,
        );
        return null;
      }

      if (isApiError(response.statusCode)) {
        throw new OrderSalesError(
          response.message || "Erro ao buscar cart do pedido",
          "ORDER_SALES_CART_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar cart do pedido", error);
      throw error;
    }
  }

  async findOrderId(
    params: OrderSalesDashboardRequest,
  ): Promise<OrderFindDashboardIdResponse | null> {
    try {
      const validatedParams = OrderSalesDashboardSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindDashboardIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_ORDER_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        logger.warn(
          `Order não encontrado para os parâmetros: orderId=${params.pe_order_id}, customerId=${params.pe_id_customer}`,
        );
        return null;
      }

      if (isApiError(response.statusCode)) {
        throw new OrderSalesError(
          response.message || "Erro ao buscar order do pedido",
          "ORDER_SALES_ORDER_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar order do pedido", error);
      throw error;
    }
  }

  async findDashboardId(
    params: OrderSalesDashboardRequest,
  ): Promise<OrderFindDashboardIdResponse | null> {
    try {
      const validatedParams = OrderSalesDashboardSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindDashboardIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_DASHBOARD_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        logger.warn(
          `Dashboard não encontrado para os parâmetros: orderId=${params.pe_order_id}, sellerId=${params.pe_id_seller}`,
        );
        return null;
      }

      if (isApiError(response.statusCode)) {
        throw new OrderSalesError(
          response.message || "Erro ao buscar dashboard do pedido",
          "ORDER_SALES_DASHBOARD_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar dashboard do pedido", error);
      throw error;
    }
  }

  async findEquipmentId(
    params: OrderSalesFindByIdRequest,
  ): Promise<OrderFindEquipmentIdResponse> {
    try {
      return await this.findById<OrderFindEquipmentIdResponse>(
        ORDER_SALES_ENDPOINTS.FIND_EQUIPMENT_ID,
        params,
        "equipamento do pedido",
      );
    } catch (error) {
      logger.error("Erro ao buscar equipamento do pedido", error);
      throw error;
    }
  }

  // === Extractors ===

  extractCarrier(
    response: OrderFindCoCarrierIdResponse,
  ): OrderCarrierEntity | null {
    return response.data?.["Order Carrier"]?.[0] ?? null;
  }

  extractCustomer(
    response: OrderFindCoCustomerIdResponse,
  ): OrderCustomerEntity | null {
    return response.data?.["Order Customer"]?.[0] ?? null;
  }

  extractDelivery(
    response: OrderFindCoDeliveryIdResponse,
  ): OrderDeliveryEntity | null {
    return response.data?.["Order Delivery"]?.[0] ?? null;
  }

  extractHistory(
    response: OrderFindCoHistoryIdResponse,
  ): OrderHistoryEntity | null {
    return response.data?.["Order History"]?.[0] ?? null;
  }

  extractNf(response: OrderFindCoNfIdResponse): OrderNfEntity | null {
    return response.data?.["Order Nf"]?.[0] ?? null;
  }

  extractPgForma(
    response: OrderFindCoPgFormaIdResponse,
  ): OrderPgFormaEntity | null {
    return response.data?.["Order Pg Forma"]?.[0] ?? null;
  }

  extractProtocol(
    response: OrderFindCoProtocolIdResponse,
  ): OrderProtocolEntity | null {
    return response.data?.["Order Protocol"]?.[0] ?? null;
  }

  extractSeller(
    response: OrderFindCoSellerIdResponse,
  ): OrderSellerEntity | null {
    return response.data?.["Order Seller"]?.[0] ?? null;
  }

  extractSummary(
    response: OrderFindCoSummaryIdResponse,
  ): OrderSalesSummaryEntity | null {
    return response.data?.["Order Summary"]?.[0] ?? null;
  }

  extractTipoFrete(
    response: OrderFindCoTipoFreteResponse,
  ): OrderTipoFreteEntity[] {
    return response.data?.["Order Tipo Frete"] ?? [];
  }

  extractDashboardSummary(
    response: OrderFindDashboardIdResponse,
  ): OrderSalesSummaryEntity | null {
    return response.data?.["Order Summary"]?.[0] ?? null;
  }

  extractDashboardDetails(
    response: OrderFindDashboardIdResponse,
  ): OrderDashboardDetailsEntity | null {
    return response.data?.["Order Details"]?.[0] ?? null;
  }

  extractDashboardItems(
    response: OrderFindDashboardIdResponse,
  ): OrderDashboardItemEntity[] {
    return response.data?.["Order Items"] ?? [];
  }

  extractDashboardCustomer(
    response: OrderFindDashboardIdResponse,
  ): OrderCustomerEntity | null {
    return response.data?.["Customer Details"]?.[0] ?? null;
  }

  extractEquipment(
    response: OrderFindEquipmentIdResponse,
  ): OrderEquipmentEntity | null {
    return response.data?.["Order Equipment"]?.[0] ?? null;
  }
}

export const orderSalesServiceApi = new OrderSalesServiceApi();
