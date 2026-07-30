import type { SellerDetail, SellerListItem } from "../types/seller-types";

export interface UISellerListItem {
  id: number;
  customerTypeId: number;
  personTypeId: number;
  name: string;
  phone?: string;
  whatsapp?: string;
  legalName?: string;
  city?: string;
  cpf?: string;
  cnpj?: string;
  customerType: string;
  personType: string;
  email?: string;
  imagePath?: string;
  lastPurchaseAt?: string;
  createdAt?: string;
}

export interface UISellerDetail {
  id: number;
  storeId: number;
  customerTypeId: number;
  accountStatus: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  personTypeId: number;
  accountType: string;
  cpf?: string;
  firstName?: string;
  lastName?: string;
  imagePath?: string;
  birthDate?: string;
  cnpj?: string;
  legalName?: string;
  tradeName?: string;
  isSeller: boolean;
  createdAt: string;
}

export function transformSellerListItem(
  entity: SellerListItem,
): UISellerListItem {
  return {
    id: entity.ID_CUSTOMER,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    personTypeId: entity.ID_PESSOA_TIPO,
    name: entity.NOME,
    phone: entity.FONE1 || undefined,
    whatsapp: entity.WHATAPP1 || undefined,
    legalName: entity.RAZAO_SOCIAL || undefined,
    city: entity.CIDADE || undefined,
    cpf: entity.CPF || undefined,
    cnpj: entity.CNPJ || undefined,
    customerType: entity.TIPO_CLIENTE,
    personType: entity.TIPO_PESSOA,
    email: entity.EMAIL || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    lastPurchaseAt: entity.ULTIMA_COMPRA || undefined,
    createdAt: entity.DATA_CADASTRO || undefined,
  };
}

export function transformSellerList(
  items: SellerListItem[],
): UISellerListItem[] {
  return items.map(transformSellerListItem);
}

export function transformSellerDetail(entity: SellerDetail): UISellerDetail {
  return {
    id: entity.ID_SELLER,
    storeId: entity.ID_LOJA,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    name: entity.NOME,
    email: entity.EMAIL || undefined,
    phone: entity.FONE1 || undefined,
    whatsapp: entity.WHATAPP1 || undefined,
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    cpf: entity.CPF || undefined,
    firstName: entity.PRIMEIRO_NOME || undefined,
    lastName: entity.SOBRENOME || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    birthDate: entity.DATADONASCIMENTO || undefined,
    cnpj: entity.CNPJ || undefined,
    legalName: entity.RAZAO_SOCIAL || undefined,
    tradeName: entity.NOME_FANTASIA || undefined,
    isSeller: entity.VENDEDOR === 1,
    createdAt: entity.DATADOCADASTRO,
  };
}
