import type {
  TaxonomyDetail,
  TaxonomyListItem,
  TaxonomyMenuItem,
} from "../types/taxonomy-base-types";

export interface UITaxonomy {
  id: number;
  parentId: number;
  name: string;
  slug?: string;
  imagePath?: string;
  imageId?: number;
  notes?: string;
  level: number;
  order: number;
  productCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  inactive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UITaxonomyMenuItem {
  id: number;
  parentId: number;
  name: string;
  slug?: string;
  imagePath?: string;
  imageId?: number;
  level: number;
  order: number;
  productCount?: number;
}

export function transformTaxonomyListItem(
  entity: TaxonomyListItem,
): UITaxonomy {
  return {
    id: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA,
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    imageId: entity.ID_IMAGEM ?? undefined,
    notes: entity.ANOTACOES ?? undefined,
    level: entity.LEVEL,
    order: entity.ORDEM,
    productCount: entity.QT_RECORDS ?? undefined,
    metaTitle: entity.META_TITLE ?? undefined,
    metaDescription: entity.META_DESCRIPTION ?? undefined,
    inactive: false,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export function transformTaxonomyList(items: TaxonomyListItem[]): UITaxonomy[] {
  return items.map(transformTaxonomyListItem);
}

export function transformTaxonomyDetail(entity: TaxonomyDetail): UITaxonomy {
  return {
    id: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA ?? "",
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    imageId: entity.ID_IMAGEM ?? undefined,
    notes: entity.ANOTACOES ?? undefined,
    level: entity.LEVEL,
    order: entity.ORDEM,
    productCount: entity.QT_RECORDS ?? undefined,
    metaTitle: entity.META_TITLE ?? undefined,
    metaDescription: entity.META_DESCRIPTION ?? undefined,
    inactive: entity.INATIVO === 1,
    createdAt: entity.CREATEDAT,
    updatedAt: entity.UPDATEDAT,
  };
}

export function transformTaxonomyDetailList(
  items: TaxonomyDetail[],
): UITaxonomy[] {
  return items.map(transformTaxonomyDetail);
}

export function transformTaxonomyMenuItem(
  entity: TaxonomyMenuItem,
): UITaxonomyMenuItem {
  return {
    id: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA,
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    imageId: entity.ID_IMAGEM ?? undefined,
    level: entity.LEVEL,
    order: entity.ORDEM,
    productCount: entity.QT_RECORDS ?? undefined,
  };
}

export function transformTaxonomyMenuList(
  items: TaxonomyMenuItem[],
): UITaxonomyMenuItem[] {
  return items.map(transformTaxonomyMenuItem);
}

export function transformTaxonomy(
  entity: TaxonomyListItem | TaxonomyDetail | null | undefined,
): UITaxonomy | null {
  if (!entity) return null;

  if ("INATIVO" in entity) {
    return transformTaxonomyDetail(entity as TaxonomyDetail);
  }

  return transformTaxonomyListItem(entity as TaxonomyListItem);
}
