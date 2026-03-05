import type {
  ProductDetail,
  ProductDetailCategory,
  ProductDetailRelated,
  ProductListItem,
  ProductSearchItem,
} from "../types/product-base-types";

export interface UIProduct {
  id: number;
  sku: number;
  name: string;
  tabDescription: string;
  label: string;
  ref: string;
  model: string;
  typeId: number;
  typeName: string;
  brandId: number;
  brandName: string;
  brandImagePath: string;
  imageId?: number;
  imagePath: string;
  pagePath: string;
  slug: string;
  stock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  storeTax: string;
  gold: string;
  silver: string;
  bronze: string;
  discount: string;
  warrantyMonths: number;
  warrantyDays: number;
  saleDescription: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
  categories?: string;
  createdAt: string;
}

export interface UIProductDetail {
  id: number;
  sku: number;
  name: string;
  tabDescription: string;
  label: string;
  ref: string;
  model: string;
  imagePath: string;
  pagePath: string;
  slug: string;
  typeId: number;
  typeName: string;
  brandId: number;
  brandName: string;
  brandImagePath: string;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  gold: string;
  silver: string;
  bronze: string;
  stock: number;
  warrantyDays: number;
  weightGr: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  diameterMm: number;
  cfop: string;
  cst: string;
  ean: string;
  ncm: number;
  nbm: string;
  ppb: number;
  temp: string;
  featured: boolean;
  promotion: boolean;
  service: boolean;
  imported: boolean;
  metaTitle: string;
  metaDescription: string;
  updatedAt?: string;
  saleDescription: string;
  notes?: string;
  createdAt: string;
  categories: UIProductCategory[];
  related: UIProductRelated[];
}

export interface UIProductCategory {
  id: number;
  parentId: number;
  name: string;
  slug: string;
  order: number;
  level: number;
}

export interface UIProductRelated {
  taxonomyId: number;
  sku: number;
  name: string;
  tabDescription: string;
  label: string;
  ref: string;
  model: string;
  imagePath: string;
  slug: string;
  stock: number;
  wholesalePrice: string;
  corporatePrice: string;
  retailPrice: string;
  imported: boolean;
  promotion: boolean;
  launch: boolean;
}

export function transformProductListItem(entity: ProductListItem): UIProduct {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    tabDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    typeId: entity.ID_TIPO,
    typeName: entity.TIPO,
    brandId: entity.ID_MARCA,
    brandName: entity.MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    slug: entity.SLUG,
    stock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    storeTax: entity.TX_PRODUTO_LOJA,
    gold: entity.OURO,
    silver: entity.PRATA,
    bronze: entity.BRONZE,
    discount: entity.DECONTO,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    saleDescription: entity.DESCRICAO_VENDA,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
    categories: entity.CATEGORIAS,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductList(items: ProductListItem[]): UIProduct[] {
  return items.map(transformProductListItem);
}

export function transformProductSearchItem(
  entity: ProductSearchItem,
): UIProduct {
  return {
    id: entity.ID_PRODUTO,
    sku: entity.SKU,
    name: entity.PRODUTO,
    tabDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    typeId: entity.ID_TIPO,
    typeName: entity.TIPO,
    brandId: entity.ID_MARCA,
    brandName: entity.MARCA,
    brandImagePath: entity.PATH_IMAGEM_MARCA,
    imageId: entity.ID_IMAGEM,
    imagePath: entity.PATH_IMAGEM,
    pagePath: entity.PATH_PAGE,
    slug: entity.SLUG,
    stock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    storeTax: entity.TX_PRODUTO_LOJA,
    gold: entity.OURO,
    silver: entity.PRATA,
    bronze: entity.BRONZE,
    discount: entity.DECONTO,
    warrantyMonths: entity.TEMPODEGARANTIA_MES,
    warrantyDays: entity.TEMPODEGARANTIA_DIA,
    saleDescription: entity.DESCRICAO_VENDA,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
    createdAt: entity.DATADOCADASTRO,
  };
}

export function transformProductSearchList(
  items: ProductSearchItem[],
): UIProduct[] {
  return items.map(transformProductSearchItem);
}

export function transformProductCategory(
  entity: ProductDetailCategory,
): UIProductCategory {
  return {
    id: entity.ID_TAXONOMY,
    parentId: entity.PARENT_ID,
    name: entity.TAXONOMIA,
    slug: entity.SLUG,
    order: entity.ORDEM,
    level: entity.LEVEL,
  };
}

export function transformProductRelated(
  entity: ProductDetailRelated,
): UIProductRelated {
  return {
    taxonomyId: entity.ID_TAXONOMY,
    sku: entity.SKU,
    name: entity.PRODUTO,
    tabDescription: entity.DESCRICAO_TAB,
    label: entity.ETIQUETA,
    ref: entity.REF,
    model: entity.MODELO,
    imagePath: entity.PATH_IMAGEM,
    slug: entity.SLUG,
    stock: entity.ESTOQUE_LOJA,
    wholesalePrice: entity.VL_ATACADO,
    corporatePrice: entity.VL_CORPORATIVO,
    retailPrice: entity.VL_VAREJO,
    imported: entity.IMPORTADO === 1,
    promotion: entity.PROMOCAO === 1,
    launch: entity.LANCAMENTO === 1,
  };
}

export function transformProductDetail(
  detail: ProductDetail,
  categories: ProductDetailCategory[] = [],
  related: ProductDetailRelated[] = [],
): UIProductDetail {
  return {
    id: detail.ID_PRODUTO,
    sku: detail.SKU,
    name: detail.PRODUTO,
    tabDescription: detail.DESCRICAO_TAB,
    label: detail.ETIQUETA,
    ref: detail.REF,
    model: detail.MODELO,
    imagePath: detail.PATH_IMAGEM,
    pagePath: detail.PATH_PAGE,
    slug: detail.SLUG,
    typeId: detail.ID_TIPO,
    typeName: detail.TIPO,
    brandId: detail.ID_MARCA,
    brandName: detail.MARCA,
    brandImagePath: detail.PATH_IMAGEM_MARCA,
    wholesalePrice: detail.VL_ATACADO,
    corporatePrice: detail.VL_CORPORATIVO,
    retailPrice: detail.VL_VAREJO,
    gold: detail.OURO,
    silver: detail.PRATA,
    bronze: detail.BRONZE,
    stock: detail.ESTOQUE_LOJA,
    warrantyDays: detail.TEMPODEGARANTIA_DIA,
    weightGr: detail.PESO_GR,
    lengthMm: detail.COMPRIMENTO_MM,
    widthMm: detail.LARGURA_MM,
    heightMm: detail.ALTURA_MM,
    diameterMm: detail.DIAMETRO_MM,
    cfop: detail.CFOP,
    cst: detail.CST,
    ean: detail.EAN,
    ncm: detail.NCM,
    nbm: detail.NBM,
    ppb: detail.PPB,
    temp: detail.TEMP,
    featured: detail.DESTAQUE === 1,
    promotion: detail.PROMOCAO === 1,
    service: detail.FLAG_SERVICO === 1,
    imported: detail.IMPORTADO === 1,
    metaTitle: detail.META_TITLE,
    metaDescription: detail.META_DESCRIPTION,
    updatedAt: detail.DT_UPDATE ?? undefined,
    saleDescription: detail.DESCRICAO_VENDA,
    notes: detail.ANOTACOES ?? undefined,
    createdAt: detail.DATADOCADASTRO,
    categories: categories.map(transformProductCategory),
    related: related.map(transformProductRelated),
  };
}
