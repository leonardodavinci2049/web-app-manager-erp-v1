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
  CustomerNotFoundError,
  getCustomerById,
} from "@/services/api-main/customer-general";
import {
  OrderReportsError,
  orderReportsServiceApi,
  transformCustomerAllList,
} from "@/services/api-main/order-reports";
import {
  PhysicalProductError,
  physicalProductServiceApi,
  transformOrderItemsCustomer,
  transformPhysicalProductWarranties,
} from "@/services/api-main/physical_product";
import type {
  CustomerOrderListItem,
  CustomerPurchasedProductListItem,
  CustomerPurchasesActionResult,
  CustomerWarrantyListItem,
} from "../_components/customer-purchases-types";

const logger = createLogger("CustomerPurchasesActions");

const baseSearchSchema = z.object({
  customerId: z.number().int().positive(),
  search: z.string().trim().max(300),
  limit: z
    .number()
    .int()
    .positive()
    .refine((value) => value % 20 === 0),
});

const orderSearchSchema = baseSearchSchema.extend({
  search: z
    .string()
    .trim()
    .regex(/^\d*$/)
    .max(30)
    .refine(
      (value) => value === "" || Number.isSafeInteger(Number(value)),
      "Informe um ID de pedido válido.",
    ),
});

type ApiContext = Awaited<ReturnType<typeof getAuthContext>>["apiContext"];

function failure<T>(message: string): CustomerPurchasesActionResult<T> {
  return { success: false, message };
}

function getSafeApiMessage(error: unknown, fallback: string): string {
  const isKnownApiError =
    error instanceof OrderReportsError ||
    error instanceof PhysicalProductError ||
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
  customerId: number,
): Promise<ApiContext | null> {
  const { apiContext } = await getAuthContext();
  const customer = await getCustomerById(customerId, apiContext);
  return customer ? apiContext : null;
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

export async function findCustomerOrdersAction(
  input: z.input<typeof orderSearchSchema>,
): Promise<CustomerPurchasesActionResult<CustomerOrderListItem>> {
  const parsed = orderSearchSchema.safeParse(input);
  if (!parsed.success) return failure("Informe uma busca de pedido válida.");

  try {
    const apiContext = await getAuthorizedContext(parsed.data.customerId);
    if (!apiContext) return failure("Cliente não encontrado ou indisponível.");

    const { initialDate, finalDate } = getOrderDateRange();
    const response = await orderReportsServiceApi.orderFindCustomerAll({
      pe_order_id: parsed.data.search ? Number(parsed.data.search) : 0,
      pe_customer_id: parsed.data.customerId,
      pe_seller_id: 0,
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
    const items = orders.map<CustomerOrderListItem>((order) => ({
      orderDate: order.orderDate,
      orderId: order.orderId,
      itemCount: order.itemCount,
      subtotalValue: order.subtotalValue,
      freightValue: order.freightValue,
      totalOrderValue: order.totalOrderValue,
      sellerName: order.sellerName,
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
    if (error instanceof CustomerNotFoundError)
      return failure("Cliente não encontrado ou indisponível.");
    logger.error("Erro ao carregar pedidos do cliente", error);
    return failure(
      getSafeApiMessage(error, "Não foi possível carregar os pedidos."),
    );
  }
}

export async function findCustomerPurchasedProductsAction(
  input: z.input<typeof baseSearchSchema>,
): Promise<CustomerPurchasesActionResult<CustomerPurchasedProductListItem>> {
  const parsed = baseSearchSchema.safeParse(input);
  if (!parsed.success) return failure("Informe uma busca de produto válida.");

  try {
    const apiContext = await getAuthorizedContext(parsed.data.customerId);
    if (!apiContext) return failure("Cliente não encontrado ou indisponível.");

    const response = await physicalProductServiceApi.findOrderItemsByCustomer({
      pe_customer_id: parsed.data.customerId,
      pe_search: parsed.data.search,
      pe_limit: parsed.data.limit,
      ...apiContext,
    });
    const products = transformOrderItemsCustomer(
      physicalProductServiceApi.extractOrderItemsByCustomer(response),
    );
    const items = products.map<CustomerPurchasedProductListItem>((product) => ({
      movementId: product.movementId,
      imagePath: product.imagePath,
      productId: product.productId,
      description: product.description,
      quantity: product.quantity,
      unitValue: product.unitValue,
      subtotalValue: product.subtotalValue,
      totalValue: product.totalValue,
      orderDate: product.orderDate,
    }));

    return {
      success: true,
      items,
      hasMore: items.length === parsed.data.limit,
      message: response.message,
    };
  } catch (error) {
    if (error instanceof CustomerNotFoundError)
      return failure("Cliente não encontrado ou indisponível.");
    logger.error("Erro ao carregar produtos comprados pelo cliente", error);
    return failure(
      getSafeApiMessage(error, "Não foi possível carregar os produtos."),
    );
  }
}

export async function findCustomerWarrantiesAction(
  input: z.input<typeof baseSearchSchema>,
): Promise<CustomerPurchasesActionResult<CustomerWarrantyListItem>> {
  const parsed = baseSearchSchema.safeParse(input);
  if (!parsed.success) return failure("Informe uma busca de garantia válida.");

  try {
    const apiContext = await getAuthorizedContext(parsed.data.customerId);
    if (!apiContext) return failure("Cliente não encontrado ou indisponível.");

    const response = await physicalProductServiceApi.searchWarranties({
      pe_customer_id: parsed.data.customerId,
      PE_search: parsed.data.search,
      pe_limit: parsed.data.limit,
      ...apiContext,
    });
    const warranties = transformPhysicalProductWarranties(
      physicalProductServiceApi.extractWarrantySearch(response),
    );
    const items = warranties.map<CustomerWarrantyListItem>((warranty) => ({
      warrantyId: warranty.warrantyId,
      warrantyStatus: warranty.warrantyStatus,
      productId: warranty.productId,
      productName: warranty.productName,
      brand: warranty.brand,
      warrantyDays: warranty.warrantyDays,
      serialNumber: warranty.serialNumber,
      barcode: warranty.barcode,
      orderDate: warranty.orderDate,
      orderId: warranty.orderId,
      movementId: warranty.movementId,
      orderStatus: warranty.orderStatus,
    }));

    return {
      success: true,
      items,
      hasMore: items.length === parsed.data.limit,
      message: response.message,
    };
  } catch (error) {
    if (error instanceof CustomerNotFoundError)
      return failure("Cliente não encontrado ou indisponível.");
    logger.error("Erro ao carregar garantias do cliente", error);
    return failure(
      getSafeApiMessage(error, "Não foi possível carregar as garantias."),
    );
  }
}
