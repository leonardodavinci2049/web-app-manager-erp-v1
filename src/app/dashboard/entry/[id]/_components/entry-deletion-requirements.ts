import type { UIEntryDetail } from "@/services/api-main/entry";

type EntryDeletionData = Pick<UIEntryDetail, "isStockClosed" | "summary">;

export function getEntryDeletionBlocker(
  entry: EntryDeletionData,
): string | null {
  if (entry.isStockClosed) {
    return "Esta nota já foi concluída e não pode ser excluída.";
  }

  const movementQuantity = entry.summary?.movementQuantity;
  if (!Number.isFinite(movementQuantity)) {
    return "Não foi possível validar as movimentações desta entrada.";
  }
  if ((movementQuantity ?? 0) >= 1) {
    return "Esta nota possui movimentações de itens e não pode ser excluída.";
  }

  return null;
}
