export type EntryViewMode = "grid" | "table" | "cards";
export type EntrySort = "entry-date" | "id" | "created-at";
export type EntryOrder = "asc" | "desc";
export type EntryPageLimit = 25 | 50 | 100;

/** Entry model filter; `0` means all models. */
export type EntryModelId = 0 | 1 | 2;
/** Hardcoded entry category filter; `0` means all categories. */
export type EntryCategoryId = 0 | 1;
/** Date column used by the entry period filter; `0` ignores the period. */
export type EntryOperationList = 0 | 1 | 2 | 3;

export const ENTRY_PAGE_SIZE: EntryPageLimit = 50;

export interface EntrySearchParams {
  search: string;
  sort: EntrySort;
  order: EntryOrder;
  page: number;
  limit: EntryPageLimit;
  supplierId: number;
  carrierId: number;
  modelId: EntryModelId;
  categoryId: EntryCategoryId;
  operationList: EntryOperationList;
  startDate: string;
  endDate: string;
}

export const ENTRY_MODEL_OPTIONS: ReadonlyArray<{
  value: EntryModelId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 1, label: "Nacional" },
  { value: 2, label: "Importado" },
];

export const ENTRY_CATEGORY_OPTIONS: ReadonlyArray<{
  value: EntryCategoryId;
  label: string;
}> = [
  { value: 0, label: "Todos" },
  { value: 1, label: "Entrada de Produtos" },
];

export const ENTRY_OPERATION_LIST_OPTIONS: ReadonlyArray<{
  value: EntryOperationList;
  label: string;
}> = [
  { value: 0, label: "Ignorar" },
  { value: 1, label: "Data de cadastro" },
  { value: 2, label: "Data de lançamento" },
  { value: 3, label: "Data de entrada no estoque" },
];

export interface EntryCreateOptionDto {
  id: number;
  label: string;
}

export interface EntryActionResult {
  success: boolean;
  message: string;
  entryId?: number;
  fieldErrors?: Record<string, string[]>;
}
