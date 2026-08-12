import type {
  OrderCustomerAllEntity,
  OrderCustomerInfoEntity,
  OrderReportItemEntity,
  OrderReportListEntity,
  OrderSaleDetailEntity,
  OrderSellerInfoEntity,
  OrderShippingInfoEntity,
  OrderStatusHistoryEntity,
  OrderSummaryEntity,
  OrderTradingInfoEntity,
} from "../types/order-reports-types";

// === UI Interfaces ===

export interface UIOrderListItem {
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  totalOrderValue: string;
  customerId: number;
  sellerId: number;
  customerName: string;
  sellerName: string;
  location: string;
  paymentFormId: number;
  paymentForm: string;
  budgetStatusId: number;
  orderStatusId: number;
  deliveryStatusId: number;
  stockStatusId: number;
  financialStatusId: number;
  wholesaleFlag: number;
  orderStatus: string;
  financialStatus: string;
  budgetDate: string;
  orderDate: string;
  saleDate: string | null;
  deliveryDate: string | null;
  createdAt: string;
}

export interface UIOrderReportListItem {
  orderId: number;
  saleDate: string | null;
  customerId: number;
  customerName: string;
  sellerId: number;
  sellerName: string;
  rateType: string;
  orderStatus: string;
  financialStatus: string;
  deliveryStatus: string;
  stockStatus: string;
  itemCount: number;
  subtotalValue: string;
  insuranceValue: string;
  additionValue: string;
  freightValue: string;
  discountValue: string;
  totalOrderValue: string;
  baseCommissionValue: string;
  avgWholesaleCommission: string;
  avgRetailCommission: string;
  sellerCommissionValue: string;
  paymentForm: string;
  location: string;
  orderStatusId: number;
  financialStatusId: number;
  commissionFlag: number;
  wholesaleFlag: number;
  budgetDate: string;
  orderDate: string;
  releaseDate: string | null;
  deliveryDate: string | null;
  reversalDate: string | null;
}

export interface UIOrderSummary {
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  totalOrderValue: string;
  baseCommissionValue?: string;
  avgWholesaleCommission?: string;
  avgRetailCommission?: string;
  sellerCommissionValue?: string;
}

export interface UIOrderReportItem {
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

export interface UIOrderStatusHistory {
  orderId: number;
  budgetDate: string;
  orderDate: string;
  saleDate: string | null;
  paymentDate: string | null;
  deliveryDate: string | null;
  reversalDate: string | null;
}

export interface UIOrderCustomerInfo {
  customerId: number;
  customerName: string;
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
}

export interface UIOrderSellerInfo {
  sellerId: number;
  sellerName: string;
  sellerImage: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerEmail: string;
}

export interface UIOrderSaleDetail {
  orderId: number;
  customerId: number;
  customerName: string;
  sellerId: number;
  sellerName: string;
  rateType: string;
  paymentFormId: number;
  paymentForm: string;
  location: string;
  equipmentId: number | null;
  deliveryUser: string | null;
  installmentCount: number;
  factorValue: string;
  financialRate: string;
  discountRate: string;
  promoCode: string;
  promoCodeDiscount: string;
  discountValue: string;
  budgetStatusId: number;
  orderStatusId: number;
  deliveryStatusId: number;
  stockStatusId: number;
  financialStatusId: number;
  wholesaleFlag: number;
  orderStatus: string;
  financialStatus: string;
  deliveryStatus: string;
  stockStatus: string;
  deliveryTypeId: number | null;
  priority: string;
  freightTypeId: number;
  shippingFormatId: number;
  deliveryDays: number;
  volumeCount: number;
  trackingCode: string;
  freightValue: string;
  freightWeight: number | null;
  volumeHeight: number;
  volumeWidth: number;
  volumeLength: number;
  budgetDate: string;
  orderDate: string;
  saleDate: string | null;
  releaseDate: string | null;
  pickupDate: string | null;
  paymentDate: string | null;
  stockDate: string | null;
  reversalDate: string | null;
  deliveryDate: string | null;
  date: string;
  time: string;
  budgetExpiryDate: string | null;
  createdAt: string;
  equipment: string | null;
  model: string | null;
  serial: string | null;
  outsourced: string | null;
  technician: string | null;
  serviceOrderStatusId: number | null;
  serviceOrderStatus: string | null;
  entry: string | null;
  defect: string | null;
  report: string | null;
  notes: string;
  protocolId: number;
  nfeKey: string | null;
  nfeLot: string | null;
  nfeNumber: string | null;
  nfeOperation: string | null;
  nfeReturnKey: string | null;
  nfse: string | null;
  invoiceInfo: string | null;
}

export interface UIOrderTradingInfo {
  protocolId: number;
  pickupDate: string | null;
  pickupUserId: number;
  pickupUserName: string;
}

export interface UIOrderShippingInfo {
  carrierId: number;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  cnpj: string;
  stateRegistration: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  city: string;
  state: string;
}

// === Transform Functions ===

export function transformCustomerAllEntity(
  entity: OrderCustomerAllEntity,
): UIOrderListItem {
  return {
    orderId: entity.ID_PEDIDO,
    itemCount: entity.QT_ITENS,
    subtotalValue: entity.VL_SUBTOTAL,
    freightValue: entity.VL_FRETE,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    discountValue: entity.VL_DESCONTO,
    totalOrderValue: entity.VL_TOTAL_PEDIDO,
    customerId: entity.ID_CLIENTE,
    sellerId: entity.ID_VENDEDOR,
    customerName: entity.NOMEDOCLIENTE,
    sellerName: entity.NOMEDOVENDEDOR,
    location: entity.LOCATION,
    paymentFormId: entity.ID_PG_FORMA,
    paymentForm: entity.PG_FORMA,
    budgetStatusId: entity.ID_STATUS_ORCAMENTO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    stockStatusId: entity.ID_STATUS_ESTOQUE,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    wholesaleFlag: entity.FLAG_VENDA_ATACADO,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatus: entity.STATUS_FINANCEIRO,
    budgetDate: entity.DATA_ORCAMENTO,
    orderDate: entity.DATA_PEDIDO,
    saleDate: entity.DATA_VENDA,
    deliveryDate: entity.DATA_ENTREGA,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformCustomerAllList(
  items: OrderCustomerAllEntity[],
): UIOrderListItem[] {
  return items.map(transformCustomerAllEntity);
}

export function transformReportListEntity(
  entity: OrderReportListEntity,
): UIOrderReportListItem {
  return {
    orderId: entity.ID_PEDIDO ?? entity.ID_PEDIDO ?? 0,
    saleDate: entity.DATA_VENDA,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE_NOME,
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.VENDEDOR_NOME,
    rateType: entity.TAXA_TIPO,
    orderStatus: entity.STATUS_PEDI,
    financialStatus: entity.STATUS_FINA,
    deliveryStatus: entity.STATUS_ENTR,
    stockStatus: entity.STATUS_ESTO,
    itemCount: entity.QT_ITENS,
    subtotalValue: entity.VL_SUBTOTAL,
    insuranceValue: entity.VL_SEGURO,
    additionValue: entity.VL_ACRESCIMO,
    freightValue: entity.VL_FRETE,
    discountValue: entity.VL_DESCONTO,
    totalOrderValue: entity.VL_TOTAL_PEDIDO,
    baseCommissionValue: entity.VL_TOTAL_BASE_COMISSAO,
    avgWholesaleCommission: entity.TX_MEDIA_COMISSAO_ATACADO,
    avgRetailCommission: entity.TX_MEDIA_COMISSAO_VAREJO,
    sellerCommissionValue: entity.VL_COMISSAO_VENDEDOR,
    paymentForm: entity.PG_FORMA,
    location: entity.LOCALIZACAO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    commissionFlag: entity.flag_comissao,
    wholesaleFlag: entity.FLAG_VENDA_ATACADO,
    budgetDate: entity.DATA_ORCAMENTO,
    orderDate: entity.DATA_PEDIDO,
    releaseDate: entity.DATA_LIBERACAO,
    deliveryDate: entity.DATA_ENTREGA,
    reversalDate: entity.DATA_ESTORNO,
  };
}

export function transformReportList(
  items: OrderReportListEntity[],
): UIOrderReportListItem[] {
  return items.map(transformReportListEntity);
}

export function transformSummaryEntity(
  entity: OrderSummaryEntity,
): UIOrderSummary {
  return {
    orderId: entity.ID_PEDIDO,
    itemCount: entity.QT_ITENS,
    subtotalValue: entity.VL_SUBTOTAL,
    freightValue: entity.VL_FRETE,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    discountValue: entity.VL_DESCONTO,
    totalOrderValue: entity.VL_TOTAL_PEDIDO,
    baseCommissionValue: entity.VL_TOTAL_BASE_COMISSAO,
    avgWholesaleCommission: entity.TX_MEDIA_COMISSAO_ATACADO,
    avgRetailCommission: entity.TX_MEDIA_COMISSAO_VAREJO,
    sellerCommissionValue: entity.VL_COMISSAO_VENDEDOR,
  };
}

export function transformReportItemEntity(
  entity: OrderReportItemEntity,
): UIOrderReportItem {
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

export function transformStatusHistoryEntity(
  entity: OrderStatusHistoryEntity,
): UIOrderStatusHistory {
  return {
    orderId: entity.ID_PEDIDO,
    budgetDate: entity.DATA_ORCAMENTO,
    orderDate: entity.DATA_PEDIDO,
    saleDate: entity.DATA_VENDA,
    paymentDate: entity.DATA_PAGAMENTO,
    deliveryDate: entity.DATA_ENTREGA,
    reversalDate: entity.DATA_ESTORNO,
  };
}

export function transformCustomerInfoEntity(
  entity: OrderCustomerInfoEntity,
): UIOrderCustomerInfo {
  return {
    customerId: entity.ID_CLIENTE,
    customerName: entity.NOME_CLIENTE,
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
  };
}

export function transformSellerInfoEntity(
  entity: OrderSellerInfoEntity,
): UIOrderSellerInfo {
  return {
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.NOME_VENDEDOR,
    sellerImage: entity.IMAGEM_VENDEDOR,
    sellerPhone: entity.TELEFONE_VENDEDOR,
    sellerWhatsapp: entity.WHATSAPP_VENDEDOR,
    sellerEmail: entity.EMAIL_VENDEDOR,
  };
}

export function transformSaleDetailEntity(
  entity: OrderSaleDetailEntity,
): UIOrderSaleDetail {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE_NOME,
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.VENDEDOR_NOME,
    rateType: entity.TAXA_TIPO,
    paymentFormId: entity.ID_PG_FORMA,
    paymentForm: entity.PG_FORMA,
    location: entity.LOCALIZACAO,
    equipmentId: entity.ID_EQUIPAMENTO,
    deliveryUser: entity.USUARIO_ENTREGA,
    installmentCount: entity.QT_PARCELA,
    factorValue: entity.VL_FATOR,
    financialRate: entity.TX_PG_FINANCEIRA,
    discountRate: entity.TX_PG_DESCONTO,
    promoCode: entity.CODIGOP,
    promoCodeDiscount: entity.TX_DESCONTO_CODP,
    discountValue: entity.VL_DESCONTO,
    budgetStatusId: entity.ID_STATUS_ORCAMENTO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    stockStatusId: entity.ID_STATUS_ESTOQUE,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    wholesaleFlag: entity.FLAG_VENDA_ATACADO,
    orderStatus: entity.STATUS_PEDI,
    financialStatus: entity.STATUS_FINA,
    deliveryStatus: entity.STATUS_ENTR,
    stockStatus: entity.STATUS_ESTO,
    deliveryTypeId: entity.ID_TIPO_ENTREGA,
    priority: entity.PRIORIDADE,
    freightTypeId: entity.ID_TIPO_FRETE,
    shippingFormatId: entity.ID_FORMATO_ENVIO,
    deliveryDays: entity.PRAZO_ENTREGA_DIA,
    volumeCount: entity.QT_VOLUME,
    trackingCode: entity.CODIGO_CORREIOS,
    freightValue: entity.VL_FRETE,
    freightWeight: entity.PESO_FRETE_GR,
    volumeHeight: entity.ALTURA_VOLUME,
    volumeWidth: entity.LARGURA_VOLUME,
    volumeLength: entity.COMPRIMENTO_VOLUME,
    budgetDate: entity.DATA_ORCAMENTO,
    orderDate: entity.DATA_PEDIDO,
    saleDate: entity.DATA_VENDA,
    releaseDate: entity.DATA_LIBERACAO,
    pickupDate: entity.DATA_RETIRADA,
    paymentDate: entity.DATA_PAGAMENTO,
    stockDate: entity.DATA_ESTOQUE,
    reversalDate: entity.DATA_ESTORNO,
    deliveryDate: entity.DATA_ENTREGA,
    date: entity.DATA,
    time: entity.HORA,
    budgetExpiryDate: entity.DATA_VALIDADE_ORC,
    createdAt: entity.DATADOCADASTRO,
    equipment: entity.EQUIPAMENTO,
    model: entity.MODELO,
    serial: entity.SERIAL,
    outsourced: entity.TERCEIRIZADO,
    technician: entity.TECNICO,
    serviceOrderStatusId: entity.ID_STATUS_OS,
    serviceOrderStatus: entity.STATUS_OS,
    entry: entity.ENTRADA,
    defect: entity.DEFEITO,
    report: entity.LAUDO,
    notes: entity.ANOTACOES,
    protocolId: entity.ID_PROTOCOLO,
    nfeKey: entity.NFE_CHAVE,
    nfeLot: entity.NFE_LOTE,
    nfeNumber: entity.NFE_NUMERO,
    nfeOperation: entity.NFE_OPERACAO,
    nfeReturnKey: entity.NFE_CHAVE_DEVOLUCAO,
    nfse: entity.NFSE,
    invoiceInfo: entity.INFO_NOTAFISCAL,
  };
}

export function transformTradingInfoEntity(
  entity: OrderTradingInfoEntity,
): UIOrderTradingInfo {
  return {
    protocolId: entity.ID_PROTOCOLO,
    pickupDate: entity.DATA_RETIRADA_PROT,
    pickupUserId: entity.ID_USUARIO_RETIRADA,
    pickupUserName: entity.USUARIO_RETIRADA,
  };
}

export function transformShippingInfoEntity(
  entity: OrderShippingInfoEntity,
): UIOrderShippingInfo {
  return {
    carrierId: entity.ID_TRANSPORTADORA,
    name: entity.NOME,
    phone: entity.FONE,
    whatsapp: entity.WHATSAPP,
    email: entity.EMAIL,
    cnpj: entity.CNPJ,
    stateRegistration: entity.INSC_ESTADUAL,
    zipCode: entity.CEP,
    address: entity.ENDERECO,
    addressNumber: entity.ENDERECO_NUMERO,
    city: entity.CIDADE,
    state: entity.UF,
  };
}
