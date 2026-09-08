"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ENTRY_CREATE_MODEL_OPTIONS } from "@/app/dashboard/entry/_components/types/entry-dashboard-types";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  EntryNotFoundError,
  entryServiceApi,
  getEntryById,
} from "@/services/api-main/entry";

const logger = createLogger("EntryMainActions");
const ENTRY_LIST_PATH = "/dashboard/entry";

const updateEntryMainSchema = z.object({
  entryId: z.number().int().positive("ID da entrada inválido."),
  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Informe o número da nota.")
    .max(100, "O número da nota deve ter no máximo 100 caracteres."),
  model: z.enum(ENTRY_CREATE_MODEL_OPTIONS, {
    message: "Selecione o modelo NACIONAL ou IMPORTADO.",
  }),
  freightValue: z
    .number({ message: "Informe um valor de frete válido." })
    .min(0, "O valor do frete não pode ser negativo."),
  freightRate: z
    .number({ message: "Informe uma taxa de frete válida." })
    .min(0, "A taxa do frete não pode ser negativa."),
  totalInvoice: z
    .number({ message: "Informe um total da nota válido." })
    .min(0, "O total da nota não pode ser negativo."),
  totalProducts: z
    .number({ message: "Informe um total dos produtos válido." })
    .min(0, "O total dos produtos não pode ser negativo."),
  description: z
    .string()
    .trim()
    .max(300, "A descrição deve ter no máximo 300 caracteres."),
});

export interface UpdateEntryMainActionInput {
  entryId: number;
  invoiceNumber: string;
  model: string;
  freightValue: number;
  freightRate: number;
  totalInvoice: number;
  totalProducts: number;
  description: string;
}

export interface UpdateEntryMainActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateEntryMainAction(
  input: UpdateEntryMainActionInput,
): Promise<UpdateEntryMainActionResult> {
  const parsed = updateEntryMainSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos informados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const { apiContext } = await getAuthContext();
    const entry = await getEntryById(data.entryId, apiContext);

    if (!entry) {
      return {
        success: false,
        message: "Entrada não encontrada.",
      };
    }

    if (entry.isStockClosed) {
      return {
        success: false,
        message: "Esta nota já foi fechada e não pode ser editada.",
      };
    }

    await entryServiceApi.updateEntryMain({
      pe_entry_id: data.entryId,
      pe_invoice_number: data.invoiceNumber,
      pe_model: data.model,
      pe_freight_value: data.freightValue,
      pe_freight_rate: data.freightRate,
      pe_invoice_total: data.totalInvoice,
      pe_product_total: data.totalProducts,
      pe_description: data.description,
      ...apiContext,
    });

    revalidatePath(`${ENTRY_LIST_PATH}/${data.entryId}`);
    revalidatePath(ENTRY_LIST_PATH);

    return {
      success: true,
      message: "Informações da nota atualizadas com sucesso.",
    };
  } catch (error) {
    if (error instanceof EntryNotFoundError) {
      return {
        success: false,
        message: "Entrada não encontrada.",
      };
    }

    logger.error("Error updating entry main data", error);
    return {
      success: false,
      message: "Não foi possível atualizar as informações da nota.",
    };
  }
}
