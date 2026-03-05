import type { TaxonomyRelProductItem } from "../types/taxonomy-rel-types";

export interface UITaxonomyRelProduct {
  taxonomyId: number;
  name: string;
  createdAt: string;
}

export function transformTaxonomyRelProductItem(
  entity: TaxonomyRelProductItem,
): UITaxonomyRelProduct {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    name: entity.TAXONOMIA,
    createdAt: entity.CREATEDAT,
  };
}

export function transformTaxonomyRelProductList(
  items: TaxonomyRelProductItem[],
): UITaxonomyRelProduct[] {
  return items.map(transformTaxonomyRelProductItem);
}
