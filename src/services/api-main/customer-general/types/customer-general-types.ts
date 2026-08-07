import "server-only";

interface CustomerBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface CustomerBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// ===== Find All =====

export interface CustomerFindAllRequest extends CustomerBaseRequest {
  pe_search?: string;
  pe_qt_registros?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface CustomerListItem {
  ID_CUSTOMER: number;
  ID_TIPO_CLIENTE: number;
  ID_PESSOA_TIPO: number;
  NOME: string;
  FONE1: string;
  WHATAPP1: string;
  RAZAO_SOCIAL: string;
  CPF: string;
  CNPJ: string;
  TIPO_CLIENTE: string;
  TIPO_PESSOA: string;
  EMAIL: string;
  PATH_IMAGEM: string | null;
  ULTIMA_COMPRA: string | null;
}

export interface CustomerFindAllResponse extends CustomerBaseResponse {
  data: Record<string, CustomerListItem[]>;
}

// ===== Search All (V2) =====

export interface CustomerSearchAllRequest extends CustomerBaseRequest {
  pe_search?: string;
}

export interface CustomerPersonListItem {
  ID_CUSTOMER: number;
  ID_TIPO_CLIENTE: number;
  ID_PESSOA_TIPO: number;
  NOME: string;
  FONE1: string | null;
  WHATAPP1: string | null;
  RAZAO_SOCIAL: string | null;
  CIDADE: string | null;
  CPF: string | null;
  CNPJ: string | null;
  TIPO_CLIENTE: string;
  TIPO_PESSOA: string;
  EMAIL: string | null;
  PATH_IMAGEM: string | null;
  APROVADO: string;
  GENERO: string;
  RESTRICAO: number;
  ULTIMA_COMPRA: string | null;
  DATA_CADASTRO: string | null;
}

export interface CustomerSearchAllResponse extends CustomerBaseResponse {
  data: Record<string, CustomerPersonListItem[]>;
}

// ===== Find Manager All (V2) =====

export interface CustomerFindManagerAllRequest extends CustomerBaseRequest {
  pe_search?: string;
  pe_category_id?: number;
  pe_client_type?: number;
  pe_person_type?: number;
  pe_flag_no_image?: number;
  pe_flag_approved?: number;
  pe_gender_type?: number;
  pe_flag_restricted?: number;
  pe_flag_enabled?: number;
  pe_status_id?: number;
  pe_flag_operation_list?: number;
  pe_start_date?: string;
  pe_end_date?: string;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface CustomerFindManagerAllResponse extends CustomerBaseResponse {
  data: Record<string, CustomerPersonListItem[]>;
}

// ===== Find By ID =====

export interface CustomerFindByIdRequest extends CustomerBaseRequest {
  pe_customer_id?: number;
}

export interface CustomerDetail {
  ID_USUARIO: number;
  ID_LOJA: number;
  ID_TIPO_CLIENTE: number;
  ACCOUNT_STATUS: string;
  NOME: string;
  EMAIL: string;
  FONE1: string;
  WHATAPP1: string;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  CPF: string;
  PRIMEIRO_NOME: string | null;
  SOBRENOME: string | null;
  PATH_IMAGEM: string | null;
  DATADONASCIMENTO: string | null;
  CNPJ: string;
  RAZAO_SOCIAL: string;
  NOME_FANTASIA: string | null;
  INSC_ESTADUAL: string | null;
  INSC_MUNICIPAL: string | null;
  NOME_RESPONSAVEL: string | null;
  CARGO_RESPONSAVEL: string | null;
  ATIVIDADE_PRINCIPAL: string | null;
  ID_VENDEDOR: number;
  CEP: string;
  ENDERECO: string;
  ENDERECO_NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CIDADE: string;
  UF: string;
  REGIAO_PAIS: string | null;
  PAIS: string | null;
  COD_MUNICIPIO: number;
  COD_UF: number;
  WEBSITE: string | null;
  FACEBOOK: string | null;
  TWITTER: string | null;
  LINKEDIN: string | null;
  INSTAGRAM: string | null;
  TIKTOK: string | null;
  TELEGRAM: string | null;
  ANOTACOES: string;
  VENDEDOR: number;
  DATADOCADASTRO: string;
}

export interface SellerInfo {
  ID_VENDEDOR: number;
  ID_LOJA: number;
  NOME: string;
  PATH_IMAGEM: string;
  FONE1: string;
  WHATAPP1: string;
  EMAIL: string;
}

export interface CustomerFindByIdResponse extends CustomerBaseResponse {
  data: {
    "Customer Information": CustomerDetail[];
    "Seller Information": SellerInfo[];
  };
}

// ===== Create =====

export interface CustomerCreateRequest extends CustomerBaseRequest {
  pe_name: string;
  pe_email: string;
  pe_person_type_id: number;
  pe_cnpj?: string;
  pe_company_name?: string;
  pe_cpf?: string;
  pe_phone?: string;
  pe_whatsapp?: string;
  pe_image?: string;
  pe_zip_code?: string;
  pe_address?: string;
  pe_address_number?: string;
  pe_complement?: string;
  pe_neighborhood?: string;
  pe_city?: string;
  pe_state?: string;
  pe_notes?: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface CustomerCreateResponse extends CustomerBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Find Latest Products =====

export interface CustomerFindLatestProductsRequest extends CustomerBaseRequest {
  pe_customer_id: number;
  pe_limit?: number;
}

export interface CustomerLatestProduct {
  DATADOCADASTRO: string;
  ID_MOVIMENTO: number;
  ID_PEDIDO: number;
  ID_PRODUTO: number;
  EAN: string;
  REF: string;
  SKU: string | null;
  ETIQUETA: string;
  ID_TIPO: number;
  MODELO: string;
  PRODUTO: string;
  QT: number;
  VL_UNITARIO: string;
  VL_DESCONTO_UNITARIO: string;
  VL_DESCONTO_ADM_UNITARIO: string;
  CODIGOP: string | null;
  PROMOCAO: number;
  ESTOQUE_LOJA1: number;
  DEPOSITO1: number;
  ID_FAMILIA: number;
  PATH_IMAGEM: string | null;
  PATH_PAGE: string | null;
  TEMPODEGARANTIA_DIA: number;
  QT_ESTORNADA: number;
  VL_DESCONTO_ADM_TOTAL: string;
  VL_DESCONTO_TOTAL: string;
  VL_DESCONTO_GERAL: string;
  VL_CUSTO_TOTAL: string;
  VL_SUBTOTAL: string;
  VL_TOTAL: string;
  ANOTACOES: string;
}

export interface CustomerFindLatestProductsResponse
  extends CustomerBaseResponse {
  data: Record<string, CustomerLatestProduct[]>;
}

// ===== Error Classes =====

export class CustomerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CustomerError";
    Object.setPrototypeOf(this, CustomerError.prototype);
  }
}

export class CustomerNotFoundError extends CustomerError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Cliente não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Cliente não encontrado";
    super(message, "CUSTOMER_NOT_FOUND", 100404);
    this.name = "CustomerNotFoundError";
    Object.setPrototypeOf(this, CustomerNotFoundError.prototype);
  }
}

export class CustomerValidationError extends CustomerError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CUSTOMER_VALIDATION_ERROR", 100400);
    this.name = "CustomerValidationError";
    Object.setPrototypeOf(this, CustomerValidationError.prototype);
  }
}
