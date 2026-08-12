import type {
  OrderEmailCustomerEntity,
  OrderEmailItemEntity,
  OrderEmailSellerEntity,
  OrderEmailSummaryEntity,
} from "../types/order-operations-types";

export interface UIOrderEmailSummary {
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  totalOrderValue: string;
}

export interface UIOrderEmailItem {
  itemId: number;
  orderId: number;
  productId: number;
  sku: number;
  product: string;
  quantity: number;
  unitValue: string;
  subtotalValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  freightValue: string;
  totalValue: string;
  status: string | null;
  imageId: number;
  imagePath: string;
  slug: string;
  warrantyMonths: number;
  warrantyDays: number;
  reversedQuantity: number;
  createdAt: string;
}

export interface UIOrderEmailCustomer {
  userId: number;
  sellerId: number;
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  countryRegion: string;
  country: string;
  municipalityCode: number;
  stateCode: number;
}

export interface UIOrderEmailSeller {
  sellerId: number;
  storeId: number;
  name: string;
  imagePath: string;
  phone: string;
  whatsapp: string;
  email: string;
}

export function transformEmailSummary(
  entity: OrderEmailSummaryEntity,
): UIOrderEmailSummary {
  return {
    orderId: entity.ID_PEDIDO,
    itemCount: entity.QT_ITENS,
    subtotalValue: entity.VL_SUBTOTAL,
    freightValue: entity.VL_FRETE,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    discountValue: entity.VL_DESCONTO,
    totalOrderValue: entity.VL_TOTAL_PEDIDO,
  };
}

export function transformEmailItem(
  entity: OrderEmailItemEntity,
): UIOrderEmailItem {
  return {
    itemId: entity.ID_ITEM,
    orderId: entity.ID_PEDIDO,
    productId: entity.ID_PRODUTO,
    sku: entity.SKU,
    product: entity.PRODUTO,
    quantity: entity.QT,
    unitValue: entity.VL_UNITARIO,
    subtotalValue: entity.VL_SUBTOTAL,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    discountValue: entity.VL_DESCONTO,
    freightValue: entity.VL_FRETE,
    totalValue: entity.VL_TOTAL,
    status: entity.STATUS,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM,
    slug: entity.SLUG,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    reversedQuantity: entity.QT_ESTORNADA,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformEmailCustomer(
  entity: OrderEmailCustomerEntity,
): UIOrderEmailCustomer {
  return {
    userId: entity.ID_USUARIO,
    sellerId: entity.ID_VENDEDOR,
    zipCode: entity.CEP,
    address: entity.ENDERECO,
    addressNumber: entity.ENDERECO_NUMERO,
    complement: entity.COMPLEMENTO,
    neighborhood: entity.BAIRRO,
    city: entity.CIDADE,
    state: entity.UF,
    countryRegion: entity.REGIAO_PAIS,
    country: entity.PAIS,
    municipalityCode: entity.COD_MUNICIPIO,
    stateCode: entity.COD_UF,
  };
}

export function transformEmailSeller(
  entity: OrderEmailSellerEntity,
): UIOrderEmailSeller {
  return {
    sellerId: entity.ID_VENDEDOR,
    storeId: entity.ID_LOJA,
    name: entity.NOME,
    imagePath: entity.PATH_IMAGEM,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    email: entity.EMAIL,
  };
}
