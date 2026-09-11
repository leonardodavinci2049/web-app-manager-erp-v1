import type { UIEntryDetail } from "@/services/api-main/entry";
import type { EntryItemEntryListItem } from "@/services/api-main/entry-item";

export const ENTRY_ITEM_QUANTITY_CLOSING_MESSAGE =
  "Essa nota de entrada não pode ser processada, existem item sem informação de quantidade";

type EntryClosingData = Pick<
  UIEntryDetail,
  "invoiceNumber" | "model" | "freightValue" | "totalInvoice" | "summary"
>;

function parseApiNumber(value: string): number {
  if (!value.trim()) return Number.NaN;
  return Number(value.replace(",", "."));
}

export function getEntryClosingBlockers(entry: EntryClosingData): string[] {
  const blockers: string[] = [];
  const totalInvoice = parseApiNumber(entry.totalInvoice);
  const movementQuantity = entry.summary?.movementQuantity ?? 0;

  if (!entry.invoiceNumber.trim()) {
    blockers.push("Informe o número da nota.");
  }
  if (!entry.model.trim()) {
    blockers.push("Informe o modelo da nota.");
  }
  if (!Number.isFinite(parseApiNumber(entry.freightValue))) {
    blockers.push("Informe o valor do frete.");
  }
  if (!Number.isFinite(totalInvoice) || totalInvoice <= 0) {
    blockers.push("O total da nota deve ser maior que zero.");
  }
  if (!Number.isFinite(movementQuantity) || movementQuantity <= 0) {
    blockers.push("Inclua pelo menos um movimento na entrada.");
  }

  return blockers;
}

export function getEntryItemsClosingBlocker(
  items: readonly Pick<EntryItemEntryListItem, "QT_RECEBIDA">[],
): string | null {
  return items.some((item) => item.QT_RECEBIDA < 1)
    ? ENTRY_ITEM_QUANTITY_CLOSING_MESSAGE
    : null;
}
