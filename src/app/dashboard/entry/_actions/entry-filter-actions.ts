"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { carrierServiceApi } from "@/services/api-main/carrier/carrier-service-api";
import { supplierServiceApi } from "@/services/api-main/supplier/supplier-service-api";
import type { EntryCreateOptionDto } from "../_components/types/entry-dashboard-types";

const logger = createLogger("EntryFilterActions");

const searchSchema = z.string().trim().max(300);

function normalizeSearchTerm(search: string): string {
  const parsed = searchSchema.safeParse(search ?? "");
  return parsed.success ? parsed.data : "";
}

/** Pesquisa fornecedores pelo nome para o painel de filtros de entradas. */
export async function searchEntryFilterSuppliers(
  search: string,
): Promise<EntryCreateOptionDto[]> {
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
    logger.error("Erro ao pesquisar fornecedores dos filtros:", error);
    return [];
  }
}

/** Pesquisa transportadoras pelo nome para o painel de filtros de entradas. */
export async function searchEntryFilterCarriers(
  search: string,
): Promise<EntryCreateOptionDto[]> {
  const term = normalizeSearchTerm(search);
  try {
    const { apiContext } = await getAuthContext();
    const response = await carrierServiceApi.searchAllCarriers({
      pe_search: term,
      ...apiContext,
    });

    return carrierServiceApi.extractSearchCarriers(response).map((carrier) => ({
      id: carrier.ID_TRANSPORTADORA,
      label: carrier.NOME,
    }));
  } catch (error) {
    logger.error("Erro ao pesquisar transportadoras dos filtros:", error);
    return [];
  }
}
