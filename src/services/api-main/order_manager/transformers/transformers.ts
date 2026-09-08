import type {
  OrdersManagerCustomer,
  OrdersManagerData,
  OrdersManagerListItem,
  OrdersManagerOrderItem,
  OrdersManagerSeller,
  OrdersManagerStatusHistory,
} from "../types/order-manager-types";

// --- Order List Item ---

export interface UIOrdersManagerOrder {
  id: number;
  customerId: number;
  customerName: string;
  sellerId: number;
  sellerName: string;
  sellerImagePath: string;
  saleType: string;
  orderStatusId: number;
  orderStatus: string;
  financialStatusId: number;
  financialStatus: string;
  deliveryStatusId: number;
  deliveryStatus: string;
  hasCommission: boolean;
  wholesaleSaleFlag: number;
  itemsCount: number;
  soldProductsCount: number;
  subtotal: string;
  insurance: string;
  addition: string;
  freight: string;
  discount: string;
  total: string;
  commissionBase: string;
  averageCommissionRateWholesale: string;
  averageCommissionRateRetail: string;
  sellerCommission: string;
  paymentMethod?: string;
  location?: string;
  quoteAt?: string;
  orderedAt?: string;
  releasedAt?: string;
  soldAt?: string;
  deliveredAt?: string;
  reversedAt?: string;
}

export function transformOrdersManagerListItem(
  entity: OrdersManagerListItem,
): UIOrdersManagerOrder {
  return {
    id: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE_NOME,
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.VENDEDOR_NOME,
    sellerImagePath: entity.PATH_IMAGEM,
    saleType: entity.TIPO_VENDA,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    financialStatus: entity.STATUS_FINANCEIRO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    deliveryStatus: entity.STATUS_ENTREGA,
    hasCommission: entity.FLAG_COMISSAO === 1,
    wholesaleSaleFlag: entity.FLAG_VENDA_ATACADO,
    itemsCount: entity.QT_ITENS,
    soldProductsCount: entity.QT_PRODUTOS_VENDIDOS,
    subtotal: entity.VL_SUBTOTAL,
    insurance: entity.VL_SEGURO,
    addition: entity.VL_ACRESCIMO,
    freight: entity.VL_FRETE,
    discount: entity.VL_DESCONTO,
    total: entity.VL_TOTAL_PEDIDO,
    commissionBase: entity.VL_TOTAL_BASE_COMISSAO,
    averageCommissionRateWholesale: entity.TX_MEDIA_COMISSAO_ATACADO,
    averageCommissionRateRetail: entity.TX_MEDIA_COMISSAO_VAREJO,
    sellerCommission: entity.VL_COMISSAO_VENDEDOR,
    paymentMethod: entity.PG_FORMA ?? undefined,
    location: entity.LOCALIZACAO ?? undefined,
    quoteAt: entity.DATA_ORCAMENTO ?? undefined,
    orderedAt: entity.DATA_PEDIDO ?? undefined,
    releasedAt: entity.DATA_LIBERACAO ?? undefined,
    soldAt: entity.DATA_VENDA ?? undefined,
    deliveredAt: entity.DATA_ENTREGA ?? undefined,
    reversedAt: entity.DATA_ESTORNO ?? undefined,
  };
}

export function transformOrdersManagerOrderList(
  items: OrdersManagerListItem[],
): UIOrdersManagerOrder[] {
  return items.map(transformOrdersManagerListItem);
}

// --- Order Totals (ordersData) ---

export interface UIOrdersManagerOrderData {
  id: number;
  itemsCount: number;
  subtotal: string;
  insurance: string;
  addition: string;
  freight: string;
  discount: string;
  total: string;
  commissionBase: string;
  sellerCommission: string;
}

export function transformOrdersManagerData(
  entity: OrdersManagerData,
): UIOrdersManagerOrderData {
  return {
    id: entity.ID_PEDIDO,
    itemsCount: entity.QT_ITENS,
    subtotal: entity.VL_SUBTOTAL,
    insurance: entity.VL_SEGURO,
    addition: entity.VL_ACRESCIMO,
    freight: entity.VL_FRETE,
    discount: entity.VL_DESCONTO,
    total: entity.VL_TOTAL_PEDIDO,
    commissionBase: entity.VL_TOTAL_BASE_COMISSAO,
    sellerCommission: entity.VL_COMISSAO_VENDEDOR,
  };
}

// --- Order Items (ordersItems) ---

export interface UIOrdersManagerOrderItem {
  id: number;
  orderId: number;
  productId: number;
  sku: number;
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  addition: string;
  insurance: string;
  discount: string;
  freight: string;
  total: string;
  status?: string;
  imageId: number;
  imagePath: string;
  slug: string;
  warrantyMonths: number;
  warrantyDays: number;
  returnedQuantity: number;
  createdAt: string;
}

export function transformOrdersManagerOrderItem(
  entity: OrdersManagerOrderItem,
): UIOrdersManagerOrderItem {
  return {
    id: entity.ID_ITEM,
    orderId: entity.ID_PEDIDO,
    productId: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    quantity: entity.QT,
    unitPrice: entity.VL_UNITARIO,
    subtotal: entity.VL_SUBTOTAL,
    addition: entity.VL_ACRESCIMO,
    insurance: entity.VL_SEGURO,
    discount: entity.VL_DESCONTO,
    freight: entity.VL_FRETE,
    total: entity.VL_TOTAL,
    status: entity.STATUS ?? undefined,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM,
    slug: entity.SLUG,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    returnedQuantity: entity.QT_ESTORNADA,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformOrdersManagerOrderItems(
  items: OrdersManagerOrderItem[],
): UIOrdersManagerOrderItem[] {
  return items.map(transformOrdersManagerOrderItem);
}

// --- Status History (ordersStatusHistory) ---

export interface UIOrdersManagerStatusHistory {
  orderId: number;
  quoteAt?: string;
  orderedAt?: string;
  soldAt?: string;
  paidAt?: string;
  deliveredAt?: string;
  reversedAt?: string;
}

export function transformOrdersManagerStatusHistory(
  entity: OrdersManagerStatusHistory,
): UIOrdersManagerStatusHistory {
  return {
    orderId: entity.ID_PEDIDO,
    quoteAt: entity.DATA_ORCAMENTO ?? undefined,
    orderedAt: entity.DATA_PEDIDO ?? undefined,
    soldAt: entity.DATA_VENDA ?? undefined,
    paidAt: entity.DATA_PAGAMENTO ?? undefined,
    deliveredAt: entity.DATA_ENTREGA ?? undefined,
    reversedAt: entity.DATA_ESTORNO ?? undefined,
  };
}

// --- Customer (ordersCustomer) ---

export interface UIOrdersManagerCustomer {
  customerId: number;
  name: string;
  createdAt: string;
  lastPurchaseAt: string;
  phone: string;
  whatsapp: string;
  email: string;
  personTypeId: number;
  accountType: string;
  customerTypeId: number;
  accountStatus: string;
  cpf: string;
  rg: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  municipalityCode: number;
  stateCode: number;
}

export function transformOrdersManagerCustomer(
  entity: OrdersManagerCustomer,
): UIOrdersManagerCustomer {
  return {
    customerId: entity.ID_CLIENTE,
    name: entity.NOME_CLIENTE,
    createdAt: entity.DATADOCADASTRO,
    lastPurchaseAt: entity.DT_ULTIMA_COMPRA,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    email: entity.EMAIL,
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    cpf: entity.CPF,
    rg: entity.RG,
    legalName: entity.RAZAO_SOCIAL,
    tradeName: entity.NOME_FANTASIA,
    cnpj: entity.CNPJ,
    stateRegistration: entity.INSC_ESTADUAL,
    municipalRegistration: entity.INSC_MUNICIPAL,
    postalCode: entity.CEP,
    address: entity.ENDERECO,
    addressNumber: entity.ENDERECO_NUMERO,
    complement: entity.COMPLEMENTO,
    neighborhood: entity.BAIRRO,
    city: entity.CIDADE,
    state: entity.UF,
    country: entity.PAIS,
    municipalityCode: entity.COD_MUNICIPIO,
    stateCode: entity.COD_UF,
  };
}

// --- Seller (ordersSeller) ---

export interface UIOrdersManagerSeller {
  sellerId: number;
  name: string;
  imagePath: string;
  phone: string;
  whatsapp: string;
  email: string;
}

export function transformOrdersManagerSeller(
  entity: OrdersManagerSeller,
): UIOrdersManagerSeller {
  return {
    sellerId: entity.ID_VENDEDOR,
    name: entity.NOME_VENDEDOR,
    imagePath: entity.IMAGEM_VENDEDOR,
    phone: entity.TELEFONE_VENDEDOR,
    whatsapp: entity.WHATSAPP_VENDEDOR,
    email: entity.EMAIL_VENDEDOR,
  };
}
