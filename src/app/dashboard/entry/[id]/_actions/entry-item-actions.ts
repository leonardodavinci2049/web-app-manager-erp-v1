"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getEntryById } from "@/services/api-main/entry";
import {
  type EntryItemDetail,
  EntryItemNotFoundError,
  type EntryItemProduct,
  entryItemServiceApi,
} from "@/services/api-main/entry-item";

const logger = createLogger("EntryItemActions");
const ENTRY_LIST_PATH = "/dashboard/entry";
const ENTRY_CLOSED_MESSAGE = "Esta nota já foi fechada e não pode ser editada.";
const PRODUCT_SEARCH_LIMIT = 50;
const ENTRY_ITEMS_LIMIT = 1000;

const entryIdSchema = z.number().int().positive("ID da entrada inválido.");
const itemIdSchema = z.number().int().positive("ID do item inválido.");
const productIdSchema = z.number().int().positive("ID do produto inválido.");

export interface EntryItemProductDto {
  productId: number;
  name: string;
  brand: string;
  model: string;
  reference: string;
  imagePath: string | null;
  storeStock: number;
  wholesalePrice: string;
  retailPrice: string;
  corporatePrice: string;
  inactive: boolean;
}

export interface EntryItemProductSearchActionResult {
  success: boolean;
  products: EntryItemProductDto[];
}

export interface EntryItemDetailDto {
  itemId: number;
  productId: number;
  productName: string;
  supplier: string;
  carrier: string;
  supplierReference: string;
  storeStock: number;
  purchasedQuantity: number;
  receivedQuantity: number;
  unitValue: string;
  freightValue: string;
  invoiceValue: string;
  exchangeRate: number;
  unitValueDollar: number;
  freightValueDollar: number;
  wholesalePrice: string;
  retailPrice: string;
  corporatePrice: string;
  cfop: string;
  ncm: string;
  cst: string;
  baseIcms: string;
  valueIcms: string;
  baseIpi: string;
  valueIpi: string;
  baseIbs: string;
  valueIbs: string;
  baseCbs: string;
  valueCbs: string;
  baseSt: string;
  valueSt: string;
  notes: string;
}

export interface EntryItemDetailActionResult {
  success: boolean;
  message: string;
  item?: EntryItemDetailDto;
  notFound?: boolean;
}

export interface EntryItemActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

const searchProductsSchema = z.object({
  search: z.string().trim().max(300, "O termo de pesquisa é muito longo."),
});

const findEntryItemSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
});

const createEntryItemSchema = z.object({
  entryId: entryIdSchema,
  productId: productIdSchema,
});

const deleteEntryItemSchema = z.object({
  entryId: entryIdSchema,
  itemId: itemIdSchema,
});

function failure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): EntryItemActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function revalidateEntry(entryId: number): void {
  revalidatePath(`${ENTRY_LIST_PATH}/${entryId}`);
  revalidatePath(ENTRY_LIST_PATH);
}

function toProductDto(product: EntryItemProduct): EntryItemProductDto {
  return {
    productId: product.ID_PRODUTO,
    name: product.PRODUTO,
    brand: product.MARCA,
    model: product.MODELO,
    reference: product.REF_PRODUTO,
    imagePath: product.PATH_IMAGEM,
    storeStock: product.ESTOQUE_LOJA,
    wholesalePrice: product.VL_ATACADO1,
    retailPrice: product.VL_VAREJO,
    corporatePrice: product.VL_CORPORATIVO,
    inactive: product.INATIVO === 1,
  };
}

function toDetailDto(detail: EntryItemDetail): EntryItemDetailDto {
  return {
    itemId: detail.ID_MOVIMENTO,
    productId: detail.ID_PRODUTO,
    productName: detail.PRODUTO,
    supplier: detail.FORNECEDOR,
    carrier: detail.TRANSPORTADORA,
    supplierReference: detail.REF_FORNECEDOR,
    storeStock: detail.ESTOQUE_LOJA,
    purchasedQuantity: detail.QT_COMPRADA,
    receivedQuantity: detail.QT_RECEBIDA,
    unitValue: detail.VL_UNIT_REAL,
    freightValue: detail.VL_FRETE_REAL,
    invoiceValue: String(detail.VL_NOTA),
    exchangeRate: detail.CAMBIO,
    unitValueDollar: detail.VL_UNIT_DOLAR,
    freightValueDollar: detail.VL_FRETE_DOLAR,
    wholesalePrice: detail.VL_ATACADO,
    retailPrice: detail.VL_VAREJO,
    corporatePrice: detail.VL_CORPORATIVO,
    cfop: detail.CFOP,
    ncm: detail.NCM ?? "",
    cst: detail.CST,
    baseIcms: detail.BASE_ICMS ?? "",
    valueIcms: detail.VL_ICMS,
    baseIpi: detail.BASE_IPI ?? "",
    valueIpi: detail.VL_IPI,
    baseIbs: detail.BASE_IBS ?? "",
    valueIbs: detail.VL_IBS,
    baseCbs: detail.BASE_CBS ?? "",
    valueCbs: detail.VL_CBS,
    baseSt: detail.BASE_ST ?? "",
    valueSt: detail.VL_ST,
    notes: detail.ANOTACOES ?? "",
  };
}

async function loadEntryItemDetail(itemId: number, entryId: number) {
  const { apiContext } = await getAuthContext();
  const response = await entryItemServiceApi.findEntryItemById({
    pe_item_movement_id: itemId,
    ...apiContext,
  });
  const detail = entryItemServiceApi.extractEntryItemDetail(response);
  if (!detail || detail.ID_ENTRADA !== entryId) return null;
  return detail;
}

export async function searchEntryItemProductsAction(
  input: z.input<typeof searchProductsSchema>,
): Promise<EntryItemProductSearchActionResult> {
  const parsed = searchProductsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, products: [] };
  }

  try {
    const { apiContext } = await getAuthContext();
    const response = await entryItemServiceApi.searchEntryItemProducts({
      pe_search: parsed.data.search,
      pe_limit: PRODUCT_SEARCH_LIMIT,
      ...apiContext,
    });
    const products = entryItemServiceApi
      .extractEntryItemProducts(response)
      .map(toProductDto);
    return { success: true, products };
  } catch (error) {
    logger.error("Erro ao pesquisar produtos para inclusão na entrada", error);
    return {
      success: false,
      products: [],
    };
  }
}

export async function findEntryItemAction(
  input: z.input<typeof findEntryItemSchema>,
): Promise<EntryItemDetailActionResult> {
  const parsed = findEntryItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Não foi possível carregar o item.",
    };
  }

  try {
    const detail = await loadEntryItemDetail(
      parsed.data.itemId,
      parsed.data.entryId,
    );
    if (!detail) {
      return {
        success: false,
        message: "Item não encontrado nesta entrada.",
        notFound: true,
      };
    }
    return {
      success: true,
      message: "Item carregado com sucesso.",
      item: toDetailDto(detail),
    };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return {
        success: false,
        message: "Item não encontrado nesta entrada.",
        notFound: true,
      };
    }
    logger.error(
      `Erro ao carregar item ${parsed.data.itemId} da entrada ${parsed.data.entryId}`,
      error,
    );
    return {
      success: false,
      message: "Não foi possível carregar o item. Tente novamente.",
    };
  }
}

export async function createEntryItemAction(
  input: z.input<typeof createEntryItemSchema>,
): Promise<EntryItemActionResult> {
  const parsed = createEntryItemSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os dados do item.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const { apiContext } = await getAuthContext();
    const entry = await getEntryById(data.entryId, apiContext);
    if (!entry) {
      return failure("Entrada não encontrada.");
    }
    if (entry.isStockClosed) {
      return failure(ENTRY_CLOSED_MESSAGE);
    }

    const itemsResponse = await entryItemServiceApi.findEntryItemsByEntryId({
      pe_entry_id: data.entryId,
      pe_limit: ENTRY_ITEMS_LIMIT,
      ...apiContext,
    });
    const isDuplicated = entryItemServiceApi
      .extractEntryItemsByEntryId(itemsResponse)
      .some((item) => item.ID_PRODUTO === data.productId);
    if (isDuplicated) {
      return failure("Este produto já está incluído nesta entrada.");
    }

    await entryItemServiceApi.createEntryItem({
      pe_entry_id: data.entryId,
      pe_product_id: data.productId,
      ...apiContext,
    });

    revalidateEntry(data.entryId);
    return {
      success: true,
      message: "Produto adicionado aos itens da entrada.",
    };
  } catch (error) {
    return failure("Não foi possível adicionar o produto à entrada.", error);
  }
}

export async function deleteEntryItemAction(
  input: z.input<typeof deleteEntryItemSchema>,
): Promise<EntryItemActionResult> {
  const parsed = deleteEntryItemSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "Revise os dados do item.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const data = parsed.data;

  try {
    const { apiContext } = await getAuthContext();
    const entry = await getEntryById(data.entryId, apiContext);
    if (!entry) {
      return failure("Entrada não encontrada.");
    }
    if (entry.isStockClosed) {
      return failure(ENTRY_CLOSED_MESSAGE);
    }

    const detail = await loadEntryItemDetail(data.itemId, data.entryId);
    if (!detail) {
      return failure("Item não encontrado nesta entrada.");
    }

    await entryItemServiceApi.deleteEntryItem({
      pe_item_movement_id: data.itemId,
      ...apiContext,
    });

    revalidateEntry(data.entryId);
    return { success: true, message: "Item excluído da entrada." };
  } catch (error) {
    if (error instanceof EntryItemNotFoundError) {
      return failure("Item não encontrado nesta entrada.");
    }
    return failure("Não foi possível excluir o item da entrada.", error);
  }
}
