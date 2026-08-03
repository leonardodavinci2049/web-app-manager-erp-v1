import type {
  SupplierDetail,
  SupplierListItem,
  SupplierRelProdItem,
  SupplierSearchListItem,
} from "../types/supplier-types";

export interface UISupplier {
  id: number;
  name: string;
  legalPhysicalType?: string;
  phone?: string;
  whatsapp?: string;
  contact?: string;
  sector?: string;
  legalName?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  imagePath?: string;
  imageId?: number;
  typePersonId?: number;
  typePerson?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  tradeName?: string;
  cnpjDate?: string;
  responsibleName?: string;
  responsibleRole?: string;
  rg?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  state?: string;
  city?: string;
  countryRegion?: string;
  country?: string;
  cityCode?: number;
  stateCode?: number;
  website?: string;
  facebook?: string;
  twitter?: string;
  freightForwarder?: boolean;
  inactive?: boolean;
  lastPurchaseAt?: string;
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
    name: entity.NOME ?? "",
    legalPhysicalType: entity.FISIJURI || undefined,
    phone: entity.FONE1 || undefined,
    whatsapp: entity.WHATAPP1 || undefined,
    contact: entity.CONTATO1 || undefined,
    sector: entity.SETOR1 || undefined,
    email: entity.EMAIL1 || undefined,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    typePersonId: entity.ID_PESSOA_TIPO ?? undefined,
    typePerson: entity.TIPO_PESSOA,
    legalName: entity.RAZAO_SOCIAL || undefined,
    cnpj: entity.CNPJ || undefined,
    stateRegistration: entity.INSC_ESTADUAL || undefined,
    municipalRegistration: entity.INSC_MUNICIPAL || undefined,
    tradeName: entity.NOME_FANTASIA || undefined,
    cnpjDate: entity.DATA_CNPJ || undefined,
    responsibleName: entity.NOME_RESPONSAVEL || undefined,
    responsibleRole: entity.CARGO || undefined,
    cpf: entity.CPF || undefined,
    rg: entity.RG || undefined,
    zipCode: entity.CEP || undefined,
    address: entity.ENDERECO || undefined,
    addressNumber: entity.ENDERECO_NUMERO || undefined,
    complement: entity.COMPLEMENTO || undefined,
    neighborhood: entity.BAIRRO || undefined,
    city: entity.CIDADE || undefined,
    state: entity.UF || undefined,
    countryRegion: entity.REGIAO_PAIS || undefined,
    country: entity.PAIS || undefined,
    cityCode: entity.COD_MUNICIPIO || undefined,
    stateCode: entity.COD_UF || undefined,
    website: entity.WEBSITE || undefined,
    facebook: entity.FACEBOOK || undefined,
    twitter: entity.TWITTER || undefined,
    freightForwarder: entity.FRETADOR === 1,
    inactive: entity.INATIVO === 1,
    lastPurchaseAt: entity.DT_ULTIMA_COMPRA || undefined,
    createdAt: entity.DATADOCADASTRO || undefined,
    notes: entity.ANOTACOES || undefined,
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

  if ("ANOTACOES" in entity && "NOME" in entity) {
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
