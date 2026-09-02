export type EntryViewMode = "grid" | "table" | "cards";
export type EntrySort = "entry-date" | "id" | "created-at";
export type EntryOrder = "asc" | "desc";
export type EntryPageLimit = 25 | 50 | 100;

export const ENTRY_PAGE_SIZE: EntryPageLimit = 50;

export interface EntrySearchParams {
  search: string;
  sort: EntrySort;
  order: EntryOrder;
  page: number;
  limit: EntryPageLimit;
}

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
