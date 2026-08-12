import type {
  OrderItemDetailEntity,
  OrderItemListEntity,
} from "../types/order-items-types";

export interface UIOrderItem {
  id: number;
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
  promoCode: string | null;
  isPromotion: boolean;
  storeStock: number;
  warehouseStock: number;
  familyId?: number;
  imagePath: string;
  pagePath: string;
  warrantyDays: number;
  reversedQuantity: number;
  createdAt: string;
  totalDiscountValue: string;
  productCostValue: string;
  subtotalValue: string;
  totalValue: string;
  notes: string | null;
}

export interface UIOrderItemDetail extends UIOrderItem {
  freightValue: string;
  additionValue: string;
  insuranceValue: string;
  brandId: number;
  brandName: string;
  tabDescription: string;
  rmaId: number;
  returnDate: string | null;
  rmaSector: string | null;
  status: string | null;
  minStock: number;
  currentStock: number;
  shelfStock: number;
  gondolaStock: number;
  rowStock: number;
  imported: boolean;
  physicalControlFlag: boolean;
  stockControl: boolean;
  shippedPhysicalQt: number;
  shippingStatus: string | null;
  cfop: string | null;
  nfeDiscountValue: string;
  cest: number;
  cst: string;
  cstOutput: string;
  ncm: number;
  warrantyMonths: number;
  nfeCest: string;
  nfeCfopOutput: string;
  nfeCstCsosn: string;
  cfopOutput: string;
  websiteOffFlag: boolean;
  wholesaleValue: string;
  corporateValue: string;
  retailValue: string;
  icms: string;
  ipi: string;
  lossRate: string;
  stValue: string;
  icmsBase: string;
  icmsValueCalc: string;
  icmsRate: string;
  stBase: string;
  stValueCalc: string;
  stRate: string;
  ipiCenq: string;
  ipiCst: string;
  ipiBase: string;
  ipiValueCalc: string;
  ipiRate: string;
  additionalExpenses: string;
  equipmentId: number | null;
  emissionFlag: boolean;
  physicalId: number | null;
  serviceFlag: boolean;
}

export function transformOrderItemListEntity(
  entity: OrderItemListEntity,
): UIOrderItem {
  return {
    id: entity.ID_MOVIMENTO,
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
    promoCode: entity.CODIGOP,
    isPromotion: entity.PROMOCAO === 1,
    storeStock: entity.ESTOQUE_LOJA1,
    warehouseStock: entity.DEPOSITO1,
    familyId: entity.ID_FAMILIA,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    reversedQuantity: entity.QT_ESTORNADA,
    createdAt: entity.DATADOCADASTRO,
    totalDiscountValue: entity.VL_DESCONTO_TOTAL,
    productCostValue: entity.VL_CUSTO_PRODUTO,
    subtotalValue: entity.VL_SUBTOTAL,
    totalValue: entity.VL_TOTAL,
    notes: entity.ANOTACOES,
  };
}

export function transformOrderItemList(
  items: OrderItemListEntity[],
): UIOrderItem[] {
  return items.map(transformOrderItemListEntity);
}

export function transformOrderItemDetailEntity(
  entity: OrderItemDetailEntity,
): UIOrderItemDetail {
  return {
    id: entity.ID_MOVIMENTO,
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
    promoCode: entity.CODIGOP,
    isPromotion: entity.PROMOCAO === 1,
    storeStock: entity.ESTOQUE_LOJA1,
    warehouseStock: entity.DEPOSITO1,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    reversedQuantity: entity.QT_ESTORNADA,
    createdAt: entity.DATADOCADASTRO,
    totalDiscountValue: entity.VL_DESCONTO_TOTAL,
    productCostValue: entity.VL_CUSTO_PRODUTO,
    subtotalValue: entity.VL_SUBTOTAL,
    totalValue: entity.VL_TOTAL,
    notes: entity.ANOTACOES,
    freightValue: entity.VL_FRETE,
    additionValue: entity.VL_ACRESCIMO,
    insuranceValue: entity.VL_SEGURO,
    brandId: entity.ID_MARCA,
    brandName: entity.MARCA_NOME,
    tabDescription: entity.DESCRICAO_TAB,
    rmaId: entity.ID_RMA,
    returnDate: entity.DT_RETORNO,
    rmaSector: entity.SETOR_RMA,
    status: entity.STATUS,
    minStock: entity.ESTOQUE_MINIMO,
    currentStock: entity.ESTOQUE_ATUAL,
    shelfStock: entity.STQ_PRATELEIRA,
    gondolaStock: entity.STQ_GONDULA,
    rowStock: entity.STQ_FILEIRA,
    imported: entity.IMPORTADO === 1,
    physicalControlFlag: entity.FLAG_CONTROLE_FISICO === 1,
    stockControl: entity.CONTROLAR_ESTOQUE === 1,
    shippedPhysicalQt: entity.QT_FISICA_EXPEDIDA,
    shippingStatus: entity.STATUS_EXPEDICAO,
    cfop: entity.CFOP,
    nfeDiscountValue: entity.VL_NFE_DESC,
    cest: entity.CEST,
    cst: entity.CST,
    cstOutput: entity.CST_SAIDA,
    ncm: entity.NCM,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    nfeCest: entity.NFE_CEST,
    nfeCfopOutput: entity.NFE_CFOP_SAIDA,
    nfeCstCsosn: entity.NFE_CST_CSOSN,
    cfopOutput: entity.CFOP_SAIDA,
    websiteOffFlag: entity.FLAG_WEBSITE_OFF === 1,
    wholesaleValue: entity.VL_ATACADO1,
    corporateValue: entity.VL_CORPORATIVO1,
    retailValue: entity.VL_VAREJO1,
    icms: entity.ICMS,
    ipi: entity.IPI,
    lossRate: entity.TAXA_PERCA,
    stValue: entity.VL_ST,
    icmsBase: entity.ICMS_BC,
    icmsValueCalc: entity.ICMS_VALOR,
    icmsRate: entity.ICMS_ALIQUOTA,
    stBase: entity.ST_BC,
    stValueCalc: entity.ST_VALOR,
    stRate: entity.ST_ALIQUOTA,
    ipiCenq: entity.IPI_CENQ,
    ipiCst: entity.IPI_CST,
    ipiBase: entity.IPI_BC,
    ipiValueCalc: entity.IPI_VALOR,
    ipiRate: entity.IPI_ALIQUOTA,
    additionalExpenses: entity.VL_DESPESAS_ADICIONAIS,
    equipmentId: entity.ID_EQUIPAMENTO,
    emissionFlag: entity.FLAG_EMISSAO === 1,
    physicalId: entity.ID_FISICO,
    serviceFlag: entity.FLAG_SERVICO === 1,
  };
}

export function transformOrderItemDetailList(
  items: OrderItemDetailEntity[],
): UIOrderItemDetail[] {
  return items.map(transformOrderItemDetailEntity);
}

export function transformOrderItem(
  entity: OrderItemListEntity | OrderItemDetailEntity | null | undefined,
): UIOrderItem | UIOrderItemDetail | null {
  if (!entity) return null;

  if ("ID_MARCA" in entity) {
    return transformOrderItemDetailEntity(entity as OrderItemDetailEntity);
  }

  return transformOrderItemListEntity(entity as OrderItemListEntity);
}
