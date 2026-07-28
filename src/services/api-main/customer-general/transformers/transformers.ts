import type {
  CustomerDetail,
  CustomerLatestProduct,
  CustomerListItem,
  SellerInfo,
} from "../types/customer-general-types";

// ===== UI DTOs =====

export interface UICustomerListItem {
  customerId: number;
  customerTypeId: number;
  personTypeId: number;
  name: string;
  phone: string;
  whatsapp: string;
  companyName: string;
  cpf: string;
  cnpj: string;
  customerType: string;
  personType: string;
  email: string;
  imagePath?: string;
  lastPurchase?: string;
}

export interface UICustomerDetail {
  id: number;
  storeId: number;
  customerTypeId: number;
  accountStatus: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  personTypeId: number;
  accountType: string;
  cpf: string;
  firstName?: string;
  lastName?: string;
  imagePath?: string;
  birthDate?: string;
  cnpj: string;
  companyName: string;
  tradeName?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  responsibleName?: string;
  responsibleRole?: string;
  mainActivity?: string;
  sellerId: number;
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  countryRegion?: string;
  country?: string;
  cityCode: number;
  stateCode: number;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
  sellerFlag: number;
  createdAt: string;
}

export interface UISellerInfo {
  id: number;
  storeId: number;
  name: string;
  imagePath: string;
  phone: string;
  whatsapp: string;
  email: string;
}

export interface UICustomerLatestProduct {
  createdAt: string;
  movementId: number;
  orderId: number;
  productId: number;
  ean: string;
  ref: string;
  sku?: string;
  label: string;
  typeId: number;
  model: string;
  product: string;
  quantity: number;
  unitPrice: string;
  unitDiscount: string;
  unitAdmDiscount: string;
  code?: string;
  promotion: number;
  storeStock: number;
  depositStock: number;
  familyId: number;
  imagePath?: string;
  pagePath?: string;
  warrantyDays: number;
  returnedQuantity: number;
  totalAdmDiscount: string;
  totalDiscount: string;
  generalDiscount: string;
  totalCost: string;
  subtotal: string;
  total: string;
  notes: string;
}

// ===== Transformers =====

export function transformCustomerListItem(
  entity: CustomerListItem,
): UICustomerListItem {
  return {
    customerId: entity.ID_CUSTOMER,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    personTypeId: entity.ID_PESSOA_TIPO,
    name: entity.NOME,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    companyName: entity.RAZAO_SOCIAL,
    cpf: entity.CPF,
    cnpj: entity.CNPJ,
    customerType: entity.TIPO_CLIENTE,
    personType: entity.TIPO_PESSOA,
    email: entity.EMAIL,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    lastPurchase: entity.ULTIMA_COMPRA ?? undefined,
  };
}

export function transformCustomerList(
  items: CustomerListItem[],
): UICustomerListItem[] {
  return items.map(transformCustomerListItem);
}

export function transformCustomerDetail(
  entity: CustomerDetail,
): UICustomerDetail {
  return {
    id: entity.ID_USUARIO,
    storeId: entity.ID_LOJA,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    name: entity.NOME ?? "",
    email: entity.EMAIL ?? "",
    phone: entity.FONE1 ?? "",
    whatsapp: entity.WHATAPP1 ?? "",
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    cpf: entity.CPF ?? "",
    firstName: entity.PRIMEIRO_NOME ?? undefined,
    lastName: entity.SOBRENOME ?? undefined,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    birthDate: entity.DATADONASCIMENTO ?? undefined,
    cnpj: entity.CNPJ ?? "",
    companyName: entity.RAZAO_SOCIAL ?? "",
    tradeName: entity.NOME_FANTASIA ?? undefined,
    stateRegistration: entity.INSC_ESTADUAL ?? undefined,
    municipalRegistration: entity.INSC_MUNICIPAL ?? undefined,
    responsibleName: entity.NOME_RESPONSAVEL ?? undefined,
    responsibleRole: entity.CARGO_RESPONSAVEL ?? undefined,
    mainActivity: entity.ATIVIDADE_PRINCIPAL ?? undefined,
    sellerId: entity.ID_VENDEDOR,
    zipCode: entity.CEP ?? "",
    address: entity.ENDERECO ?? "",
    addressNumber: entity.ENDERECO_NUMERO ?? "",
    complement: entity.COMPLEMENTO ?? "",
    neighborhood: entity.BAIRRO ?? "",
    city: entity.CIDADE ?? "",
    state: entity.UF ?? "",
    countryRegion: entity.REGIAO_PAIS ?? undefined,
    country: entity.PAIS ?? undefined,
    cityCode: entity.COD_MUNICIPIO,
    stateCode: entity.COD_UF,
    website: entity.WEBSITE ?? undefined,
    facebook: entity.FACEBOOK ?? undefined,
    twitter: entity.TWITTER ?? undefined,
    linkedin: entity.LINKEDIN ?? undefined,
    instagram: entity.INSTAGRAM ?? undefined,
    tiktok: entity.TIKTOK ?? undefined,
    telegram: entity.TELEGRAM ?? undefined,
    sellerFlag: entity.VENDEDOR,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformSellerInfo(entity: SellerInfo): UISellerInfo {
  return {
    id: entity.ID_VENDEDOR,
    storeId: entity.ID_LOJA,
    name: entity.NOME,
    imagePath: entity.PATH_IMAGEM,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    email: entity.EMAIL,
  };
}

export function transformCustomerLatestProduct(
  entity: CustomerLatestProduct,
): UICustomerLatestProduct {
  return {
    createdAt: entity.DATADOCADASTRO,
    movementId: entity.ID_MOVIMENTO,
    orderId: entity.ID_PEDIDO,
    productId: entity.ID_PRODUTO,
    ean: entity.EAN,
    ref: entity.REF,
    sku: entity.SKU ?? undefined,
    label: entity.ETIQUETA,
    typeId: entity.ID_TIPO,
    model: entity.MODELO,
    product: entity.PRODUTO,
    quantity: entity.QT,
    unitPrice: entity.VL_UNITARIO,
    unitDiscount: entity.VL_DESCONTO_UNITARIO,
    unitAdmDiscount: entity.VL_DESCONTO_ADM_UNITARIO,
    code: entity.CODIGOP ?? undefined,
    promotion: entity.PROMOCAO,
    storeStock: entity.ESTOQUE_LOJA1,
    depositStock: entity.DEPOSITO1,
    familyId: entity.ID_FAMILIA,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    pagePath: entity.PATH_PAGE ?? undefined,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    returnedQuantity: entity.QT_ESTORNADA,
    totalAdmDiscount: entity.VL_DESCONTO_ADM_TOTAL,
    totalDiscount: entity.VL_DESCONTO_TOTAL,
    generalDiscount: entity.VL_DESCONTO_GERAL,
    totalCost: entity.VL_CUSTO_TOTAL,
    subtotal: entity.VL_SUBTOTAL,
    total: entity.VL_TOTAL,
    notes: entity.ANOTACOES,
  };
}

export function transformCustomerLatestProductList(
  items: CustomerLatestProduct[],
): UICustomerLatestProduct[] {
  return items.map(transformCustomerLatestProduct);
}
