import type {
  OrderB2bCustomerEntity,
  OrderB2bDetailsEntity,
  OrderB2bItemEntity,
  OrderB2bSellerEntity,
  OrderB2bSummaryEntity,
  OrderFindLatestEntity,
  OrderStatisticsCustomerEntity,
} from "../types/order-b2b-types";

// === UI Interfaces ===

export interface UIOrderB2bSummary {
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  totalOrderValue: string;
}

export interface UIOrderB2bDetails {
  orderId: number;
  storeId: number;
  customerId: number;
  sellerId: number;
  protocolId: number;
  orderLocationId: number;
  equipmentId: number | null;
  paymentFormId: number;
  cartId: number;
  carrierId: number;
  wholesaleFlag: number;
  discountValue: string;
  freightValue: string;
  stockStatusId: number;
  orderStatusId: number;
  financialStatusId: number;
  deliveryStatusId: number;
  orderStatus: string;
  financialStatus: string;
  deliveryStatus: string;
  stockStatus: string;
  orderDate: string | null;
  saleDate: string | null;
  pickupDate: string | null;
  stockDate: string | null;
  paymentDate: string | null;
  deliveryDate: string | null;
  createdAt: string;
  notes: string;
}

export interface UIOrderB2bItem {
  movementId: number;
  orderId: number;
  productId: number;
  ean: string;
  reference: string;
  sku: string | null;
  label: string;
  typeId: number;
  model: string;
  product: string;
  quantity: number;
  unitValue: string;
  discountValue: string;
  adminDiscountValue: string;
  additionValue: string;
  insuranceValue: string;
  promoCode: string | null;
  promotion: number;
  storeStock1: number;
  deposit1: number;
  imagePath: string;
  pagePath: string;
  warrantyDays: number;
  reversedQuantity: number;
  subtotalValue: string;
  totalDiscountValue: string;
  totalValue: string;
  createdAt: string;
  notes: string;
}

export interface UIOrderB2bCustomer {
  customerId: number;
  customerName: string;
  imagePath: string;
  createdAt: string;
  lastPurchaseDate: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  personTypeId: number;
  accountType: string;
  customerTypeId: number;
  accountStatus: string;
  cpf: string;
  rg: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  municipalityCode: number;
  stateCode: number;
  notes: string;
}

export interface UIOrderB2bSeller {
  sellerId: number;
  sellerName: string;
  sellerImage: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerEmail: string;
}

// === Transform Functions ===

export function transformSummaryEntity(
  entity: OrderB2bSummaryEntity,
): UIOrderB2bSummary {
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

export function transformDetailsEntity(
  entity: OrderB2bDetailsEntity,
): UIOrderB2bDetails {
  return {
    orderId: entity.ID_PEDIDO,
    storeId: entity.ID_LOJA,
    customerId: entity.ID_CLIENTE,
    sellerId: entity.ID_VENDEDOR,
    protocolId: entity.ID_PROTOCOLO,
    orderLocationId: entity.ID_LOCALIZACAO_PED,
    equipmentId: entity.ID_EQUIPAMENTO,
    paymentFormId: entity.ID_PG_FORMA,
    cartId: entity.ID_CARRINHO,
    carrierId: entity.ID_TRANSPORTADORA,
    wholesaleFlag: entity.FLAG_VENDA_ATACADO,
    discountValue: entity.VL_DESCONTO,
    freightValue: entity.VL_FRETE,
    stockStatusId: entity.ID_STATUS_ESTOQUE,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatus: entity.STATUS_FINANCEIRO,
    deliveryStatus: entity.STATUS_ENTREGA,
    stockStatus: entity.STATUS_ESTOQUE,
    orderDate: entity.DATA_PEDIDO,
    saleDate: entity.DATA_VENDA,
    pickupDate: entity.DATA_RETIRADA,
    stockDate: entity.DATA_ESTOQUE,
    paymentDate: entity.DATA_PAGAMENTO,
    deliveryDate: entity.DATA_ENTREGA,
    createdAt: entity.DATADOCADASTRO,
    notes: entity.ANOTACOES,
  };
}

export function transformItemEntity(
  entity: OrderB2bItemEntity,
): UIOrderB2bItem {
  return {
    movementId: entity.ID_MOVIMENTO,
    orderId: entity.ID_PEDIDO,
    productId: entity.ID_PRODUTO,
    ean: entity.EAN,
    reference: entity.REF,
    sku: entity.SKU,
    label: entity.ETIQUETA,
    typeId: entity.ID_TIPO,
    model: entity.MODELO,
    product: entity.PRODUTO,
    quantity: entity.QT,
    unitValue: entity.VL_UNITARIO,
    discountValue: entity.VL_DESCONTO,
    adminDiscountValue: entity.VL_DESCONTO_ADM,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    promoCode: entity.CODIGOP,
    promotion: entity.PROMOCAO,
    storeStock1: entity.ESTOQUE_LOJA1,
    deposit1: entity.DEPOSITO1,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    reversedQuantity: entity.QT_ESTORNADA,
    subtotalValue: entity.VL_SUBTOTAL,
    totalDiscountValue: entity.VL_DESCONTO_TOTAL,
    totalValue: entity.VL_TOTAL,
    createdAt: entity.DATADOCADASTRO,
    notes: entity.ANOTACOES,
  };
}

export function transformCustomerEntity(
  entity: OrderB2bCustomerEntity,
): UIOrderB2bCustomer {
  return {
    customerId: entity.ID_CLIENTE,
    customerName: entity.NOME_CLIENTE,
    imagePath: entity.PATH_IMAGEM,
    createdAt: entity.DATADOCADASTRO,
    lastPurchaseDate: entity.DT_ULTIMA_COMPRA,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    email: entity.EMAIL,
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    cpf: entity.CPF,
    rg: entity.RG,
    companyName: entity.RAZAO_SOCIAL,
    tradeName: entity.NOME_FANTASIA,
    cnpj: entity.CNPJ,
    stateRegistration: entity.INSC_ESTADUAL,
    municipalRegistration: entity.INSC_MUNICIPAL,
    zipCode: entity.CEP,
    address: entity.ENDERECO,
    addressNumber: entity.ENDERECO_NUMERO,
    complement: entity.COMPLEMENTO,
    neighborhood: entity.BAIRRO,
    city: entity.CIDADE,
    state: entity.UF,
    country: entity.PAIS,
    municipalityCode: entity.COD_MUNICIPIO,
    stateCode: entity.COD_UF,
    notes: entity.ANOTACOES,
  };
}

export function transformSellerEntity(
  entity: OrderB2bSellerEntity,
): UIOrderB2bSeller {
  return {
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.NOME_VENDEDOR,
    sellerImage: entity.IMAGEM_VENDEDOR,
    sellerPhone: entity.TELEFONE_VENDEDOR,
    sellerWhatsapp: entity.WHATSAPP_VENDEDOR,
    sellerEmail: entity.EMAIL_VENDEDOR,
  };
}

// === UI Interfaces - Order Find Latest ===

export interface UIOrderFindLatest {
  orderDate: string;
  customerId: number;
  customerName: string;
  orderId: number;
  orderStatusId: number;
  financialStatusId: number;
  deliveryStatusId: number;
  orderStatus: string;
  financialStatus: string;
  deliveryStatus: string;
  itemCount: number;
  freightValue: string;
  discountValue: string;
  totalValue: string;
}

export function transformFindLatestEntity(
  entity: OrderFindLatestEntity,
): UIOrderFindLatest {
  return {
    orderDate: entity.DATA_PEDIDO,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE,
    orderId: entity.ID_PEDIDO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatus: entity.STATUS_FINANCEIRO,
    deliveryStatus: entity.STATUS_ENTREGA,
    itemCount: entity.QT_ITENS,
    freightValue: entity.VL_FRETE,
    discountValue: entity.VL_DESCONTO,
    totalValue: entity.VL_TOTAL,
  };
}

// === UI Interfaces - Order Statistics Customer ===

export interface UIOrderStatisticsCustomer {
  customerId: number;
  customerName: string;
  totalOrders: number;
  totalItems: string;
  averageTicket: string;
  totalValue: string;
}

export function transformStatisticsCustomerEntity(
  entity: OrderStatisticsCustomerEntity,
): UIOrderStatisticsCustomer {
  return {
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE,
    totalOrders: entity.QT_PEDIDOS,
    totalItems: entity.QT_ITENS,
    averageTicket: entity.TICKET_MEDIO,
    totalValue: entity.TOTAL_GERAL_PEDIDO,
  };
}
