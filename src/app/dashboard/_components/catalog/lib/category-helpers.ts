import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";
import type { CategoryOption } from "../types/catalog-types";

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
 * Achata a arvore de taxonomias em uma lista plana de opcoes com displayName.
 */
export function flattenCategories(
  taxonomies: UITaxonomyMenuItem[],
): CategoryOption[] {
  return taxonomies.map((taxonomy) => ({
    id: taxonomy.id,
    name: taxonomy.name,
    level: taxonomy.level,
    displayName: `${getLevelPrefix(taxonomy.level)}${taxonomy.name}`,
  }));
}
