import type {
  ProductCategory,
  TaxonomyDetail,
  TaxonomyListItem,
  TaxonomyMenuItem,
  TaxonomyMenuManagerItem,
  TaxonomyProductItem,
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

export interface UIProductCategory {
  id: number;
  name: string;
}

export interface UITaxonomyProduct {
  id: number;
  sku: number;
  name: string;
  ref: string;
  model: string;
  imagePath?: string;
  pagePath?: string;
  slug: string;
  categories: UIProductCategory[];
  createdAt: string;
}

export interface UITaxonomyMenuManagerItem {
  id: number;
  parentId: number;
  name: string;
  slug?: string;
  imagePath?: string;
  level: number;
  order: number;
  inactive: boolean;
  productCount: number;
}

function isInactiveTaxonomy(value: number): boolean {
  return Number(value) === 1;
}

function parseProductCategories(raw: string | null): UIProductCategory[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ProductCategory[];
    return parsed.map((category) => ({
      id: category.ID_TAXONOMY,
      name: category.TAXONOMIA,
    }));
  } catch {
    return [];
  }
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
    inactive: isInactiveTaxonomy(entity.INATIVO),
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

export function transformTaxonomyProductItem(
  entity: TaxonomyProductItem,
): UITaxonomyProduct {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO ?? "",
    ref: entity.REF ?? "",
    model: entity.MODELO ?? "",
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || "",
    categories: parseProductCategories(entity.CATEGORIAS),
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformTaxonomyProductList(
  items: TaxonomyProductItem[],
): UITaxonomyProduct[] {
  return items.map(transformTaxonomyProductItem);
}

export function transformTaxonomyMenuManagerItem(
  entity: TaxonomyMenuManagerItem,
): UITaxonomyMenuManagerItem {
  return {
    id: entity.ID_TAXONOMY,
    parentId: entity.PARENTID ?? entity.PARENT_ID ?? 0,
    name: entity.TAXONOMIA,
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    level: entity.LEVEL,
    order: entity.ORDEM,
    inactive: isInactiveTaxonomy(entity.INATIVO),
    productCount: entity.QTY_PRODUCTS,
  };
}

export function transformTaxonomyMenuManagerList(
  items: TaxonomyMenuManagerItem[],
): UITaxonomyMenuManagerItem[] {
  return items.map(transformTaxonomyMenuManagerItem);
}
