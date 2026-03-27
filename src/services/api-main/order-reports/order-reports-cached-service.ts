import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { orderReportsServiceApi } from "./order-reports-service-api";
import {
  transformCustomerAllList,
  transformCustomerInfoEntity,
  transformReportItemEntity,
  transformReportList,
  transformSaleDetailEntity,
  transformSellerInfoEntity,
  transformShippingInfoEntity,
  transformStatusHistoryEntity,
  transformSummaryEntity,
  transformTradingInfoEntity,
  type UIOrderCustomerInfo,
  type UIOrderListItem,
  type UIOrderReportItem,
  type UIOrderReportListItem,
  type UIOrderSaleDetail,
  type UIOrderSellerInfo,
  type UIOrderShippingInfo,
  type UIOrderStatusHistory,
  type UIOrderSummary,
  type UIOrderTradingInfo,
} from "./transformers/transformers";

interface BaseParams {
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface FindAllParams extends BaseParams {
  orderId?: number;
  customerId?: number;
  sellerId?: number;
  orderStatusId?: number;
  financialStatusId?: number;
  locationId?: number;
  initialDate?: string;
  finalDate?: string;
  limit?: number;
}

export async function getCustomerOrders(
  params: FindAllParams = {},
): Promise<UIOrderListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await orderReportsServiceApi.findCustomerAll({
    pe_order_id: params.orderId,
    pe_customer_id: params.customerId,
    pe_seller_id: params.sellerId,
    pe_order_status_id: params.orderStatusId,
    pe_financial_status_id: params.financialStatusId,
    pe_location_id: params.locationId,
    pe_initial_date: params.initialDate,
    pe_final_date: params.finalDate,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = orderReportsServiceApi.extractCustomerAll(response);
  return transformCustomerAllList(items);
}

export interface UICustomerOrderDetail {
  summary: UIOrderSummary | null;
  items: UIOrderReportItem[];
  statusHistory: UIOrderStatusHistory | null;
  customerInfo: UIOrderCustomerInfo | null;
  sellerInfo: UIOrderSellerInfo | null;
}

export async function getCustomerOrderById(
  orderId: number,
  params: BaseParams & { typeBusiness?: number } = {},
): Promise<UICustomerOrderDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderReport(String(orderId)), CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderReportsServiceApi.findCustomerId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const summary = orderReportsServiceApi.extractCustomerIdSummary(response);
  const items = orderReportsServiceApi.extractCustomerIdItems(response);
  const history =
    orderReportsServiceApi.extractCustomerIdStatusHistory(response);
  const customer =
    orderReportsServiceApi.extractCustomerIdCustomerInfo(response);
  const seller = orderReportsServiceApi.extractCustomerIdSellerInfo(response);

  return {
    summary: summary ? transformSummaryEntity(summary) : null,
    items: items.map(transformReportItemEntity),
    statusHistory: history ? transformStatusHistoryEntity(history) : null,
    customerInfo: customer ? transformCustomerInfoEntity(customer) : null,
    sellerInfo: seller ? transformSellerInfoEntity(seller) : null,
  };
}

export async function getLatestOrders(
  params: FindAllParams = {},
): Promise<UIOrderReportListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await orderReportsServiceApi.findLatestAll({
    pe_order_id: params.orderId,
    pe_customer_id: params.customerId,
    pe_seller_id: params.sellerId,
    pe_order_status_id: params.orderStatusId,
    pe_financial_status_id: params.financialStatusId,
    pe_location_id: params.locationId,
    pe_initial_date: params.initialDate,
    pe_final_date: params.finalDate,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = orderReportsServiceApi.extractLatestAll(response);
  return transformReportList(items);
}

export interface UILatestOrderDetail {
  summary: UIOrderSummary | null;
  items: UIOrderReportItem[];
  statusHistory: UIOrderStatusHistory | null;
  customerInfo: UIOrderCustomerInfo | null;
  sellerInfo: UIOrderSellerInfo | null;
}

export async function getLatestOrderById(
  orderId: number,
  params: BaseParams & { typeBusiness?: number } = {},
): Promise<UILatestOrderDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderReport(String(orderId)), CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderReportsServiceApi.findLatestId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const summary = orderReportsServiceApi.extractLatestIdSummary(response);
  const items = orderReportsServiceApi.extractLatestIdItems(response);
  const history = orderReportsServiceApi.extractLatestIdStatusHistory(response);
  const customer = orderReportsServiceApi.extractLatestIdCustomerInfo(response);
  const seller = orderReportsServiceApi.extractLatestIdSellerInfo(response);

  return {
    summary: summary ? transformSummaryEntity(summary) : null,
    items: items.map(transformReportItemEntity),
    statusHistory: history ? transformStatusHistoryEntity(history) : null,
    customerInfo: customer ? transformCustomerInfoEntity(customer) : null,
    sellerInfo: seller ? transformSellerInfoEntity(seller) : null,
  };
}

export async function getSaleOrders(
  params: FindAllParams = {},
): Promise<UIOrderReportListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await orderReportsServiceApi.findSaleAll({
    pe_order_id: params.orderId,
    pe_customer_id: params.customerId,
    pe_seller_id: params.sellerId,
    pe_order_status_id: params.orderStatusId,
    pe_financial_status_id: params.financialStatusId,
    pe_location_id: params.locationId,
    pe_initial_date: params.initialDate,
    pe_final_date: params.finalDate,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = orderReportsServiceApi.extractSaleAll(response);
  return transformReportList(items);
}

export interface UISaleOrderDetail {
  summary: UIOrderSummary | null;
  orderDetail: UIOrderSaleDetail | null;
  customerInfo: UIOrderCustomerInfo | null;
  sellerInfo: UIOrderSellerInfo | null;
  tradingInfo: UIOrderTradingInfo | null;
  shippingInfo: UIOrderShippingInfo | null;
}

export async function getSaleOrderById(
  orderId: number,
  params: BaseParams & { typeBusiness?: number } = {},
): Promise<UISaleOrderDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderReport(String(orderId)), CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderReportsServiceApi.findSaleId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const summary = orderReportsServiceApi.extractSaleIdSummary(response);
  const items = orderReportsServiceApi.extractSaleIdItems(response);
  const customer = orderReportsServiceApi.extractSaleIdCustomerInfo(response);
  const seller = orderReportsServiceApi.extractSaleIdSellerInfo(response);
  const trading = orderReportsServiceApi.extractSaleIdTradingInfo(response);
  const shipping = orderReportsServiceApi.extractSaleIdShippingInfo(response);

  return {
    summary: summary ? transformSummaryEntity(summary) : null,
    orderDetail: items[0] ? transformSaleDetailEntity(items[0]) : null,
    customerInfo: customer ? transformCustomerInfoEntity(customer) : null,
    sellerInfo: seller ? transformSellerInfoEntity(seller) : null,
    tradingInfo: trading ? transformTradingInfoEntity(trading) : null,
    shippingInfo: shipping ? transformShippingInfoEntity(shipping) : null,
  };
}

export async function getSellerOrders(
  params: FindAllParams = {},
): Promise<UIOrderReportListItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.orderReports);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await orderReportsServiceApi.findSellerAll({
    pe_order_id: params.orderId,
    pe_customer_id: params.customerId,
    pe_seller_id: params.sellerId,
    pe_order_status_id: params.orderStatusId,
    pe_financial_status_id: params.financialStatusId,
    pe_location_id: params.locationId,
    pe_initial_date: params.initialDate,
    pe_final_date: params.finalDate,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = orderReportsServiceApi.extractSellerAll(response);
  return transformReportList(items);
}
