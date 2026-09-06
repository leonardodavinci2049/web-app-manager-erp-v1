import "server-only";

interface PurchasingBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface PurchasingBaseResponse {
  statusCode: number;
  message: string;
  recordId: string;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Request Interfaces ---

export interface PurchasingFindAllRequest extends PurchasingBaseRequest {
  pe_search?: string;
  pe_taxonomy_id?: number;
  pe_type_id?: number;
  pe_brand_id?: number;
  pe_supplier_id?: number;
  pe_flag_sales_list?: 0 | 1 | 2 | 3;
  pe_flag_stock_list?: 0 | 1 | 2 | 3;
  pe_flag_advanced?: 0 | 1 | 2;
  pe_flag_imported?: 0 | 1 | 2;
  pe_flag_premium?: 0 | 1;
  pe_criticality_level?: 0 | 1 | 2 | 3 | 4;
  pe_flag_various_lists?: number;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: 1 | 2 | 3;
  pe_order_id?: 1 | 2;
}

export interface PurchasingFindByIdRequest extends PurchasingBaseRequest {
  pe_product_id: number;
  pe_type_business?: number;
}

// --- Entity Interfaces (campos retornados pela API) ---

export interface PurchasingListItem {
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  DESCRICAO_TAB: string;
  ETIQUETA: string;
  REF: string;
  MODELO: string;
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  TEMPO_ENTREGA_DIA: number;
  TEMPO_ENTREGA_HORA: number;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  ID_IMAGEM: number;
  PATH_IMAGEM_MARCA: string;
  PATH_IMAGEM: string | null;
  PATH_PAGE: string | null;
  SLUG: string | null;
  QT_VENDAS_HA_DOIS_MESES: number;
  QT_VENDAS_MES_ANTERIOR: number;
  QT_VENDAS_MES_ATUAL: number;
  QT_VENDAS_30_DIAS: number;
  QT_VENDAS_HOJE: number;
  DATA_ULT_VENDA: string | null;
  CRITICALITY_LEVEL: string | null;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  TX_PRODUTO_LOJA: string;
  OURO: string;
  PRATA: string;
  BRONZE: string;
  DESCONTO: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  DESCRICAO_VENDA: string | null;
  IMPORTADO: number;
  PROMOCAO: number;
  LANCAMENTO: number;
  CATEGORIAS: string;
  DATADOCADASTRO: string;
}

export interface PurchasingDetail {
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
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  TEMPO_ENTREGA_DIA: number;
  TEMPO_ENTREGA_HORA: number;
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
  QT_VENDAS_HA_DOIS_MESES: number;
  QT_VENDAS_MES_ANTERIOR: number;
  QT_VENDAS_MES_ATUAL: number;
  QT_VENDAS_30_DIAS: number;
  QT_VENDAS_HOJE: number;
  DATA_ULT_VENDA: string | null;
  CRITICALITY_LEVEL: string | null;
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
  DT_UPDATE: string;
  DESCRICAO_VENDA: string | null;
  ANOTACOES: string | null;
  DATADOCADASTRO: string;
}

export interface PurchasingRelatedCategory {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  SLUG: string;
  ORDEM: number;
  LEVEL: number;
}

export interface PurchasingRelatedSupplier {
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  PATH_IMAGEM: string | null;
  REF_PRODUTO: string;
  WHATSAPP: string;
  FONE: string;
  EMAIL: string;
  WEBSITE: string;
  REF_FORNECEDOR: string;
  DT_ATUALIZACAOO: string | null;
  QT_REGISTER: number;
}

// --- Response Interfaces ---

export interface PurchasingFindAllResponse
  extends Omit<PurchasingBaseResponse, "recordId"> {
  recordId: number;
  data: {
    purchasingFindAll: PurchasingListItem[];
  };
}

export interface PurchasingFindByIdData {
  purchasingData: PurchasingDetail[];
  purchasingCategories: PurchasingRelatedCategory[];
  purchasingSuppliers: PurchasingRelatedSupplier[];
}

export interface PurchasingFindByIdResponse
  extends Omit<PurchasingBaseResponse, "recordId"> {
  recordId: number;
  data: PurchasingFindByIdData;
}

// --- Error Classes ---

export class PurchasingError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PurchasingError";
    Object.setPrototypeOf(this, PurchasingError.prototype);
  }
}

export class PurchasingNotFoundError extends PurchasingError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto do gestor de compras não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto do gestor de compras não encontrado";
    super(message, "PURCHASING_NOT_FOUND", 100404);
    this.name = "PurchasingNotFoundError";
    Object.setPrototypeOf(this, PurchasingNotFoundError.prototype);
  }
}

export class PurchasingValidationError extends PurchasingError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PURCHASING_VALIDATION_ERROR", 100400);
    this.name = "PurchasingValidationError";
    Object.setPrototypeOf(this, PurchasingValidationError.prototype);
  }
}
