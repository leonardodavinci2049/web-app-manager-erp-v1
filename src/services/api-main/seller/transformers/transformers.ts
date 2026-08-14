import type {
  SellerDetail,
  SellerListItem,
  SellerManagerDetail,
} from "../types/seller-types";

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
  rg?: string;
  firstName?: string;
  lastName?: string;
  imagePath?: string;
  birthDate?: string;
  cnpj?: string;
  legalName?: string;
  tradeName?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  responsibleName?: string;
  responsibleRole?: string;
  mainActivity?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  countryRegion?: string;
  country?: string;
  cityCode?: number;
  stateCode?: number;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
  notes?: string;
  inactive?: boolean;
  emailMarketingEnabled?: boolean;
  freeShipping?: boolean;
  isSeller: boolean;
  lastPurchase?: string;
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

export function transformSellerManagerDetail(
  entity: SellerManagerDetail,
): UISellerDetail {
  return {
    id: entity.ID_SELLER,
    storeId: entity.ID_LOJA,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.INATIVO === 1 ? "Inativo" : "Ativo",
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
    stateRegistration: entity.INSC_ESTADUAL || undefined,
    municipalRegistration: entity.INSC_MUNICIPAL || undefined,
    responsibleName: entity.NOME_RESPONSAVEL || undefined,
    responsibleRole: entity.CARGO_RESPONSAVEL || undefined,
    mainActivity: entity.ATIVIDADE_PRINCIPAL || undefined,
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
    linkedin: entity.LINKEDIN || undefined,
    instagram: entity.INSTAGRAM || undefined,
    tiktok: entity.TIKTOK || undefined,
    telegram: entity.TELEGRAM || undefined,
    notes: entity.ANOTACOES || undefined,
    inactive: entity.INATIVO === 1,
    emailMarketingEnabled: entity.EMAIL_MKT === 1,
    freeShipping: entity.FLAG_FRETE_GRATIS === 1,
    isSeller: entity.VENDEDOR === 1,
    lastPurchase: entity.DT_ULTIMA_COMPRA || undefined,
    createdAt: entity.DATADOCADASTRO || "",
  };
}
