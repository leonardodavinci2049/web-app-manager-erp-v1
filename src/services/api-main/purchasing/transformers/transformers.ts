import type {
  PurchasingDetail,
  PurchasingListItem,
  PurchasingRelatedCategory,
  PurchasingRelatedSupplier,
} from "../types/purchasing-types";

export interface UIPurchasingProduct {
  id: number;
  sku: number;
  name: string;
  shortDescription: string;
  label: string;
  ref: string;
  model: string;
  supplierId?: number;
  supplier?: string;
  deliveryDays?: number;
  deliveryHours?: number;
  type: string;
  typeId?: number;
  brand: string;
  brandId?: number;
  brandImagePath?: string;
  imageId?: number;
  imagePath?: string;
  pagePath?: string;
  slug?: string;
  storeStock: number;
  salesTwoMonthsAgo?: number;
  salesPreviousMonth?: number;
  salesCurrentMonth?: number;
  salesLast30Days?: number;
  salesToday?: number;
  lastSaleAt?: string;
  criticalityLevel?: string;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  storeFee?: string;
  goldPrice: string;
  silverPrice: string;
  bronzePrice: string;
  discount: string;
  warrantyMonths?: number;
  warrantyDays: number;
  weightGr?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  diameterMm?: number;
  cfop?: string;
  cst?: string;
  ean?: string;
  ncm?: number;
  nbm?: string;
  ppb?: number;
  temp?: string;
  salesDescription?: string;
  notes?: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
  featured?: boolean;
  isService?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categories?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function transformPurchasingListItem(
  entity: PurchasingListItem,
): UIPurchasingProduct {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    supplierId: entity.ID_FORNECEDOR,
    supplier: entity.FORNECEDOR,
    deliveryDays: entity.TEMPO_ENTREGA_DIA,
    deliveryHours: entity.TEMPO_ENTREGA_HORA,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    salesTwoMonthsAgo: entity.QT_VENDAS_HA_DOIS_MESES,
    salesPreviousMonth: entity.QT_VENDAS_MES_ANTERIOR,
    salesCurrentMonth: entity.QT_VENDAS_MES_ATUAL,
    salesLast30Days: entity.QT_VENDAS_30_DIAS,
    salesToday: entity.QT_VENDAS_HOJE,
    lastSaleAt: entity.DATA_ULT_VENDA ?? undefined,
    criticalityLevel: entity.CRITICALITY_LEVEL ?? undefined,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    storeFee: entity.TX_PRODUTO_LOJA,
    goldPrice: entity.OURO,
    silverPrice: entity.PRATA,
    bronzePrice: entity.BRONZE,
    discount: entity.DESCONTO,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    salesDescription: entity.DESCRICAO_VENDA ?? undefined,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
    categories: entity.CATEGORIAS || undefined,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformPurchasingList(
  items: PurchasingListItem[],
): UIPurchasingProduct[] {
  return items.map(transformPurchasingListItem);
}

export function transformPurchasingDetail(
  entity: PurchasingDetail,
): UIPurchasingProduct {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    supplierId: entity.ID_FORNECEDOR,
    supplier: entity.FORNECEDOR,
    deliveryDays: entity.TEMPO_ENTREGA_DIA,
    deliveryHours: entity.TEMPO_ENTREGA_HORA,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    salesTwoMonthsAgo: entity.QT_VENDAS_HA_DOIS_MESES,
    salesPreviousMonth: entity.QT_VENDAS_MES_ANTERIOR,
    salesCurrentMonth: entity.QT_VENDAS_MES_ATUAL,
    salesLast30Days: entity.QT_VENDAS_30_DIAS,
    salesToday: entity.QT_VENDAS_HOJE,
    lastSaleAt: entity.DATA_ULT_VENDA ?? undefined,
    criticalityLevel: entity.CRITICALITY_LEVEL ?? undefined,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    goldPrice: entity.OURO,
    silverPrice: entity.PRATA,
    bronzePrice: entity.BRONZE,
    discount: "0.000000",
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    weightGr: entity.PESO_GR,
    lengthMm: entity.COMPRIMENTO_MM,
    widthMm: entity.LARGURA_MM,
    heightMm: entity.ALTURA_MM,
    diameterMm: entity.DIAMETRO_MM,
    cfop: entity.CFOP || undefined,
    cst: entity.CST || undefined,
    ean: entity.EAN || undefined,
    ncm: entity.NCM,
    nbm: entity.NBM || undefined,
    ppb: entity.PPB,
    temp: entity.TEMP || undefined,
    salesDescription: entity.DESCRICAO_VENDA ?? undefined,
    notes: entity.ANOTACOES ?? undefined,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: false,
    featured: entity.DESTAQUE === 1,
    isService: entity.FLAG_SERVICO === 1,
    metaTitle: entity.META_TITLE ?? undefined,
    metaDescription: entity.META_DESCRIPTION ?? undefined,
    createdAt: entity.DATADOCADASTRO,
    updatedAt: entity.DT_UPDATE,
  };
}

export function transformPurchasing(
  entity: PurchasingListItem | PurchasingDetail | null | undefined,
): UIPurchasingProduct | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformPurchasingDetail(entity);
  }

  return transformPurchasingListItem(entity);
}

// --- Related Categories ---

export interface UIPurchasingRelatedCategory {
  taxonomyId: number;
  parentId: number;
  name: string;
  slug: string;
  order: number;
  level: number;
}

export function transformRelatedCategory(
  entity: PurchasingRelatedCategory,
): UIPurchasingRelatedCategory {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA,
    slug: entity.SLUG,
    order: entity.ORDEM,
    level: entity.LEVEL,
  };
}

export function transformRelatedCategories(
  items: PurchasingRelatedCategory[],
): UIPurchasingRelatedCategory[] {
  return items.map(transformRelatedCategory);
}

// --- Related Suppliers ---

export interface UIPurchasingRelatedSupplier {
  supplierId: number;
  name: string;
  imagePath?: string;
  productRef: string;
  whatsapp: string;
  phone: string;
  email: string;
  website: string;
  supplierRef: string;
  updatedAt?: string;
  registerCount: number;
}

export function transformRelatedSupplier(
  entity: PurchasingRelatedSupplier,
): UIPurchasingRelatedSupplier {
  return {
    supplierId: entity.ID_FORNECEDOR,
    name: entity.FORNECEDOR,
    imagePath: entity.PATH_IMAGEM || undefined,
    productRef: entity.REF_PRODUTO,
    whatsapp: entity.WHATSAPP,
    phone: entity.FONE,
    email: entity.EMAIL,
    website: entity.WEBSITE,
    supplierRef: entity.REF_FORNECEDOR,
    updatedAt: entity.DT_ATUALIZACAOO ?? undefined,
    registerCount: entity.QT_REGISTER,
  };
}

export function transformRelatedSuppliers(
  items: PurchasingRelatedSupplier[],
): UIPurchasingRelatedSupplier[] {
  return items.map(transformRelatedSupplier);
}
