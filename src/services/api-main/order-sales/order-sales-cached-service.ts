import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { orderSalesServiceApi } from "./order-sales-service-api";
import {
  transformCarrierEntity,
  transformCustomerEntity,
  transformDashboardDetailsEntity,
  transformDashboardItemEntity,
  transformDeliveryEntity,
  transformEquipmentEntity,
  transformHistoryEntity,
  transformNfEntity,
  transformPgFormaEntity,
  transformProtocolEntity,
  transformSellerEntity,
  transformSummaryEntity,
  type UIOrderCarrier,
  type UIOrderCustomer,
  type UIOrderDashboardDetails,
  type UIOrderDashboardItem,
  type UIOrderDelivery,
  type UIOrderEquipment,
  type UIOrderHistory,
  type UIOrderNf,
  type UIOrderPgForma,
  type UIOrderProtocol,
  type UIOrderSalesSummary,
  type UIOrderSeller,
} from "./transformers/transformers";

interface BaseParams {
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
  typeBusiness?: number;
}

export async function getOrderCarrier(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderCarrier | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoCarrierId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractCarrier(response);
  return entity ? transformCarrierEntity(entity) : undefined;
}

export async function getOrderCustomer(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderCustomer | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoCustomerId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractCustomer(response);
  return entity ? transformCustomerEntity(entity) : undefined;
}

export async function getOrderDelivery(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderDelivery | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoDeliveryId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractDelivery(response);
  return entity ? transformDeliveryEntity(entity) : undefined;
}

export async function getOrderHistory(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderHistory | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoHistoryId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractHistory(response);
  return entity ? transformHistoryEntity(entity) : undefined;
}

export async function getOrderNf(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderNf | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoNfId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractNf(response);
  return entity ? transformNfEntity(entity) : undefined;
}

export async function getOrderPgForma(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderPgForma | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoPgFormaId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractPgForma(response);
  return entity ? transformPgFormaEntity(entity) : undefined;
}

export async function getOrderProtocol(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderProtocol | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoProtocolId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractProtocol(response);
  return entity ? transformProtocolEntity(entity) : undefined;
}

export async function getOrderSeller(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderSeller | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoSellerId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractSeller(response);
  return entity ? transformSellerEntity(entity) : undefined;
}

export async function getOrderSummary(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderSalesSummary | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findCoSummaryId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractSummary(response);
  return entity ? transformSummaryEntity(entity) : undefined;
}

export interface UIOrderDashboard {
  summary: UIOrderSalesSummary | null;
  details: UIOrderDashboardDetails | null;
  items: UIOrderDashboardItem[];
  customer: UIOrderCustomer | null;
}

export async function getOrderDashboard(
  orderId: number,
  params: BaseParams & { sellerId?: number } = {},
): Promise<UIOrderDashboard | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findDashboardId({
    pe_order_id: orderId,
    pe_id_seller: params.sellerId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const summary = orderSalesServiceApi.extractDashboardSummary(response);
  const details = orderSalesServiceApi.extractDashboardDetails(response);
  const items = orderSalesServiceApi.extractDashboardItems(response);
  const customer = orderSalesServiceApi.extractDashboardCustomer(response);

  return {
    summary: summary ? transformSummaryEntity(summary) : null,
    details: details ? transformDashboardDetailsEntity(details) : null,
    items: items.map(transformDashboardItemEntity),
    customer: customer ? transformCustomerEntity(customer) : null,
  };
}

export async function getOrderEquipment(
  orderId: number,
  params: BaseParams = {},
): Promise<UIOrderEquipment | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderSale(String(orderId)), CACHE_TAGS.orderSales);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderSalesServiceApi.findEquipmentId({
    pe_order_id: orderId,
    pe_type_business: params.typeBusiness,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const entity = orderSalesServiceApi.extractEquipment(response);
  return entity ? transformEquipmentEntity(entity) : undefined;
}
