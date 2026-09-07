"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getCustomersPage } from "@/services/api-main/customer-general";
import { getSellersPage } from "@/services/api-main/seller";
import type { OrderFilterOption } from "../_components/types/order-dashboard-types";

const logger = createLogger("OrderFilterActions");
const searchSchema = z.string().trim().max(300);

function normalizeSearchTerm(search: string): string {
  const parsed = searchSchema.safeParse(search ?? "");
  return parsed.success ? parsed.data : "";
}

export async function searchOrderFilterCustomers(
  search: string,
): Promise<OrderFilterOption[]> {
  const term = normalizeSearchTerm(search);
  try {
    const { apiContext } = await getAuthContext();
    const result = await getCustomersPage({
      search: term,
      page: 0,
      pageSize: 100,
      ...apiContext,
    });
    return result.items.map((customer) => ({
      id: customer.customerId,
      label: customer.name,
    }));
  } catch (error) {
    logger.error("Erro ao pesquisar clientes dos filtros de pedidos:", error);
    return [];
  }
}

export async function searchOrderFilterSellers(
  search: string,
): Promise<OrderFilterOption[]> {
  const term = normalizeSearchTerm(search);
  try {
    const { apiContext } = await getAuthContext();
    const result = await getSellersPage({
      search: term,
      page: 0,
      pageSize: 100,
      ...apiContext,
    });
    return result.items.map((seller) => ({
      id: seller.id,
      label: seller.name,
    }));
  } catch (error) {
    logger.error("Erro ao pesquisar vendedores dos filtros de pedidos:", error);
    return [];
  }
}
