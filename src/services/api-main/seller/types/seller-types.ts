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
  recordId: number;
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
