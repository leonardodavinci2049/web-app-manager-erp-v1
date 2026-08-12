import type {
  OrderCarrierEntity,
  OrderCustomerEntity,
  OrderDashboardDetailsEntity,
  OrderDashboardItemEntity,
  OrderDeliveryEntity,
  OrderEquipmentEntity,
  OrderHistoryEntity,
  OrderNfEntity,
  OrderPgFormaEntity,
  OrderProtocolEntity,
  OrderSalesSummaryEntity,
  OrderSellerEntity,
} from "../types/order-sales-types";

// === UI Interfaces ===

export interface UIOrderCarrier {
  orderId: number;
  carrierId: number;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  addressNumber: string;
  city: string;
  state: string;
}

export interface UIOrderCustomer {
  customerId: number;
  customerName: string;
  hasFreeShipping: boolean;
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

export interface UIOrderDelivery {
  orderId: number;
  customerId: number;
  deliveryTypeId: number | null;
  deliveryUser: string | null;
  priority: number | null;
  freightTypeId: number;
  shippingFormatId: number;
  freightType: string;
  deliveryDays: number;
  volumeCount: number;
  trackingCode: string;
  freightValue: string;
  freightWeight: number | null;
  volumeHeight: number;
  volumeWidth: number;
  volumeLength: number;
  budgetDate: string;
  orderDate: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  createdAt: string;
  notes: string;
}

export interface UIOrderHistory {
  orderId: number;
  customerId: number;
  budgetStatusId: number;
  orderStatusId: number;
  deliveryStatusId: number;
  stockStatusId: number;
  financialStatusId: number;
  orderStatus: string;
  financialStatus: string;
  deliveryStatus: string;
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
}

export interface UIOrderNf {
  orderId: number;
  customerId: number;
  nfeKey: string | null;
  nfeLot: string | null;
  nfeNumber: string | null;
  nfeOperation: string | null;
  nfeReturnKey: string | null;
  nfse: string | null;
  invoiceInfo: string | null;
  notes: string;
  createdAt: string;
}

export interface UIOrderPgForma {
  orderId: number;
  customerId: number;
  paymentFormId: number;
  paymentForm: string;
  installmentCount: number;
  factorValue: string;
  financialRate: string;
  discountRate: string;
  promoCode: string;
  promoCodeDiscount: string;
  discountValue: string;
}

export interface UIOrderProtocol {
  orderId: number;
  customerId: number;
  protocolId: number;
  pickupDate: string | null;
  pickupUserId: number;
  pickupUserName: string;
}

export interface UIOrderSeller {
  sellerId: number;
  sellerName: string;
  sellerImage: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerEmail: string;
}

export interface UIOrderSalesSummary {
  orderId: number;
  itemCount: number;
  subtotalValue: string;
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  discountValue: string;
  totalOrderValue: string;
}

export interface UIOrderDashboardDetails {
  orderId: number;
  storeId: number;
  customerId: number;
  sellerId: number;
  protocolId: number;
  locationId: number;
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

export interface UIOrderDashboardItem {
  movementId: number;
  orderId: number;
  productId: number;
  ean: string;
  ref: string;
  sku: string | null;
  label: string;
  typeId: number;
  model: string;
  product: string;
  quantity: number;
  unitValue: string;
  discountValue: string;
  discountAdmValue: string;
  additionValue: string;
  insuranceValue: string;
  promoCode: string | null;
  promotion: number;
  storeStock: number;
  warehouseStock: number;
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

export interface UIOrderEquipment {
  orderId: number;
  customerId: number;
  entry: string;
  defect: string;
  report: string;
  notes: string;
  createdAt: string;
}

// === Transform Functions ===

export function transformCarrierEntity(
  entity: OrderCarrierEntity,
): UIOrderCarrier {
  return {
    orderId: entity.ID_PEDIDO,
    carrierId: entity.ID_TRANSPORTADORA,
    name: entity.NOME,
    phone: entity.FONE1,
    whatsapp: entity.WHATAPP1,
    email: entity.EMAIL1,
    cnpj: entity.CNPJ,
    stateRegistration: entity.INSC_ESTADUAL,
    address: entity.ENDERECO,
    addressNumber: entity.ENDERECO_NUMERO,
    city: entity.CIDADE,
    state: entity.UF,
  };
}

export function transformCustomerEntity(
  entity: OrderCustomerEntity,
): UIOrderCustomer {
  return {
    customerId: entity.ID_CLIENTE,
    customerName: entity.NOME_CLIENTE,
    hasFreeShipping: Number(entity.FLAG_FRETE_GRATIS) === 1,
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

export function transformDeliveryEntity(
  entity: OrderDeliveryEntity,
): UIOrderDelivery {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    deliveryTypeId: entity.ID_TIPO_ENTREGA,
    deliveryUser: entity.USUARIO_ENTREGA,
    priority: entity.PRIORIDADE,
    freightTypeId: entity.ID_TIPO_FRETE,
    shippingFormatId: entity.ID_FORMATO_ENVIO,
    freightType: entity.TIPO_FRETE,
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
    pickupDate: entity.DATA_RETIRADA,
    deliveryDate: entity.DATA_ENTREGA,
    createdAt: entity.DATADOCADASTRO,
    notes: entity.ANOTACOES,
  };
}

export function transformHistoryEntity(
  entity: OrderHistoryEntity,
): UIOrderHistory {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    budgetStatusId: entity.ID_STATUS_ORCAMENTO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    deliveryStatusId: entity.ID_STATUS_ENTREGA,
    stockStatusId: entity.ID_STATUS_ESTOQUE,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatus: entity.STATUS_FINANCEIRO,
    deliveryStatus: entity.STATUS_ENTREGA,
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
  };
}

export function transformNfEntity(entity: OrderNfEntity): UIOrderNf {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    nfeKey: entity.NFE_CHAVE,
    nfeLot: entity.NFE_LOTE,
    nfeNumber: entity.NFE_NUMERO,
    nfeOperation: entity.NFE_OPERACAO,
    nfeReturnKey: entity.NFE_CHAVE_DEVOLUCAO,
    nfse: entity.NFSE,
    invoiceInfo: entity.INFO_NOTAFISCAL,
    notes: entity.ANOTACOES,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformPgFormaEntity(
  entity: OrderPgFormaEntity,
): UIOrderPgForma {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    paymentFormId: entity.ID_PG_FORMA,
    paymentForm: entity.PG_FORMA,
    installmentCount: entity.QT_PARCELA,
    factorValue: entity.VL_FATOR,
    financialRate: entity.TX_PG_FINANCEIRA,
    discountRate: entity.TX_PG_DESCONTO,
    promoCode: entity.CODIGOP,
    promoCodeDiscount: entity.TX_DESCONTO_CODP,
    discountValue: entity.VL_DESCONTO,
  };
}

export function transformProtocolEntity(
  entity: OrderProtocolEntity,
): UIOrderProtocol {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    protocolId: entity.ID_PROTOCOLO,
    pickupDate: entity.DATA_RETIRADA_PROT,
    pickupUserId: entity.ID_USUARIO_RETIRADA,
    pickupUserName: entity.USUARIO_RETIRADA,
  };
}

export function transformSellerEntity(
  entity: OrderSellerEntity,
): UIOrderSeller {
  return {
    sellerId: entity.ID_VENDEDOR,
    sellerName: entity.NOME_VENDEDOR,
    sellerImage: entity.IMAGEM_VENDEDOR,
    sellerPhone: entity.TELEFONE_VENDEDOR,
    sellerWhatsapp: entity.WHATSAPP_VENDEDOR,
    sellerEmail: entity.EMAIL_VENDEDOR,
  };
}

export function transformSummaryEntity(
  entity: OrderSalesSummaryEntity,
): UIOrderSalesSummary {
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

export function transformDashboardDetailsEntity(
  entity: OrderDashboardDetailsEntity,
): UIOrderDashboardDetails {
  return {
    orderId: entity.ID_PEDIDO,
    storeId: entity.ID_LOJA,
    customerId: entity.ID_CLIENTE,
    sellerId: entity.ID_VENDEDOR,
    protocolId: entity.ID_PROTOCOLO,
    locationId: entity.ID_LOCALIZACAO_PED,
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

export function transformDashboardItemEntity(
  entity: OrderDashboardItemEntity,
): UIOrderDashboardItem {
  return {
    movementId: entity.ID_MOVIMENTO,
    orderId: entity.ID_PEDIDO,
    productId: entity.ID_PRODUTO,
    ean: entity.EAN,
    ref: entity.REF,
    sku: entity.SKU,
    label: entity.ETIQUETA,
    typeId: entity.ID_TIPO,
    model: entity.MODELO,
    product: entity.PRODUTO,
    quantity: entity.QT,
    unitValue: entity.VL_UNITARIO,
    discountValue: entity.VL_DESCONTO,
    discountAdmValue: entity.VL_DESCONTO_ADM,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    promoCode: entity.CODIGOP,
    promotion: entity.PROMOCAO,
    storeStock: entity.ESTOQUE_LOJA1,
    warehouseStock: entity.DEPOSITO1,
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

export function transformEquipmentEntity(
  entity: OrderEquipmentEntity,
): UIOrderEquipment {
  return {
    orderId: entity.ID_PEDIDO,
    customerId: entity.ID_CLIENTE,
    entry: entity.ENTRADA,
    defect: entity.DEFEITO,
    report: entity.LAUDO,
    notes: entity.ANOTACOES,
    createdAt: entity.DATADOCADASTRO,
  };
}
