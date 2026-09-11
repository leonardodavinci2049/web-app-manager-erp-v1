"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EntryActionResult } from "@/app/dashboard/entry/_components/types/entry-dashboard-types";
import { isApiSuccess } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  EntryNotFoundError,
  entryServiceApi,
  getEntryById,
} from "@/services/api-main/entry";
import { entryItemServiceApi } from "@/services/api-main/entry-item";
import {
  getEntryClosingBlockers,
  getEntryItemsClosingBlocker,
} from "../_components/entry-closing-requirements";
import { getEntryDeletionBlocker } from "../_components/entry-deletion-requirements";

const logger = createLogger("EntryDetailActions");
const ENTRY_LIST_PATH = "/dashboard/entry";
const ENTRY_CLOSED_MESSAGE = "Esta nota já foi fechada e não pode ser editada.";

const entryIdSchema = z.number().int().positive("ID da entrada inválido.");
const deleteEntrySchema = z.object({ entryId: entryIdSchema });
const processEntryInventorySchema = z.object({ entryId: entryIdSchema });

const updateDollarValueSchema = z.object({
  entryId: entryIdSchema,
  exchangeRate: z
    .number({ message: "Informe um valor de câmbio válido." })
    .positive("O valor do câmbio deve ser maior que zero."),
});

const updatePartnersSchema = z.object({
  entryId: entryIdSchema,
  supplierId: z
    .number({ message: "Selecione o fornecedor." })
    .int()
    .positive("Selecione o fornecedor."),
  carrierId: z
    .number({ message: "Selecione a transportadora." })
    .int()
    .positive("Selecione a transportadora."),
});

const updateNotesSchema = z.object({
  entryId: entryIdSchema,
  notes: z
    .string()
    .trim()
    .max(2000, "As anotações devem ter no máximo 2000 caracteres."),
});

const taxValueSchema = z
  .number({ message: "Informe um valor válido." })
  .min(0, "O valor não pode ser negativo.");

const updateTaxRatesSchema = z.object({
  entryId: entryIdSchema,
  icmsValue: taxValueSchema,
  ipiValue: taxValueSchema,
  pisValue: taxValueSchema,
  cofinsValue: taxValueSchema,
  ibsValue: taxValueSchema,
  cbsValue: taxValueSchema,
});

function failure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): EntryActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function revalidateEntry(entryId: number): void {
  revalidatePath(`${ENTRY_LIST_PATH}/${entryId}`);
  revalidatePath(ENTRY_LIST_PATH);
}

async function getEntryUpdateContext(entryId: number) {
  const { apiContext } = await getAuthContext();
  const entry = await getEntryById(entryId, apiContext);
  return entry ? { apiContext, entry } : null;
}

function notFoundFailure(error?: unknown): EntryActionResult {
  if (error && !(error instanceof EntryNotFoundError)) {
    return failure("Não foi possível validar a entrada.", error);
  }
  return failure("Entrada não encontrada.");
}

function closedEntryFailure(): EntryActionResult {
  return failure(ENTRY_CLOSED_MESSAGE);
}

export async function deleteEntryAction(
  input: z.input<typeof deleteEntrySchema>,
): Promise<EntryActionResult> {
  const parsed = deleteEntrySchema.safeParse(input);
  if (!parsed.success) {
    return failure("ID da entrada inválido.");
  }

  const { entryId } = parsed.data;

  try {
    const context = await getEntryUpdateContext(entryId);
    if (!context) return notFoundFailure();

    const blocker = getEntryDeletionBlocker(context.entry);
    if (blocker) return failure(blocker);

    await entryServiceApi.deleteEntry({
      pe_entry_id: entryId,
      ...context.apiContext,
    });

    revalidatePath(ENTRY_LIST_PATH);
    return { success: true, message: "Entrada excluída com sucesso." };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure("Não foi possível excluir a entrada.", error);
  }
}

export async function processEntryInventoryAction(
  input: z.input<typeof processEntryInventorySchema>,
): Promise<EntryActionResult> {
  const parsed = processEntryInventorySchema.safeParse(input);
  if (!parsed.success) {
    return failure("ID da entrada inválido.");
  }

  const { entryId } = parsed.data;

  try {
    const context = await getEntryUpdateContext(entryId);
    if (!context) return notFoundFailure();
    if (context.entry.isStockClosed) {
      return failure("Esta nota já foi fechada.");
    }

    const blockers = getEntryClosingBlockers(context.entry);
    const itemsResponse = await entryItemServiceApi.findEntryItemsByEntryId({
      pe_entry_id: entryId,
      pe_limit: 1000,
      ...context.apiContext,
    });
    if (!isApiSuccess(itemsResponse.statusCode)) {
      throw new Error("Entry items API returned an error");
    }

    const entryItems = entryItemServiceApi
      .extractEntryItemsByEntryId(itemsResponse)
      .filter((item) => item.ID_ENTRADA === entryId);
    const itemsBlocker = getEntryItemsClosingBlocker(entryItems);
    if (itemsBlocker) blockers.push(itemsBlocker);

    if (blockers.length > 0) {
      return failure(
        itemsBlocker ?? "Corrija as pendências antes de finalizar a entrada.",
        undefined,
        { closing: blockers },
      );
    }

    await entryServiceApi.processEntryInventory({
      pe_entry_id: entryId,
      ...context.apiContext,
    });

    revalidateEntry(entryId);
    return { success: true, message: "Entrada finalizada com sucesso." };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure("Não foi possível finalizar a entrada.", error);
  }
}

export async function updateEntryDollarValueAction(
  input: z.input<typeof updateDollarValueSchema>,
): Promise<EntryActionResult> {
  const parsed = updateDollarValueSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise o valor do câmbio.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getEntryUpdateContext(data.entryId);
    if (!context) return notFoundFailure();
    if (context.entry.isStockClosed) return closedEntryFailure();

    await entryServiceApi.updateEntryDollarValue({
      pe_entry_id: data.entryId,
      pe_dollar_exchange_rate: data.exchangeRate,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Câmbio atualizado com sucesso." };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure("Não foi possível atualizar o câmbio.", error);
  }
}

export async function updateEntryPartnersAction(
  input: z.input<typeof updatePartnersSchema>,
): Promise<EntryActionResult> {
  const parsed = updatePartnersSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise o fornecedor e a transportadora.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getEntryUpdateContext(data.entryId);
    if (!context) return notFoundFailure();
    if (context.entry.isStockClosed) return closedEntryFailure();

    if (context.entry.supplierId !== data.supplierId) {
      await entryServiceApi.updateEntrySupplier({
        pe_entry_id: data.entryId,
        pe_supplier_id: data.supplierId,
        ...context.apiContext,
      });
    }

    if (context.entry.carrierId !== data.carrierId) {
      await entryServiceApi.updateEntryCarrier({
        pe_entry_id: data.entryId,
        pe_carrier_id: data.carrierId,
        ...context.apiContext,
      });
    }

    revalidateEntry(data.entryId);
    return {
      success: true,
      message: "Fornecedor e transportadora atualizados com sucesso.",
    };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure(
      "Não foi possível atualizar o fornecedor e a transportadora.",
      error,
    );
  }
}

export async function updateEntryNotesAction(
  input: z.input<typeof updateNotesSchema>,
): Promise<EntryActionResult> {
  const parsed = updateNotesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise as anotações.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getEntryUpdateContext(data.entryId);
    if (!context) return notFoundFailure();
    if (context.entry.isStockClosed) return closedEntryFailure();

    await entryServiceApi.updateEntryNotes({
      pe_entry_id: data.entryId,
      pe_notes: data.notes,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Anotações atualizadas com sucesso." };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure("Não foi possível atualizar as anotações.", error);
  }
}

export async function updateEntryTaxRatesAction(
  input: z.input<typeof updateTaxRatesSchema>,
): Promise<EntryActionResult> {
  const parsed = updateTaxRatesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os valores dos tributos.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getEntryUpdateContext(data.entryId);
    if (!context) return notFoundFailure();
    if (context.entry.isStockClosed) return closedEntryFailure();

    await entryServiceApi.updateEntryTaxRates({
      pe_entry_id: data.entryId,
      pe_vl_icms: data.icmsValue,
      pe_vl_ipi: data.ipiValue,
      pe_vl_pis: data.pisValue,
      pe_vl_confins: data.cofinsValue,
      pe_vl_ibs: data.ibsValue,
      pe_vl_cbs: data.cbsValue,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Tributos atualizados com sucesso." };
  } catch (error) {
    if (error instanceof EntryNotFoundError) return notFoundFailure(error);
    return failure("Não foi possível atualizar os tributos.", error);
  }
}
