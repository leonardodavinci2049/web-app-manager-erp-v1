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
