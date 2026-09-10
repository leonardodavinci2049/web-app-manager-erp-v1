import type { UIEntryDetail } from "@/services/api-main/entry";

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
