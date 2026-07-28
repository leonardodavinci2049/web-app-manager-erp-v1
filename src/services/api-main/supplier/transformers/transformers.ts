import type {
  SupplierDetail,
  SupplierListItem,
  SupplierRelProdItem,
} from "../types/supplier-types";

export interface UISupplier {
  id: number;
  name: string;
  notes?: string;
  updatedAt?: string;
}

export interface UISupplierRelProd {
  supplierId: number;
  productId: number;
  productName: string;
  productRef: string;
  productCode: string;
  supplierName: string;
  updatedAt?: string;
}

export function transformSupplierListItem(
  entity: SupplierListItem,
): UISupplier {
  return {
    id: entity.ID_FORNECEDOR,
    name: entity.FORNECEDOR,
    notes: undefined,
    updatedAt: undefined,
  };
}

export function transformSupplierList(items: SupplierListItem[]): UISupplier[] {
  return items.map(transformSupplierListItem);
}

export function transformSupplierDetail(entity: SupplierDetail): UISupplier {
  return {
    id: entity.ID_FORNECEDOR,
    name: entity.FORNECEDOR ?? "",
    notes: entity.ANOTACOES ?? undefined,
    updatedAt: entity.DT_UPDATE ?? undefined,
  };
}

export function transformSupplier(
  entity: SupplierListItem | SupplierDetail | null | undefined,
): UISupplier | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformSupplierDetail(entity as SupplierDetail);
  }

  return transformSupplierListItem(entity as SupplierListItem);
}

export function transformSupplierRelProdItem(
  entity: SupplierRelProdItem,
): UISupplierRelProd {
  return {
    supplierId: entity.ID_FORNECEDOR,
    productId: entity.ID_PRODUTO,
    productName: entity.PRODUTO,
    productRef: entity.REF,
    productCode: entity.CODIGODOPRODUTO,
    supplierName: entity.FORNECEDOR,
    updatedAt: entity.DT_UPDATE ?? undefined,
  };
}

export function transformSupplierRelProdList(
  items: SupplierRelProdItem[],
): UISupplierRelProd[] {
  return items.map(transformSupplierRelProdItem);
}
