import type {
  ProductManagerDetail,
  ProductManagerListItem,
  ProductManagerRelatedCategory,
  ProductManagerRelatedProduct,
  ProductManagerSearchItem,
} from "../types/product-manager-types";

export interface UIProductManager {
  id: number;
  taxonomyId?: number;
  sku: number;
  name: string;
  shortDescription: string;
  label: string;
  ref: string;
  model: string;
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
  salesMonth?: number;
  salesLastThreeMonths?: number;
  salesYear?: number;
  salesAllTime?: number;
  lastSaleAt?: string;
  valueType?: string;
  productValue?: string;
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

export function transformProductManagerListItem(
  entity: ProductManagerListItem,
): UIProductManager {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
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
    salesMonth: entity.QT_VENDAS_MES,
    salesLastThreeMonths: entity.QT_VENDAS_3MESES,
    salesYear: entity.QT_VENDAS_ANO,
    salesAllTime: entity.QT_VENDAS_ALL,
    lastSaleAt: entity.DATA_ULT_VENDA ?? undefined,
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

export function transformProductManagerList(
  items: ProductManagerListItem[],
): UIProductManager[] {
  return items.map(transformProductManagerListItem);
}

export function transformProductManagerSearchItem(
  entity: ProductManagerSearchItem,
): UIProductManager {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
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
    valueType: entity.TIPO_VALOR,
    productValue: entity.VALOR_PRODUTO,
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
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductManagerSearchList(
  items: ProductManagerSearchItem[],
): UIProductManager[] {
  return items.map(transformProductManagerSearchItem);
}

export function transformProductManagerDetail(
  entity: ProductManagerDetail,
): UIProductManager {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    type: entity.TIPO,
    typeId: entity.ID_TIPO,
    brand: entity.MARCA,
    brandId: entity.ID_MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA || undefined,
    imagePath: entity.PATH_IMAGEM || undefined,
    pagePath: entity.PATH_PAGE || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    salesMonth: entity.QT_VENDAS_MES,
    salesLastThreeMonths: entity.QT_VENDAS_3MESES,
    salesYear: entity.QT_VENDAS_ANO,
    salesAllTime: entity.QT_VENDAS_ALL,
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

export function transformProductManagerDetailList(
  items: ProductManagerDetail[],
): UIProductManager[] {
  return items.map(transformProductManagerDetail);
}

export function transformProductManager(
  entity: ProductManagerListItem | ProductManagerDetail | null | undefined,
): UIProductManager | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformProductManagerDetail(entity as ProductManagerDetail);
  }

  return transformProductManagerListItem(entity as ProductManagerListItem);
}

// --- Related Categories ---

export interface UIProductManagerRelatedCategory {
  taxonomyId: number;
  parentId: number;
  name: string;
  slug: string;
  order: number;
  level: number;
}

export function transformRelatedCategory(
  entity: ProductManagerRelatedCategory,
): UIProductManagerRelatedCategory {
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
  items: ProductManagerRelatedCategory[],
): UIProductManagerRelatedCategory[] {
  return items.map(transformRelatedCategory);
}

// --- Related Products ---

export interface UIProductManagerRelatedProduct {
  taxonomyId: number;
  sku: number;
  name: string;
  shortDescription: string;
  label: string;
  ref: string;
  model: string;
  imagePath?: string;
  slug?: string;
  storeStock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
}

export function transformRelatedProduct(
  entity: ProductManagerRelatedProduct,
): UIProductManagerRelatedProduct {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    sku: entity.SKU,
    name: entity.PRODUTO,
    shortDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    imagePath: entity.PATH_IMAGEM || undefined,
    slug: entity.SLUG || undefined,
    storeStock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
  };
}

export function transformRelatedProducts(
  items: ProductManagerRelatedProduct[],
): UIProductManagerRelatedProduct[] {
  return items.map(transformRelatedProduct);
}
