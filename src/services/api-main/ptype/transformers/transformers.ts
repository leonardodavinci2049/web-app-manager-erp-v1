import type { PtypeDetail, PtypeListItem } from "../types/ptype-types";

export interface UIPtype {
  id: number;
  name: string;
  imagePath?: string;
  inactive?: boolean;
  notes?: string;
  productRegistrationFlag?: boolean;
  retailCommissionRate?: number;
  wholesaleCommissionRate?: number;
  createdAt?: string;
}

export function transformPtypeListItem(entity: PtypeListItem): UIPtype {
  return {
    id: entity.ID_TIPO,
    name: entity.TIPO,
  };
}

export function transformPtypeList(items: PtypeListItem[]): UIPtype[] {
  return items.map(transformPtypeListItem);
}

export function transformPtypeDetail(entity: PtypeDetail): UIPtype {
  return {
    id: entity.ID_TIPO,
    name: entity.TIPO ?? "",
    imagePath: entity.PATH_IMAGEM ?? undefined,
    inactive: entity.INATIVO === 1,
    notes: entity.ANOTACOES ?? undefined,
    productRegistrationFlag: entity.FLAG_CADASTRO_PRODUTO === 1,
    retailCommissionRate: toCommissionNumber(entity.TX_COMISSAO_VARE),
    wholesaleCommissionRate: toCommissionNumber(entity.TX_COMISSAO_ATAC),
    createdAt: entity.DT_CADASTRO ?? undefined,
  };
}

export function transformPtypeDetailList(items: PtypeDetail[]): UIPtype[] {
  return items.map(transformPtypeDetail);
}

export function transformPtype(
  entity: PtypeListItem | PtypeDetail | null | undefined,
): UIPtype | null {
  if (!entity) return null;

  if ("DT_CADASTRO" in entity) {
    return transformPtypeDetail(entity as PtypeDetail);
  }

  return transformPtypeListItem(entity as PtypeListItem);
}

function toCommissionNumber(
  value: string | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
