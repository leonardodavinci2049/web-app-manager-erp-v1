import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  ORDER_REPORTS_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderCustomerAllEntity,
  OrderCustomerInfoEntity,
  OrderFindCustomerAllResponse,
  OrderFindCustomerIdResponse,
  OrderFindLatestAllResponse,
  OrderFindLatestIdResponse,
  OrderFindSaleAllResponse,
  OrderFindSaleIdResponse,
  OrderFindSellerAllResponse,
  OrderReportItemEntity,
  OrderReportListEntity,
  OrderReportsFindAllFilters,
  OrderReportsFindByIdRequest,
  OrderSaleDetailEntity,
  OrderSellerInfoEntity,
  OrderShippingInfoEntity,
  OrderStatusHistoryEntity,
  OrderSummaryEntity,
  OrderTradingInfoEntity,
} from "./types/order-reports-types";
import {
  OrderReportsError,
  OrderReportsNotFoundError,
} from "./types/order-reports-types";
import {
  OrderReportsFindAllSchema,
  OrderReportsFindByIdSchema,
} from "./validation/order-reports-schemas";

const logger = createLogger("OrderReportsServiceApi");

export class OrderReportsServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  // === Métodos de consulta ===

  async orderFindCustomerAll(
    params: Partial<OrderReportsFindAllFilters> = {},
  ): Promise<OrderFindCustomerAllResponse> {
    try {
      const validatedParams = OrderReportsFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_order_id: validatedParams.pe_order_id ?? 0,
        pe_customer_id: validatedParams.pe_customer_id ?? 0,
        pe_seller_id: validatedParams.pe_seller_id ?? 0,
        pe_order_status_id: validatedParams.pe_order_status_id ?? 0,
        pe_financial_status_id: validatedParams.pe_financial_status_id ?? 0,
        pe_location_id: validatedParams.pe_location_id ?? 0,
        pe_initial_date: validatedParams.pe_initial_date,
        pe_final_date: validatedParams.pe_final_date,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<OrderFindCustomerAllResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_CUSTOMER_ALL,
        requestBody,
      );

      return this.normalizeEmptyListResponse<OrderFindCustomerAllResponse>(
        response,
        "customer orders",
      );
    } catch (error) {
      logger.error("Erro ao buscar pedidos por cliente", error);
      throw error;
    }
  }

  async orderFindCustomerId(
    params: OrderReportsFindByIdRequest,
  ): Promise<OrderFindCustomerIdResponse> {
    try {
      const validatedParams = OrderReportsFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindCustomerIdResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_CUSTOMER_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new OrderReportsNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new OrderReportsError(
          response.message || "Erro ao buscar pedido do cliente por ID",
          "ORDER_REPORTS_FIND_CUSTOMER_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar pedido do cliente por ID", error);
      throw error;
    }
  }

  async orderFindLatestAll(
    params: Partial<OrderReportsFindAllFilters> = {},
  ): Promise<OrderFindLatestAllResponse> {
    try {
      const validatedParams = OrderReportsFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_order_id: validatedParams.pe_order_id ?? 0,
        pe_customer_id: validatedParams.pe_customer_id ?? 0,
        pe_seller_id: validatedParams.pe_seller_id ?? 0,
        pe_order_status_id: validatedParams.pe_order_status_id ?? 0,
        pe_financial_status_id: validatedParams.pe_financial_status_id ?? 0,
        pe_location_id: validatedParams.pe_location_id ?? 0,
        pe_initial_date: validatedParams.pe_initial_date,
        pe_final_date: validatedParams.pe_final_date,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<OrderFindLatestAllResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_LATEST_ALL,
        requestBody,
      );

      return this.normalizeEmptyListResponse<OrderFindLatestAllResponse>(
        response,
        "Last orders",
      );
    } catch (error) {
      logger.error("Erro ao buscar últimos pedidos", error);
      throw error;
    }
  }

  async orderFindLatestId(
    params: OrderReportsFindByIdRequest,
  ): Promise<OrderFindLatestIdResponse> {
    try {
      const validatedParams = OrderReportsFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindLatestIdResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_LATEST_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new OrderReportsNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new OrderReportsError(
          response.message || "Erro ao buscar último pedido por ID",
          "ORDER_REPORTS_FIND_LATEST_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar último pedido por ID", error);
      throw error;
    }
  }

  async orderFindSaleAll(
    params: Partial<OrderReportsFindAllFilters> = {},
  ): Promise<OrderFindSaleAllResponse> {
    try {
      const validatedParams = OrderReportsFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_order_id: validatedParams.pe_order_id ?? 0,
        pe_customer_id: validatedParams.pe_customer_id ?? 0,
        pe_seller_id: validatedParams.pe_seller_id ?? 0,
        pe_order_status_id: validatedParams.pe_order_status_id ?? 0,
        pe_financial_status_id: validatedParams.pe_financial_status_id ?? 0,
        pe_location_id: validatedParams.pe_location_id ?? 0,
        pe_initial_date: validatedParams.pe_initial_date,
        pe_final_date: validatedParams.pe_final_date,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<OrderFindSaleAllResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_SALE_ALL,
        requestBody,
      );

      return this.normalizeEmptyListResponse<OrderFindSaleAllResponse>(
        response,
        "Orders Sale All",
      );
    } catch (error) {
      logger.error("Erro ao buscar todas as vendas", error);
      throw error;
    }
  }

  async orderFindSaleId(
    params: OrderReportsFindByIdRequest,
  ): Promise<OrderFindSaleIdResponse> {
    try {
      const validatedParams = OrderReportsFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderFindSaleIdResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_SALE_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new OrderReportsNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new OrderReportsError(
          response.message || "Erro ao buscar venda por ID",
          "ORDER_REPORTS_FIND_SALE_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar venda por ID", error);
      throw error;
    }
  }

  async orderFindSellerAll(
    params: Partial<OrderReportsFindAllFilters> = {},
  ): Promise<OrderFindSellerAllResponse> {
    try {
      const validatedParams = OrderReportsFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_order_id: validatedParams.pe_order_id ?? 0,
        pe_customer_id: validatedParams.pe_customer_id ?? 0,
        pe_seller_id: validatedParams.pe_seller_id ?? 0,
        pe_order_status_id: validatedParams.pe_order_status_id ?? 0,
        pe_financial_status_id: validatedParams.pe_financial_status_id ?? 0,
        pe_location_id: validatedParams.pe_location_id ?? 0,
        pe_initial_date: validatedParams.pe_initial_date,
        pe_final_date: validatedParams.pe_final_date,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<OrderFindSellerAllResponse>(
        ORDER_REPORTS_ENDPOINTS.FIND_SELLER_ALL,
        requestBody,
      );

      return this.normalizeEmptyListResponse<OrderFindSellerAllResponse>(
        response,
        "seller orders",
      );
    } catch (error) {
      logger.error("Erro ao buscar pedidos por vendedor", error);
      throw error;
    }
  }

  // === Métodos auxiliares ===

  private normalizeEmptyListResponse<
    T extends { statusCode: number; data: Record<string, unknown[]> },
  >(response: T, dataKey: string): T {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          [dataKey]: [],
        },
      } as T;
    }
    return response;
  }

  // === Extractors para listas ===

  extractOrderFindCustomerAll(
    response: OrderFindCustomerAllResponse,
  ): OrderCustomerAllEntity[] {
    return response.data?.["customer orders"] ?? [];
  }

  extractOrderFindLatestAll(
    response: OrderFindLatestAllResponse,
  ): OrderReportListEntity[] {
    return response.data?.["Last orders"] ?? [];
  }

  extractOrderFindSaleAll(
    response: OrderFindSaleAllResponse,
  ): OrderReportListEntity[] {
    return response.data?.["Orders Sale All"] ?? [];
  }

  extractOrderFindSellerAll(
    response: OrderFindSellerAllResponse,
  ): OrderReportListEntity[] {
    return response.data?.["seller orders"] ?? [];
  }

  // === Extractors para detalhe (by ID) ===

  extractOrderFindCustomerIdSummary(
    response: OrderFindCustomerIdResponse,
  ): OrderSummaryEntity | null {
    return response.data?.["Customer Orders Summary"]?.[0] ?? null;
  }

  extractOrderFindCustomerIdItems(
    response: OrderFindCustomerIdResponse,
  ): OrderReportItemEntity[] {
    return response.data?.["Customer Order Items"] ?? [];
  }

  extractOrderFindCustomerIdStatusHistory(
    response: OrderFindCustomerIdResponse,
  ): OrderStatusHistoryEntity | null {
    return response.data?.["Status History"]?.[0] ?? null;
  }

  extractOrderFindCustomerIdCustomerInfo(
    response: OrderFindCustomerIdResponse,
  ): OrderCustomerInfoEntity | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractOrderFindCustomerIdSellerInfo(
    response: OrderFindCustomerIdResponse,
  ): OrderSellerInfoEntity | null {
    return response.data?.["Seller Information"]?.[0] ?? null;
  }

  extractOrderFindLatestIdSummary(
    response: OrderFindLatestIdResponse,
  ): OrderSummaryEntity | null {
    return response.data?.["Latest Orders Summary"]?.[0] ?? null;
  }

  extractOrderFindLatestIdItems(
    response: OrderFindLatestIdResponse,
  ): OrderReportItemEntity[] {
    return response.data?.["Latest Order Items"] ?? [];
  }

  extractOrderFindLatestIdStatusHistory(
    response: OrderFindLatestIdResponse,
  ): OrderStatusHistoryEntity | null {
    return response.data?.["Status History"]?.[0] ?? null;
  }

  extractOrderFindLatestIdCustomerInfo(
    response: OrderFindLatestIdResponse,
  ): OrderCustomerInfoEntity | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractOrderFindLatestIdSellerInfo(
    response: OrderFindLatestIdResponse,
  ): OrderSellerInfoEntity | null {
    return response.data?.["Seller Information"]?.[0] ?? null;
  }

  extractOrderFindSaleIdSummary(
    response: OrderFindSaleIdResponse,
  ): OrderSummaryEntity | null {
    return response.data?.["Order Summary"]?.[0] ?? null;
  }

  extractOrderFindSaleIdItems(
    response: OrderFindSaleIdResponse,
  ): OrderSaleDetailEntity[] {
    return response.data?.["Order Items"] ?? [];
  }

  extractOrderFindSaleIdCustomerInfo(
    response: OrderFindSaleIdResponse,
  ): OrderCustomerInfoEntity | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractOrderFindSaleIdSellerInfo(
    response: OrderFindSaleIdResponse,
  ): OrderSellerInfoEntity | null {
    return response.data?.["Seller Information"]?.[0] ?? null;
  }

  extractOrderFindSaleIdTradingInfo(
    response: OrderFindSaleIdResponse,
  ): OrderTradingInfoEntity | null {
    return response.data?.["Trading Information"]?.[0] ?? null;
  }

  extractOrderFindSaleIdShippingInfo(
    response: OrderFindSaleIdResponse,
  ): OrderShippingInfoEntity | null {
    return response.data?.["Shipping Information"]?.[0] ?? null;
  }

  // === Validators ===

  isValidOrderFindCustomerAllList(
    response: OrderFindCustomerAllResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["customer orders"])
    );
  }

  isValidOrderFindLatestAllList(response: OrderFindLatestAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Last orders"])
    );
  }

  isValidOrderFindSaleAllList(response: OrderFindSaleAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Orders Sale All"])
    );
  }

  isValidOrderFindSellerAllList(response: OrderFindSellerAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["seller orders"])
    );
  }
}

export const orderReportsServiceApi = new OrderReportsServiceApi();
