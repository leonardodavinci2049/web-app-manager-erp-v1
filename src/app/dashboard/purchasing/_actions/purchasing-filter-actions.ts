"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { supplierServiceApi } from "@/services/api-main/supplier/supplier-service-api";
import type { PurchasingSupplierOption } from "../_components/types/purchasing-dashboard-types";

const logger = createLogger("PurchasingFilterActions");

const searchSchema = z.string().trim().max(300);

function normalizeSearchTerm(search: string): string {
  const parsed = searchSchema.safeParse(search ?? "");
  return parsed.success ? parsed.data : "";
}

/** Searches suppliers by name for the purchasing filter panel. */
export async function searchPurchasingFilterSuppliers(
  search: string,
): Promise<PurchasingSupplierOption[]> {
  const term = normalizeSearchTerm(search);

  try {
    const { apiContext } = await getAuthContext();
    const response = await supplierServiceApi.searchAllSuppliers({
      pe_search: term,
      ...apiContext,
    });

    return supplierServiceApi
      .extractSearchSuppliers(response)
      .map((supplier) => ({
        id: supplier.ID_FORNECEDOR,
        label: supplier.FORNECEDOR,
      }));
  } catch (error) {
    logger.error("Failed to search suppliers for purchasing filters:", error);
    return [];
  }
}
