import type {
  EntryDetail,
  EntryListItem,
  EntrySummary,
} from "../types/entry-types";

export interface UIEntryListItem {
  id: number;
  supplierId: number;
  supplier: string;
  imagePath?: string;
  carrier: string;
  invoiceNumber: string;
  model: string;
  totalInvoice: string;
  totalProducts: string;
  stockStatus: string;
  physicalStatus: string;
  labelStatus: string;
  entryDate: string;
}

export interface UIEntrySummary {
  movementQuantity: number;
  totalReal: string;
  totalDollar: string;
}

export interface UIEntryDetail {
  id: number;
  userId: number;
  userName: string;
  supplierId: number;
  supplier: string;
  imagePath?: string;
  carrierId: number;
  carrier: string;
  invoiceNumber: string;
  model: string;
  description: string;
  exchangeRate: string;
  freightValue: string;
  freightRate: string;
  totalInvoice: string;
  totalProducts: string;
  ipiRate: string;
  icmsRate: string;
  icmsValue: string;
  ipiValue: string;
  pisValue: string;
  cofinsValue: string;
  ibsValue: string;
  cbsValue: string;
  stockStatus: string;
  physicalStatus: string;
  labelStatus: string;
  notes: string;
  stockEntryDate?: string;
  stockEntryTime?: string;
  postingTime: string;
  postingDate: string;
  entryDate: string;
  updatedAt: string;
  summary?: UIEntrySummary;
}

export function transformEntryListItem(entity: EntryListItem): UIEntryListItem {
  return {
    id: entity.ID_ENTRADA,
    supplierId: entity.ID_FORNECEDOR,
    supplier: entity.FORNECEDOR,
    imagePath: entity.PATH_IMAGEM || undefined,
    carrier: entity.TRANSPORTADORA,
    invoiceNumber: entity.NUMERODANOTA,
    model: entity.MODELO,
    totalInvoice: entity.VL_TOTAL_NOTA,
    totalProducts: entity.VL_TOTAL_PRODUTO,
    stockStatus: entity.STATUS_ESTOQUE,
    physicalStatus: entity.STATUS_FISICO,
    labelStatus: entity.STATUS_ETIQUETA,
    entryDate: entity.DT_ENTRADA,
  };
}

export function transformEntryList(items: EntryListItem[]): UIEntryListItem[] {
  return items.map(transformEntryListItem);
}

function transformEntrySummary(
  entity: EntrySummary | null | undefined,
): UIEntrySummary | undefined {
  if (!entity) return undefined;
  return {
    movementQuantity: entity.QT_MOVIMENTO,
    totalReal: entity.VL_TOTAL_REAL,
    totalDollar: entity.VL_TOTAL_DOLAR,
  };
}

export function transformEntryDetail(
  entity: EntryDetail,
  summary?: EntrySummary | null,
): UIEntryDetail {
  return {
    id: entity.ID_ENTRADA,
    userId: entity.ID_USUARIO,
    userName: entity.USUARIO,
    supplierId: entity.ID_FORNECEDOR,
    supplier: entity.FORNECEDOR,
    imagePath: entity.PATH_IMAGEM || undefined,
    carrierId: entity.ID_TRANSPORTADORA,
    carrier: entity.TRANSPORTADORA,
    invoiceNumber: entity.NUMERODANOTA,
    model: entity.MODELO,
    description: entity.DESCRICAO,
    exchangeRate: entity.CAMBIO,
    freightValue: entity.VL_FRETE,
    freightRate: entity.TX_FRETE,
    totalInvoice: entity.VL_TOTAL_NOTA,
    totalProducts: entity.VL_TOTAL_PRODUTO,
    ipiRate: entity.IPI,
    icmsRate: entity.ICMS,
    icmsValue: entity.VL_ICMS,
    ipiValue: entity.VL_IPI,
    pisValue: entity.VL_PIS,
    cofinsValue: entity.VL_CONFINS,
    ibsValue: entity.VL_IBS,
    cbsValue: entity.VL_CBS,
    stockStatus: entity.STATUS_ESTOQUE,
    physicalStatus: entity.STATUS_FISICO,
    labelStatus: entity.STATUS_ETIQUETA,
    notes: entity.ANOTACOES,
    stockEntryDate: entity.DATA_ENTRADA_ESTOQUE ?? undefined,
    stockEntryTime: entity.HORA_ENTRADA_ESTOQUE ?? undefined,
    postingTime: entity.HR_LANCAMENTO,
    postingDate: entity.DT_LANCAMENTO,
    entryDate: entity.DT_ENTRADA,
    updatedAt: entity.DT_UPDATE,
    summary: transformEntrySummary(summary),
  };
}
