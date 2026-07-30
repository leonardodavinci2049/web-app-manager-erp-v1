import type {
  SupplierDetail,
  SupplierListItem,
  SupplierRelProdItem,
  SupplierSearchListItem,
} from "../types/supplier-types";

export interface UISupplier {
  id: number;
  name: string;
  phone?: string;
  whatsapp?: string;
  legalName?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  imageId?: number;
  lastPurchaseAt?: string;
  state?: string;
  city?: string;
  createdAt?: string;
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

export function transformSupplierSearchListItem(
  entity: SupplierSearchListItem,
): UISupplier {
  return {
    id: entity.ID_FORNECEDOR,
    name: entity.FORNECEDOR,
    phone: entity.FONE1 ?? undefined,
    whatsapp: entity.WHATAPP1 ?? undefined,
    legalName: entity.RAZAO_SOCIAL ?? undefined,
    cpf: entity.CPF ?? undefined,
    cnpj: entity.CNPJ ?? undefined,
    email: entity.EMAIL ?? undefined,
    imageId: entity.ID_IMAGEM || undefined,
    lastPurchaseAt: entity.ULTIMA_COMPRA ?? undefined,
    state: entity.UF ?? undefined,
    city: entity.CIDADE ?? undefined,
    createdAt: entity.DATA_CADASTRO ?? undefined,
  };
}

export function transformSupplierSearchList(
  items: SupplierSearchListItem[],
): UISupplier[] {
  return items.map(transformSupplierSearchListItem);
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
  entity:
    | SupplierListItem
    | SupplierSearchListItem
    | SupplierDetail
    | null
    | undefined,
): UISupplier | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformSupplierDetail(entity as SupplierDetail);
  }

  if ("FONE1" in entity) {
    return transformSupplierSearchListItem(entity as SupplierSearchListItem);
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
