import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import type { PurchasingCategoryOption } from "../types/purchasing-dashboard-types";

export function flattenPurchasingCategories(
  items: UITaxonomyMenuItem[],
): PurchasingCategoryOption[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    displayName: `${item.level > 1 ? `${"-".repeat(item.level - 1)} ` : ""}${item.name}`,
  }));
}

export function parsePurchasingCategoryNames(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const name = record.TAXONOMIA ?? record.name ?? record.NOME;
      return typeof name === "string" && name.trim() ? [name] : [];
    });
  } catch {
    return [];
  }
}
