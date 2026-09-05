import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import type { CategoryOption } from "../types/product-dashboard-types";

/**
 * Prefixo de indentacao visual baseado no nivel da categoria.
 * Unifica a logica antes duplicada entre o flatten da pagina e o dialog.
 */
export function getLevelPrefix(level: number): string {
  if (level === 1) return "";
  if (level === 2) return "- ";
  if (level === 3) return "-- ";
  return "--- ";
}

/**
 * Achata a arvore de taxonomias em uma lista plana de opcoes com displayName,
 * preservando os campos de hierarquia (parentId, order, productCount) para
 * permitir a montagem de menus navegaveis.
 */
export function flattenCategories(
  taxonomies: UITaxonomyMenuItem[],
): CategoryOption[] {
  return taxonomies.map((taxonomy) => ({
    id: taxonomy.id,
    parentId: taxonomy.parentId,
    name: taxonomy.name,
    level: taxonomy.level,
    order: taxonomy.order,
    productCount: taxonomy.productCount,
    displayName: `${getLevelPrefix(taxonomy.level)}${taxonomy.name}`,
  }));
}
