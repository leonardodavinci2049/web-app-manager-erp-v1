import type {
  OrderItemCustomerEntity,
  PhysicalProductEntity,
  PhysicalProductWarrantyEntity,
} from "../types/physical-product-types";

export interface UIPhysicalProduct {
  physicalId: number;
  storeId: number;
  productId: number;
  productName: string;
  warrantyMonths: number;
  imported: number;
  label: string;
  serialNumber: string | null;
  barcode: string | null;
  size: string | null;
  description: string | null;
  supplier: string | null;
  freighter: string | null;
  companyId: number;
  entryId: number;
  entryMovementId: number;
  lastEntryDate: string | null;
  entryDate: string | null;
  entryInvoice: string | null;
  costValue: string | null;
  orderDate: string | null;
  orderId: number | null;
  orderMovementId: number | null;
  statusId: number;
  customerId: number | null;
  customerName: string | null;
  customerTypeId: number | null;
  saleValue: string | null;
  sellerName: string | null;
  stock: number;
  locationId: number;
  location: string | null;
  pickupDate: string | null;
  time: string | null;
  date: string | null;
  outputInvoice: string | null;
  rmaStatusId: number;
  warrantyDate: string | null;
  history: string | null;
  createdAt: string | null;
}

export interface UIOrderItemCustomer {
  movementId: number;
  orderId: number;
  orderDate: string | null;
  orderStatusId: number;
  orderStatus: string;
  productId: number;
  description: string;
  quantity: number;
  unitValue: string;
  model: string;
  reference: string;
  label: string;
  typeId: number;
  type: string;
  brandId: number;
  brand: string;
  imagePath: string;
  pagePath: string;
  warrantyDays: number;
  reversedQuantity: number;
  adminDiscountValue: string;
  discountValue: string;
  totalDiscountValue: string;
  subtotalValue: string;
  totalValue: string;
  financialStatusId: number;
  financialStatus: string;
  customerId: number;
  customerName: string;
  personTypeId: number;
  accountType: string;
  customerTypeId: number;
  accountStatus: string;
  sellerName: string;
  createdAt: string;
}

export interface UIPhysicalProductWarranty {
  warrantyId: number;
  productId: number | null;
  productName: string;
  typeId: number;
  type: string;
  brandId: number;
  brand: string;
  warrantyDays: number;
  label: string;
  serialNumber: string | null;
  barcode: string | null;
  location: string | null;
  orderDate: string | null;
  orderId: number;
  movementId: number;
  orderStatusId: number;
  orderStatus: string;
  financialStatusId: number;
  financialStatus: string;
  customerId: number;
  customerName: string;
  personTypeId: number;
  accountType: string;
  customerTypeId: number;
  accountStatus: string;
  sellerName: string;
  saleValue: string;
  pickupDate: string | null;
  warrantyLimit: string | null;
  warrantyStatus: string;
}

export function transformPhysicalProduct(
  entity: PhysicalProductEntity,
): UIPhysicalProduct {
  return {
    physicalId: entity.ID_FISICO,
    storeId: entity.ID_LOJA,
    productId: entity.ID_PRODUTO,
    productName: entity.PRODUTO,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    imported: entity.IMPORTADO,
    label: entity.ETIQUETA,
    serialNumber: entity.N_SERIE,
    barcode: entity.COD_BARRAS,
    size: entity.TAMANHO,
    description: entity.DESCRICAO,
    supplier: entity.FORNECEDOR,
    freighter: entity.FRETADOR,
    companyId: entity.ID_EMPRESA,
    entryId: entity.ID_ENTRADA,
    entryMovementId: entity.ID_ENTRADA_MOVIMENTO,
    lastEntryDate: entity.DATA_ULT_ENTRADA,
    entryDate: entity.DT_ENTRADA,
    entryInvoice: entity.NF_ENTRADA,
    costValue: entity.VL_CUSTO,
    orderDate: entity.DATA_PEDIDO,
    orderId: entity.ID_PEDIDO,
    orderMovementId: entity.ID_PEDIDO_MOVIMENTO,
    statusId: entity.ID_STATUS,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE,
    customerTypeId: entity.id_tipo_cliente,
    saleValue: entity.VL_VENDA,
    sellerName: entity.VENDEDOR,
    stock: entity.ESTOQUE,
    locationId: entity.ID_LOCALIZACAO,
    location: entity.LOCATION,
    pickupDate: entity.DT_RETIRADA,
    time: entity.HORA,
    date: entity.DATA,
    outputInvoice: entity.NF_SAIDA,
    rmaStatusId: entity.ID_STATUSRMA,
    warrantyDate: entity.GARANTIA,
    history: entity.HISTORICO,
    createdAt: entity.DT_CADASTRO,
  };
}

export function transformOrderItemCustomer(
  entity: OrderItemCustomerEntity,
): UIOrderItemCustomer {
  return {
    movementId: entity.ID_MOVIMENTO,
    orderId: entity.ID_PEDIDO,
    orderDate: entity.DATA_PEDIDO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    orderStatus: entity.STATUS_PEDIDO,
    productId: entity.ID_PRODUTO,
    description: entity.DESCRICAO,
    quantity: entity.QT,
    unitValue: entity.VL_UNITARIO,
    model: entity.MODELO,
    reference: entity.REF,
    label: entity.ETIQUETA,
    typeId: entity.ID_TIPO,
    type: entity.TIPO,
    brandId: entity.ID_MARCA,
    brand: entity.MARCA,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    reversedQuantity: entity.QT_ESTORNADA,
    adminDiscountValue: entity.VL_DESCONTO_ADM,
    discountValue: entity.VL_DESCONTO,
    totalDiscountValue: entity.VL_DESCONTO_TOTAL,
    subtotalValue: entity.VL_SUBTOTAL,
    totalValue: entity.VL_TOTAL,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    financialStatus: entity.STATUS_FINANCEIRO,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE,
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    sellerName: entity.VENDEDOR,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformPhysicalProductWarranty(
  entity: PhysicalProductWarrantyEntity,
): UIPhysicalProductWarranty {
  return {
    warrantyId: entity.GARANTIA_ID,
    productId: entity.ID_PRODUTO ?? null,
    productName: entity.PRODUTO,
    typeId: entity.ID_TIPO,
    type: entity.TIPO,
    brandId: entity.ID_MARCA,
    brand: entity.MARCA,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    label: entity.ETIQUETA,
    serialNumber: entity.N_SERIE,
    barcode: entity.COD_BARRAS,
    location: entity.LOCATION,
    orderDate: entity.DATA_PEDIDO,
    orderId: entity.ID_PEDIDO,
    movementId: entity.ID_MOVIMENTO,
    orderStatusId: entity.ID_STATUS_PEDIDO,
    orderStatus: entity.STATUS_PEDIDO,
    financialStatusId: entity.ID_STATUS_FINANCEIRO,
    financialStatus: entity.STATUS_FINANCEIRO,
    customerId: entity.ID_CLIENTE,
    customerName: entity.CLIENTE,
    personTypeId: entity.ID_PESSOA_TIPO,
    accountType: entity.ACCOUNT_TIPO,
    customerTypeId: entity.ID_TIPO_CLIENTE,
    accountStatus: entity.ACCOUNT_STATUS,
    sellerName: entity.VENDEDOR,
    saleValue: entity.VL_VENDA,
    pickupDate: entity.DT_RETIRADA,
    warrantyLimit: entity.GARANTIA_LIMITE,
    warrantyStatus: entity.STATUS_GARANTIA,
  };
}

export const transformPhysicalProducts = (
  entities: PhysicalProductEntity[],
): UIPhysicalProduct[] => entities.map(transformPhysicalProduct);

export const transformOrderItemsCustomer = (
  entities: OrderItemCustomerEntity[],
): UIOrderItemCustomer[] => entities.map(transformOrderItemCustomer);

export const transformPhysicalProductWarranties = (
  entities: PhysicalProductWarrantyEntity[],
): UIPhysicalProductWarranty[] =>
  entities.map(transformPhysicalProductWarranty);
