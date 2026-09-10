"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { EntryNotFoundError, getEntryById } from "@/services/api-main/entry";
import {
  EntryItemNotFoundError,
  entryItemServiceApi,
} from "@/services/api-main/entry-item";

const logger = createLogger("EntryItemUpdateActions");
const ENTRY_LIST_PATH = "/dashboard/entry";
const ENTRY_CLOSED_MESSAGE = "Esta nota já foi fechada e não pode ser editada.";

const entryIdSchema = z.number().int().positive("ID da entrada inválido.");
const itemIdSchema = z.number().int().positive("ID do item inválido.");

const quantitySchema = z
  .number({ message: "Informe uma quantidade válida." })
  .int("Informe uma quantidade inteira.")
  .min(0, "A quantidade não pode ser negativa.");

const moneySchema = z
  .number({ message: "Informe um valor válido." })
  .min(0, "O valor não pode ser negativo.");

const priceSchema = z
  .number({ message: "Informe um preço válido." })
  .min(0.1, "O preço deve ser de no mínimo R$ 0,10.");

const taxCodeSchema = z
  .string()
  .max(100, "O código deve ter no máximo 100 caracteres.");

const updateEntryItemMainSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
  purchasedQuantity: quantitySchema,
  receivedQuantity: quantitySchema,
  unitValue: moneySchema,
  freightValue: moneySchema,
  invoiceValue: moneySchema,
});

const updateEntryItemProductPriceSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
  wholesalePrice: priceSchema,
  retailPrice: priceSchema,
  corporatePrice: priceSchema,
});

const updateEntryItemTaxCodesSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
  cst: taxCodeSchema,
  cfop: taxCodeSchema,
  ncm: taxCodeSchema,
});

const updateEntryItemTaxRatesSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
  baseIcms: moneySchema,
  valueIcms: moneySchema,
  baseIpi: moneySchema,
  valueIpi: moneySchema,
  baseSt: moneySchema,
  valueSt: moneySchema,
  baseIbs: moneySchema,
  valueIbs: moneySchema,
  baseCbs: moneySchema,
  valueCbs: moneySchema,
});

const updateEntryItemNotesSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
  notes: z
    .string()
    .max(2000, "As anotações devem ter no máximo 2000 caracteres."),
});

export type UpdateEntryItemMainInput = z.input<
  typeof updateEntryItemMainSchema
>;
export type UpdateEntryItemProductPriceInput = z.input<
  typeof updateEntryItemProductPriceSchema
>;
export type UpdateEntryItemTaxCodesInput = z.input<
  typeof updateEntryItemTaxCodesSchema
>;
export type UpdateEntryItemTaxRatesInput = z.input<
  typeof updateEntryItemTaxRatesSchema
>;
export type UpdateEntryItemNotesInput = z.input<
  typeof updateEntryItemNotesSchema
>;

export interface EntryItemUpdateActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  entryClosed?: boolean;
}

type ItemUpdateContext =
  | { status: "entry-not-found" }
  | { status: "entry-closed" }
  | { status: "item-not-found" }
  | {
      status: "ok";
      apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"];
    };

function failure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
  entryClosed = false,
): EntryItemUpdateActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors, entryClosed };
}

function revalidateEntry(entryId: number): void {
  revalidatePath(`${ENTRY_LIST_PATH}/${entryId}`);
  revalidatePath(ENTRY_LIST_PATH);
}

async function getItemUpdateContext(
  entryId: number,
  itemId: number,
): Promise<ItemUpdateContext> {
  const { apiContext } = await getAuthContext();

  let entry: Awaited<ReturnType<typeof getEntryById>>;
  try {
    entry = await getEntryById(entryId, apiContext);
  } catch (error) {
    if (error instanceof EntryNotFoundError) {
      return { status: "entry-not-found" };
    }
    throw error;
  }

  if (!entry) return { status: "entry-not-found" };
  if (entry.isStockClosed) return { status: "entry-closed" };

  const response = await entryItemServiceApi.findEntryItemById({
    pe_item_movement_id: itemId,
    ...apiContext,
  });
  const item = entryItemServiceApi.extractEntryItemDetail(response);
  if (!item || item.ID_ENTRADA !== entryId) {
    return { status: "item-not-found" };
  }

  return { status: "ok", apiContext };
}

export async function updateEntryItemMainAction(
  input: UpdateEntryItemMainInput,
): Promise<EntryItemUpdateActionResult> {
  const parsed = updateEntryItemMainSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise as informações do item.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getItemUpdateContext(data.entryId, data.itemId);
    if (context.status === "entry-not-found") {
      return failure("Entrada não encontrada.");
    }
    if (context.status === "entry-closed") {
      return failure(ENTRY_CLOSED_MESSAGE, undefined, undefined, true);
    }
    if (context.status === "item-not-found") {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.updateEntryItemMain({
      pe_item_movement_id: data.itemId,
      pe_qt_comprada: data.purchasedQuantity,
      pe_qt_recebida: data.receivedQuantity,
      pe_vl_unit_real: data.unitValue,
      pe_vl_frete_real: data.freightValue,
      pe_vl_nota: data.invoiceValue,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return {
      success: true,
      message: "Informações do item atualizadas com sucesso.",
    };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível atualizar as informações do item.", error);
  }
}

export async function updateEntryItemProductPriceAction(
  input: UpdateEntryItemProductPriceInput,
): Promise<EntryItemUpdateActionResult> {
  const parsed = updateEntryItemProductPriceSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os preços de venda.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getItemUpdateContext(data.entryId, data.itemId);
    if (context.status === "entry-not-found") {
      return failure("Entrada não encontrada.");
    }
    if (context.status === "entry-closed") {
      return failure(ENTRY_CLOSED_MESSAGE, undefined, undefined, true);
    }
    if (context.status === "item-not-found") {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.updateEntryItemProductPrice({
      pe_item_movement_id: data.itemId,
      pe_preco_venda_atac: data.wholesalePrice,
      pe_preco_venda_vare: data.retailPrice,
      pe_preco_venda_corporativo: data.corporatePrice,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return {
      success: true,
      message: "Preços de venda atualizados com sucesso.",
    };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível atualizar os preços de venda.", error);
  }
}

export async function updateEntryItemTaxCodesAction(
  input: UpdateEntryItemTaxCodesInput,
): Promise<EntryItemUpdateActionResult> {
  const parsed = updateEntryItemTaxCodesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os códigos fiscais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getItemUpdateContext(data.entryId, data.itemId);
    if (context.status === "entry-not-found") {
      return failure("Entrada não encontrada.");
    }
    if (context.status === "entry-closed") {
      return failure(ENTRY_CLOSED_MESSAGE, undefined, undefined, true);
    }
    if (context.status === "item-not-found") {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.updateEntryItemTaxCodes({
      pe_item_movement_id: data.itemId,
      pe_cst: data.cst,
      pe_cfop: data.cfop,
      pe_ncm: data.ncm,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return {
      success: true,
      message: "Códigos fiscais atualizados com sucesso.",
    };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível atualizar os códigos fiscais.", error);
  }
}

export async function updateEntryItemTaxRatesAction(
  input: UpdateEntryItemTaxRatesInput,
): Promise<EntryItemUpdateActionResult> {
  const parsed = updateEntryItemTaxRatesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os valores dos impostos.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getItemUpdateContext(data.entryId, data.itemId);
    if (context.status === "entry-not-found") {
      return failure("Entrada não encontrada.");
    }
    if (context.status === "entry-closed") {
      return failure(ENTRY_CLOSED_MESSAGE, undefined, undefined, true);
    }
    if (context.status === "item-not-found") {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.updateEntryItemTaxRates({
      pe_item_movement_id: data.itemId,
      pe_base_icms: data.baseIcms,
      pe_vl_icms: data.valueIcms,
      pe_base_ipi: data.baseIpi,
      pe_vl_ipi: data.valueIpi,
      pe_base_st: data.baseSt,
      pe_vl_st: data.valueSt,
      pe_base_ibs: data.baseIbs,
      pe_vl_ibs: data.valueIbs,
      pe_base_cbs: data.baseCbs,
      pe_vl_cbs: data.valueCbs,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Impostos atualizados com sucesso." };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível atualizar os impostos.", error);
  }
}

export async function updateEntryItemNotesAction(
  input: UpdateEntryItemNotesInput,
): Promise<EntryItemUpdateActionResult> {
  const parsed = updateEntryItemNotesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise as anotações.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const context = await getItemUpdateContext(data.entryId, data.itemId);
    if (context.status === "entry-not-found") {
      return failure("Entrada não encontrada.");
    }
    if (context.status === "entry-closed") {
      return failure(ENTRY_CLOSED_MESSAGE, undefined, undefined, true);
    }
    if (context.status === "item-not-found") {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.updateEntryItemNotes({
      pe_item_movement_id: data.itemId,
      pe_notes: data.notes,
      ...context.apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Anotações atualizadas com sucesso." };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível atualizar as anotações.", error);
  }
}
