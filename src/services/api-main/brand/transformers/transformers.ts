import type {
  BrandDetail,
  BrandListItem,
  BrandManagerDetail,
} from "../types/brand-types";

export interface UIBrand {
  id: number;
  name: string;
  slug?: string;
  imagePath?: string;
  notes?: string;
  inactive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function transformBrandListItem(entity: BrandListItem): UIBrand {
  return {
    id: entity.ID_MARCA,
    name: entity.MARCA,
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    notes: undefined,
    inactive: entity.INATIVO === 1,
    createdAt: entity.DATADOCADASTRO,
    updatedAt: undefined,
  };
}

export function transformBrandList(items: BrandListItem[]): UIBrand[] {
  return items.map(transformBrandListItem);
}

export function transformBrandDetail(entity: BrandDetail): UIBrand {
  return {
    id: entity.ID_MARCA,
    name: entity.MARCA ?? "",
    slug: entity.SLUG || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    notes: entity.ANOTACOES ?? undefined,
    inactive: entity.INATIVO === 1,
    createdAt: entity.DATADOCADASTRO,
    updatedAt: entity.DT_UPDATE ?? undefined,
  };
}

export function transformBrandDetailList(items: BrandDetail[]): UIBrand[] {
  return items.map(transformBrandDetail);
}

export function transformBrand(
  entity: BrandListItem | BrandDetail | BrandManagerDetail | null | undefined,
): UIBrand | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformBrandDetail(entity as BrandDetail);
  }

  return transformBrandListItem(entity as BrandListItem);
}
