import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

import { orderItemsServiceApi } from "./order-items-service-api";
import {
  transformOrderItemDetailEntity,
  transformOrderItemList,
  type UIOrderItem,
  type UIOrderItemDetail,
} from "./transformers/transformers";

export async function getOrderItems(
  params: {
    orderId?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIOrderItem[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.orderItems);

  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await orderItemsServiceApi.findAllOrderItems({
    pe_order_id: params.orderId,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = orderItemsServiceApi.extractOrderItems(response);
  return transformOrderItemList(items);
}

export async function getOrderItemById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIOrderItemDetail | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.orderItem(String(id)), CACHE_TAGS.orderItems);

  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await orderItemsServiceApi.findOrderItemById({
    pe_order_item_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const item = orderItemsServiceApi.extractOrderItemById(response);
  if (!item) {
    return undefined;
  }

  return transformOrderItemDetailEntity(item);
}
