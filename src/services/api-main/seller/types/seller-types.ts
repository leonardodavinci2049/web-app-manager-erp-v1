import "server-only";

interface SellerBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface SellerBaseResponse {
  statusCode: number;
  message: string;
  recordId: number | string;
  quantity: number;
  errorId: number;
  info1?: string;
}

// ===== Search All (V2) =====

export interface SellerSearchAllRequest extends SellerBaseRequest {
  pe_search?: string;
}

export interface SellerListItem {
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
  ULTIMA_COMPRA: string | null;
  DATA_CADASTRO: string | null;
}

export interface SellerSearchAllResponse extends SellerBaseResponse {
  data: Record<string, SellerListItem[]>;
}

// ===== Find Manager All (V2) =====

export interface SellerFindManagerAllRequest extends SellerBaseRequest {
  pe_search?: string;
  pe_category_id?: number;
  pe_flag_no_image?: number;
  pe_status_id?: number;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface SellerFindManagerAllResponse extends SellerBaseResponse {
  data: Record<string, SellerListItem[]>;
}

// ===== Find By ID (V2) =====

export interface SellerFindByIdRequest extends SellerBaseRequest {
  pe_seller_id: number;
}

// ===== Find Manager By ID (V2) =====

export interface SellerFindManagerByIdRequest extends SellerBaseRequest {
  pe_seller_id: number;
}

export interface SellerDetail {
  ID_SELLER: number;
  ID_LOJA: number;
  ID_TIPO_CLIENTE: number;
  ACCOUNT_STATUS: string;
  NOME: string;
  EMAIL: string | null;
  FONE1: string | null;
  WHATAPP1: string | null;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  CPF: string | null;
  PRIMEIRO_NOME: string | null;
  SOBRENOME: string | null;
  PATH_IMAGEM: string | null;
  DATADONASCIMENTO: string | null;
  CNPJ: string | null;
  RAZAO_SOCIAL: string | null;
  NOME_FANTASIA: string | null;
  VENDEDOR: number;
  DATADOCADASTRO: string;
}

export interface SellerFindByIdResponse extends SellerBaseResponse {
  data: Record<string, SellerDetail[]>;
}

export interface SellerManagerDetail {
  ID_SELLER: number;
  ID_LOJA: number;
  ID_TIPO_CLIENTE: number;
  TIPO_CLIENTE: string;
  NOME: string;
  EMAIL: string | null;
  FONE1: string | null;
  WHATAPP1: string | null;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  PATH_IMAGEM: string | null;
  CPF: string | null;
  RG: string | null;
  PRIMEIRO_NOME: string | null;
  SOBRENOME: string | null;
  DATADONASCIMENTO: string | null;
  CNPJ: string | null;
  RAZAO_SOCIAL: string | null;
  NOME_FANTASIA: string | null;
  INSC_ESTADUAL: string | null;
  INSC_MUNICIPAL: string | null;
  NOME_RESPONSAVEL: string | null;
  CARGO_RESPONSAVEL: string | null;
  ATIVIDADE_PRINCIPAL: string | null;
  ID_VENDEDOR: number;
  CEP: string | null;
  ENDERECO: string | null;
  ENDERECO_NUMERO: string | null;
  COMPLEMENTO: string | null;
  BAIRRO: string | null;
  CIDADE: string | null;
  UF: string | null;
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
  INATIVO: number;
  VENDEDOR: number;
  APROVADO: string;
  EMAIL_MKT: number;
  RESTRICAO: number;
  FLAG_FRETE_GRATIS: number;
  VL_PP_DESCONTO: string | null;
  DT_ULTIMA_COMPRA: string | null;
  ANOTACOES: string | null;
  DATADOCADASTRO: string | null;
}

export interface SellerFindManagerByIdResponse extends SellerBaseResponse {
  data: Record<string, SellerManagerDetail[]>;
}

// ===== Error Classes =====

export class SellerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "SellerError";
    Object.setPrototypeOf(this, SellerError.prototype);
  }
}

export class SellerNotFoundError extends SellerError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Vendedor não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Vendedor não encontrado";
    super(message, "SELLER_NOT_FOUND", 100404);
    this.name = "SellerNotFoundError";
    Object.setPrototypeOf(this, SellerNotFoundError.prototype);
  }
}

export class SellerValidationError extends SellerError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "SELLER_VALIDATION_ERROR", 100400);
    this.name = "SellerValidationError";
    Object.setPrototypeOf(this, SellerValidationError.prototype);
  }
}
