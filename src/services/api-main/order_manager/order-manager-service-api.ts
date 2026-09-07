import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  ORDER_MANAGER_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformOrdersManagerCustomer,
  transformOrdersManagerData,
  transformOrdersManagerOrderItems,
  transformOrdersManagerOrderList,
  transformOrdersManagerSeller,
  transformOrdersManagerStatusHistory,
  type UIOrdersManagerCustomer,
  type UIOrdersManagerOrder,
  type UIOrdersManagerOrderData,
  type UIOrdersManagerOrderItem,
  type UIOrdersManagerSeller,
  type UIOrdersManagerStatusHistory,
} from "./transformers/transformers";
import type {
  OrdersManagerCustomer,
  OrdersManagerData,
  OrdersManagerFindAllRequest,
  OrdersManagerFindAllResponse,
  OrdersManagerFindByIdRequest,
  OrdersManagerFindByIdResponse,
  OrdersManagerListItem,
  OrdersManagerOrderItem,
  OrdersManagerSeller,
  OrdersManagerStatusHistory,
} from "./types/order-manager-types";
import {
  OrderManagerError,
  OrderManagerNotFoundError,
} from "./types/order-manager-types";
import {
  OrdersManagerFindAllSchema,
  OrdersManagerFindByIdSchema,
} from "./validation/order-manager-schemas";

const logger = createLogger("OrderManagerServiceApi");

export class OrderManagerServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllOrdersManager(
    params: OrdersManagerFindAllRequest,
  ): Promise<OrdersManagerFindAllResponse> {
    try {
      const validatedParams = OrdersManagerFindAllSchema.parse(params);
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
        pe_delivery_status_id: validatedParams.pe_delivery_status_id ?? 0,
        pe_location_id: validatedParams.pe_location_id ?? 0,
        pe_start_date: validatedParams.pe_start_date,
        pe_end_date: validatedParams.pe_end_date,
        pe_records_per_page: validatedParams.pe_records_per_page ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_sort_column_id: validatedParams.pe_sort_column_id,
        pe_sort_order_id: validatedParams.pe_sort_order_id,
      });

      const response = await this.post<OrdersManagerFindAllResponse>(
        ORDER_MANAGER_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error(
        "Erro ao buscar todos os pedidos do gestor de pedidos",
        error,
      );
      throw error;
    }
  }

  async findOrdersManagerById(
    params: OrdersManagerFindByIdRequest,
  ): Promise<OrdersManagerFindByIdResponse> {
    try {
      const validatedParams = OrdersManagerFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrdersManagerFindByIdResponse>(
        ORDER_MANAGER_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new OrderManagerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new OrderManagerError(
          response.message ||
            "Erro ao buscar pedido do gestor de pedidos por ID",
          "ORDER_MANAGER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar pedido do gestor de pedidos por ID", error);
      throw error;
    }
  }

  private normalizeEmptyFindAllResponse(
    response: OrdersManagerFindAllResponse,
  ): OrdersManagerFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          ordersFindAll: [],
        },
      };
    }
    return response;
  }

  extractOrdersManagerOrders(
    response: OrdersManagerFindAllResponse,
  ): OrdersManagerListItem[] {
    return response.data?.ordersFindAll ?? [];
  }

  extractOrdersManagerOrderData(
    response: OrdersManagerFindByIdResponse,
  ): OrdersManagerData | null {
    return response.data?.ordersData?.[0] ?? null;
  }

  extractOrdersManagerOrderItems(
    response: OrdersManagerFindByIdResponse,
  ): OrdersManagerOrderItem[] {
    return response.data?.ordersItems ?? [];
  }

  extractOrdersManagerStatusHistory(
    response: OrdersManagerFindByIdResponse,
  ): OrdersManagerStatusHistory | null {
    return response.data?.ordersStatusHistory?.[0] ?? null;
  }

  extractOrdersManagerCustomer(
    response: OrdersManagerFindByIdResponse,
  ): OrdersManagerCustomer | null {
    return response.data?.ordersCustomer?.[0] ?? null;
  }

  extractOrdersManagerSeller(
    response: OrdersManagerFindByIdResponse,
  ): OrdersManagerSeller | null {
    return response.data?.ordersSeller?.[0] ?? null;
  }

  isValidOrdersManagerList(response: OrdersManagerFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data.ordersFindAll)
    );
  }

  isValidOrdersManagerDetail(response: OrdersManagerFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data.ordersData) &&
      response.data.ordersData.length > 0
    );
  }
}

export const orderManagerServiceApi = new OrderManagerServiceApi();

export interface GetOrdersManagerOrdersParams {
  startDate: string;
  endDate: string;
  orderId?: number;
  customerId?: number;
  sellerId?: number;
  orderStatusId?: number;
  financialStatusId?: number;
  deliveryStatusId?: number;
  locationId?: number;
  recordsPerPage?: number;
  pageId?: number;
  sortColumnId?: 1 | 2 | 3;
  sortOrderId?: 1 | 2;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

export async function getOrdersManagerOrders(
  params: GetOrdersManagerOrdersParams,
): Promise<{ orders: UIOrdersManagerOrder[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { orders: [], total: 0 };
  }

  const response = await orderManagerServiceApi.findAllOrdersManager({
    pe_order_id: params.orderId,
    pe_customer_id: params.customerId,
    pe_seller_id: params.sellerId,
    pe_order_status_id: params.orderStatusId,
    pe_financial_status_id: params.financialStatusId,
    pe_delivery_status_id: params.deliveryStatusId,
    pe_location_id: params.locationId,
    pe_start_date: params.startDate,
    pe_end_date: params.endDate,
    pe_records_per_page: params.recordsPerPage,
    pe_page_id: params.pageId,
    pe_sort_column_id: params.sortColumnId,
    pe_sort_order_id: params.sortOrderId,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const orders = orderManagerServiceApi.extractOrdersManagerOrders(response);
  const filteredTotal = Number(response.recordId);

  return {
    orders: transformOrdersManagerOrderList(orders),
    total:
      Number.isFinite(filteredTotal) && filteredTotal >= 0
        ? filteredTotal
        : (response.quantity ?? orders.length),
  };
}

export async function getOrdersManagerOrderById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<
  | {
      data: UIOrdersManagerOrderData;
      items: UIOrdersManagerOrderItem[];
      statusHistory: UIOrdersManagerStatusHistory | null;
      customer: UIOrdersManagerCustomer | null;
      seller: UIOrdersManagerSeller | null;
    }
  | undefined
> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderManagerServiceApi.findOrdersManagerById({
    pe_order_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const orderDataEntity =
    orderManagerServiceApi.extractOrdersManagerOrderData(response);
  if (!orderDataEntity) {
    return undefined;
  }

  const statusHistoryEntity =
    orderManagerServiceApi.extractOrdersManagerStatusHistory(response);
  const customerEntity =
    orderManagerServiceApi.extractOrdersManagerCustomer(response);
  const sellerEntity =
    orderManagerServiceApi.extractOrdersManagerSeller(response);

  return {
    data: transformOrdersManagerData(orderDataEntity),
    items: transformOrdersManagerOrderItems(
      orderManagerServiceApi.extractOrdersManagerOrderItems(response),
    ),
    statusHistory: statusHistoryEntity
      ? transformOrdersManagerStatusHistory(statusHistoryEntity)
      : null,
    customer: customerEntity
      ? transformOrdersManagerCustomer(customerEntity)
      : null,
    seller: sellerEntity ? transformOrdersManagerSeller(sellerEntity) : null,
  };
}
