import "server-only";

interface ProductManagerBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface ProductManagerBaseResponse {
  statusCode: number;
  message: string;
  recordId: string;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Request Interfaces ---

export interface ProductManagerFindAllRequest
  extends ProductManagerBaseRequest {
  pe_search?: string;
  pe_ean?: string;
  pe_reference?: string;
  pe_model?: string;
  pe_taxonomy_id?: number;
  pe_type_id?: number;
  pe_brand_id?: number;
  pe_supplier_id?: number;
  pe_physical_id?: number;
  pe_flag_best_sellers?: number;
  pe_flag_lowest_selling?: number;
  pe_flag_stalled_product?: number;
  pe_flag_latest_arrivals?: number;
  pe_flag_price_less_than?: number;
  pe_flag_low_stock?: number;
  pe_flag_no_image?: number;
  pe_flag_no_description?: number;
  pe_flag_no_sales_copy?: number;
  pe_flag_promotion?: number;
  pe_flag_featured?: number;
  pe_flag_imported?: number;
  pe_flag_inactive?: number;
  pe_flag_consignment?: number;
  pe_flag_discontinued?: number;
  pe_flag_no_inventory?: number;
  pe_flag_stock?: number;
  pe_flag_service?: number;
  pe_flag_registration?: number;
  pe_start_date?: string;
  pe_end_date?: string;
  pe_records_quantity?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface ProductManagerFindByIdRequest
  extends ProductManagerBaseRequest {
  pe_product_id?: number;
  pe_type_business?: number;
}

export interface ProductManagerFindSearchRequest
  extends ProductManagerBaseRequest {
  pe_customer_id?: number;
  pe_search?: string;
  pe_flag_stock?: number;
  pe_limit?: number;
}

// --- Entity Interfaces (campos retornados pela API) ---

export interface ProductManagerListItem {
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
  PATH_IMAGEM_MARCA: string;
  ID_IMAGEM: number;
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
  DESCRICAO_VENDA: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  CATEGORIAS: string;
  DATADOCADASTRO: string;
}

export interface ProductManagerSearchItem {
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
  DESCRICAO_VENDA: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  DATADOCADASTRO: string;
}

export interface ProductManagerDetail {
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
  META_TITLE: string | null;
  META_DESCRIPTION: string | null;
  DESCRICAO_VENDA: string | null;
  ANOTACOES: string | null;
  DATADOCADASTRO: string;
  DT_UPDATE: string;
}

export interface ProductManagerRelatedCategory {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  SLUG: string;
  ORDEM: number;
  LEVEL: number;
}

export interface ProductManagerRelatedProduct {
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

// --- Response Interfaces ---

export interface ProductManagerFindAllResponse
  extends ProductManagerBaseResponse {
  data: {
    "Product Manager find All": ProductManagerListItem[];
  };
}

export interface ProductManagerFindByIdData {
  "Product Manager find Id": ProductManagerDetail[];
  "Related Categories": ProductManagerRelatedCategory[];
  "Related Products": ProductManagerRelatedProduct[];
}

export interface ProductManagerFindByIdResponse
  extends ProductManagerBaseResponse {
  data: ProductManagerFindByIdData;
}

export interface ProductManagerFindSearchResponse
  extends ProductManagerBaseResponse {
  data: {
    "Product Manager find Search": ProductManagerSearchItem[];
  };
}

// --- Error Classes ---

export class ProductManagerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductManagerError";
    Object.setPrototypeOf(this, ProductManagerError.prototype);
  }
}

export class ProductManagerNotFoundError extends ProductManagerError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto do Manager não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto do Manager não encontrado";
    super(message, "PRODUCT_MANAGER_NOT_FOUND", 100404);
    this.name = "ProductManagerNotFoundError";
    Object.setPrototypeOf(this, ProductManagerNotFoundError.prototype);
  }
}

export class ProductManagerValidationError extends ProductManagerError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_MANAGER_VALIDATION_ERROR", 100400);
    this.name = "ProductManagerValidationError";
    Object.setPrototypeOf(this, ProductManagerValidationError.prototype);
  }
}
