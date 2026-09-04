"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { entryServiceApi } from "@/services/api-main/entry";
import {
  ENTRY_CREATE_MODEL_OPTIONS,
  type EntryActionResult,
} from "../_components/types/entry-dashboard-types";

const logger = createLogger("EntryDashboardActions");
const ENTRY_PATH = "/dashboard/entry";

const createSchema = z.object({
  supplierId: z.coerce
    .number({ message: "Selecione o fornecedor." })
    .int()
    .positive("Selecione o fornecedor."),
  carrierId: z.coerce
    .number({ message: "Selecione a transportadora." })
    .int()
    .positive("Selecione a transportadora."),
  categoryId: z.coerce
    .number({ message: "Selecione a categoria." })
    .int()
    .positive("Selecione a categoria."),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Informe o número da nota.")
    .max(100, "O número da nota deve ter no máximo 100 caracteres."),
  model: z.enum(ENTRY_CREATE_MODEL_OPTIONS, {
    message: "Selecione o modelo (NACIONAL ou IMPORTADO).",
  }),
  totalInvoiceValue: z.coerce
    .number({ message: "Informe o valor total da nota." })
    .min(0, "O valor total da nota não pode ser negativo."),
  totalProductValue: z.coerce
    .number({ message: "Informe o valor total dos produtos." })
    .min(0, "O valor total dos produtos não pode ser negativo."),
  freightValue: z.coerce
    .number({ message: "Informe o valor do frete." })
    .min(0, "O valor do frete não pode ser negativo."),
  freightRate: z.coerce
    .number({ message: "Informe a taxa do frete." })
    .min(0, "A taxa do frete não pode ser negativa."),
  exchangeRate: z.coerce
    .number({ message: "Informe o câmbio." })
    .min(0, "O câmbio não pode ser negativo."),
  icmsValue: z.coerce
    .number({ message: "Informe o valor de ICMS." })
    .min(0, "O valor de ICMS não pode ser negativo."),
  ipiValue: z.coerce
    .number({ message: "Informe o valor de IPI." })
    .min(0, "O valor de IPI não pode ser negativo."),
  pisValue: z.coerce
    .number({ message: "Informe o valor de PIS." })
    .min(0, "O valor de PIS não pode ser negativo."),
  cofinsValue: z.coerce
    .number({ message: "Informe o valor de COFINS." })
    .min(0, "O valor de COFINS não pode ser negativo."),
  ibsValue: z.coerce
    .number({ message: "Informe o valor de IBS." })
    .min(0, "O valor de IBS não pode ser negativo."),
  cbsValue: z.coerce
    .number({ message: "Informe o valor de CBS." })
    .min(0, "O valor de CBS não pode ser negativo."),
  notes: z
    .string()
    .trim()
    .max(2000, "As anotações devem ter no máximo 2000 caracteres."),
});

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): EntryActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

/** Cria uma entrada pela página de listagem e devolve o novo ID. */
export async function createEntryAction(input: {
  supplierId: number;
  carrierId: number;
  categoryId: number;
  invoiceNumber: string;
  model: string;
  totalInvoiceValue: number;
  totalProductValue: number;
  freightValue: number;
  freightRate: number;
  exchangeRate: number;
  icmsValue: number;
  ipiValue: number;
  pisValue: number;
  cofinsValue: number;
  ibsValue: number;
  cbsValue: number;
  notes: string;
}): Promise<EntryActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const { apiContext } = await getAuthContext();
    const response = await entryServiceApi.createEntry({
      pe_supplier_id: data.supplierId,
      pe_carrier_id: data.carrierId,
      pe_category_id: data.categoryId,
      pe_invoice_number: data.invoiceNumber,
      pe_model: data.model,
      pe_total_invoice_value: data.totalInvoiceValue,
      pe_total_product_value: data.totalProductValue,
      pe_freight_value: data.freightValue,
      pe_freight_rate: data.freightRate,
      pe_exchange_rate: data.exchangeRate,
      pe_vl_icms: data.icmsValue,
      pe_vl_ipi: data.ipiValue,
      pe_vl_pis: data.pisValue,
      pe_vl_confins: data.cofinsValue,
      pe_vl_ibs: data.ibsValue,
      pe_vl_cbs: data.cbsValue,
      pe_notes: data.notes,
      ...apiContext,
    });
    const result = entryServiceApi.extractStoredProcedureResult(response);
    const entryId = result?.sp_return_id || response.recordId;

    if (!entryId || entryId <= 0) {
      return safeFailure(
        "Não foi possível confirmar a criação da entrada. Tente novamente.",
      );
    }

    revalidatePath(ENTRY_PATH);
    return { success: true, message: "Entrada criada com sucesso.", entryId };
  } catch (error) {
    return safeFailure("Não foi possível criar a entrada.", error);
  }
}
