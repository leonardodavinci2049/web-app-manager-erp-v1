import "server-only";

interface ProductBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface ProductBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface ProductFindAllRequest extends ProductBaseRequest {
  pe_search?: string;
  pe_taxonomy_id?: number;
  pe_type_id?: number;
  pe_brand_id?: number;
  pe_flag_stock?: number;
  pe_flag_service?: number;
  pe_records_quantity?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface ProductSearchAllRequest extends ProductBaseRequest {
  pe_customer_id?: number;
  pe_search: string;
  pe_flag_stock?: number;
  pe_records_quantity?: number;
}

export interface ProductFindByIdRequest extends ProductBaseRequest {
  pe_product_id: number;
}

export interface ProductCreateRequest extends ProductBaseRequest {
  pe_product_name: string;
  pe_tab_description?: string;
  pe_label?: string;
  pe_ref?: string;
  pe_model?: string;
  pe_product_type_id?: number;
  pe_brand_id?: number;
  pe_weight_gr?: number;
  pe_length_mm?: number;
  pe_width_mm?: number;
  pe_height_mm?: number;
  pe_diameter_mm?: number;
  pe_warranty_period_days?: number;
  pe_wholesale_price?: number;
  pe_retail_price?: number;
  pe_corporate_price?: number;
  pe_stock_quantity?: number;
  pe_website_off_flag?: number;
  pe_imported_flag?: number;
  pe_additional_info?: string;
}

export interface ProductListItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  ID_IMAGEM: number;
  PATH_IMAGEM_MARCA: string;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  TX_PRODUTO_LOJA: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  DECONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  CATEGORIAS: string;
  DATADOCADASTRO: string;
}

export interface ProductSearchItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  ESTOQUE_LOJA: number;
  TIPO_VALOR: string;
  VALOR_PRODUTO: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM_MARCA: string;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  TX_PRODUTO_LOJA: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  DECONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  DATADOCADASTRO: string;
}

export interface ProductDetail {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  SLUG: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM_MARCA: string;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  ESTOQUE_LOJA: number;
  TEMPODEGARANTIA_DIA: number;
  PESO_GR: number;
  COMPRIMENTO_MM: number;
  LARGURA_MM: number;
  ALTURA_MM: number;
  DIAMETRO_MM: number;
  CFOP: string;
  CST: string;
  EAN: string;
  NCM: number;
  NBM: string;
  PPB: number;
  TEMP: string;
  DESTAQUE: number;
  PROMOCAO: number;
  FLAG_SERVICO: number;
  IMPORTADO: number;
  META_TITLE: string;
  META_DESCRIPTION: string;
  DT_UPDATE: string | null;
  DESCRICAO_VENDA: string;
  ANOTACOES: string | null;
  DATADOCADASTRO: string;
}

export interface ProductDetailCategory {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  SLUG: string;
  ORDEM: number;
  LEVEL: number;
}

export interface ProductDetailRelated {
  ID_TAXONOMY: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  PATH_IMAGEM: string;
  SLUG: string;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface ProductFindAllResponse extends ProductBaseResponse {
  data: Record<string, ProductListItem[]>;
}

export interface ProductSearchAllResponse extends ProductBaseResponse {
  data: Record<string, ProductSearchItem[]>;
}

export interface ProductFindByIdResponse extends ProductBaseResponse {
  data: Record<
    string,
    (ProductDetail | ProductDetailCategory | ProductDetailRelated)[]
  >;
}

export interface ProductCreateResponse extends ProductBaseResponse {
  data: StoredProcedureResponse[];
}

export class ProductBaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductBaseError";
    Object.setPrototypeOf(this, ProductBaseError.prototype);
  }
}

export class ProductBaseNotFoundError extends ProductBaseError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto não encontrado";
    super(message, "PRODUCT_BASE_NOT_FOUND", 100404);
    this.name = "ProductBaseNotFoundError";
    Object.setPrototypeOf(this, ProductBaseNotFoundError.prototype);
  }
}

export class ProductBaseValidationError extends ProductBaseError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_BASE_VALIDATION_ERROR", 100400);
    this.name = "ProductBaseValidationError";
    Object.setPrototypeOf(this, ProductBaseValidationError.prototype);
  }
}
