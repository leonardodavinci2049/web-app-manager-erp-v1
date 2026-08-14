"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import {
  ApiAuthenticationError,
  ApiConnectionError,
  ApiNotFoundError,
  ApiServerError,
  ApiValidationError,
} from "@/lib/axios/base-api-service";
import { getAuthContext } from "@/server/auth-context";
import {
  OrderReportsError,
  orderReportsServiceApi,
  transformCustomerAllList,
} from "@/services/api-main/order-reports";
import { getSellerById, SellerNotFoundError } from "@/services/api-main/seller";
import type {
  SellerOrderListItem,
  SellerSalesActionResult,
} from "../_components/sales/seller-sales-types";

const logger = createLogger("SellerSalesActions");

const orderSearchSchema = z.object({
  sellerId: z.number().int().positive(),
  search: z
    .string()
    .trim()
    .regex(/^\d*$/)
    .max(30)
    .refine(
      (value) => value === "" || Number.isSafeInteger(Number(value)),
      "Informe um ID de pedido válido.",
    ),
  limit: z
    .number()
    .int()
    .positive()
    .refine((value) => value % 20 === 0),
});

type ApiContext = Awaited<ReturnType<typeof getAuthContext>>["apiContext"];

function failure<T>(message: string): SellerSalesActionResult<T> {
  return { success: false, message };
}

function getSafeApiMessage(error: unknown, fallback: string): string {
  const isKnownApiError =
    error instanceof OrderReportsError ||
    error instanceof ApiConnectionError ||
    error instanceof ApiValidationError ||
    error instanceof ApiAuthenticationError ||
    error instanceof ApiNotFoundError ||
    error instanceof ApiServerError;

  if (isKnownApiError) {
    const message = error.message.trim().slice(0, 500);
    if (message) return message;
  }

  return fallback;
}

async function getAuthorizedContext(
  sellerId: number,
): Promise<ApiContext | null> {
  const { apiContext } = await getAuthContext();
  const seller = await getSellerById(sellerId, apiContext);
  return seller?.isSeller ? apiContext : null;
}

function formatDateParameter(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getOrderDateRange(): { initialDate: string; finalDate: string } {
  const now = new Date();
  const initialDate = new Date(now);
  initialDate.setFullYear(initialDate.getFullYear() - 2);
  const finalDate = new Date(now);
  finalDate.setDate(finalDate.getDate() + 1);

  return {
    initialDate: formatDateParameter(initialDate),
    finalDate: formatDateParameter(finalDate),
  };
}

export async function findSellerOrdersAction(
  input: z.input<typeof orderSearchSchema>,
): Promise<SellerSalesActionResult<SellerOrderListItem>> {
  const parsed = orderSearchSchema.safeParse(input);
  if (!parsed.success) return failure("Informe uma busca de pedido válida.");

  try {
    const apiContext = await getAuthorizedContext(parsed.data.sellerId);
    if (!apiContext) return failure("Vendedor não encontrado ou indisponível.");

    const { initialDate, finalDate } = getOrderDateRange();
    const response = await orderReportsServiceApi.orderFindCustomerAll({
      pe_order_id: parsed.data.search ? Number(parsed.data.search) : 0,
      pe_customer_id: 0,
      pe_seller_id: parsed.data.sellerId,
      pe_order_status_id: 14,
      pe_financial_status_id: 0,
      pe_location_id: 0,
      pe_initial_date: initialDate,
      pe_final_date: finalDate,
      pe_limit: parsed.data.limit,
      ...apiContext,
    });
    const orders = transformCustomerAllList(
      orderReportsServiceApi.extractCustomerOrders(response),
    );
    const items = orders.map<SellerOrderListItem>((order) => ({
      orderDate: order.orderDate,
      orderId: order.orderId,
      itemCount: order.itemCount,
      subtotalValue: order.subtotalValue,
      freightValue: order.freightValue,
      totalOrderValue: order.totalOrderValue,
      customerName: order.customerName,
      paymentForm: order.paymentForm,
      orderStatus: order.orderStatus,
      financialStatus: order.financialStatus,
    }));

    return {
      success: true,
      items,
      hasMore: items.length === parsed.data.limit,
      message: response.message,
    };
  } catch (error) {
    if (error instanceof SellerNotFoundError)
      return failure("Vendedor não encontrado ou indisponível.");
    logger.error("Erro ao carregar pedidos do vendedor", error);
    return failure(
      getSafeApiMessage(error, "Não foi possível carregar os pedidos."),
    );
  }
}
