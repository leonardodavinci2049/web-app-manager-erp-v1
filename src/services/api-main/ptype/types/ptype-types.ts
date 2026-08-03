import "server-only";

interface PtypeBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface PtypeBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface PtypeFindAllRequest extends PtypeBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface PtypeSearchAllRequest extends PtypeBaseRequest {
  pe_search?: string;
}

export interface PtypeFindManagerAllRequest extends PtypeBaseRequest {
  pe_search?: string;
  pe_status_id?: number;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface PtypeListItem {
  ID_TIPO: number;
  TIPO: string;
}

export interface PtypeFindByIdRequest extends PtypeBaseRequest {
  pe_type_id: number;
}

export interface PtypeDetail {
  ID_TIPO: number;
  TIPO: string;
  PATH_IMAGEM: string | null;
  INATIVO: number;
  ANOTACOES: string | null;
  FLAG_CADASTRO_PRODUTO: number;
  TX_COMISSAO_VARE: string | null;
  TX_COMISSAO_ATAC: string | null;
  DT_CADASTRO: string | null;
}

export interface PtypeCreateRequest extends PtypeBaseRequest {
  pe_type: string;
  pe_slug: string;
}

export interface PtypeUpdateRequest extends PtypeBaseRequest {
  pe_type_id: number;
  pe_type?: string;
  pe_slug?: string;
  pe_notes?: string;
  pe_inactive?: number;
}

export interface PtypeDeleteRequest extends PtypeBaseRequest {
  pe_type_id: number;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface PtypeFindAllResponse extends PtypeBaseResponse {
  data: Record<string, PtypeListItem[]>;
}

export interface PtypeSearchAllResponse extends PtypeBaseResponse {
  data: Record<string, PtypeListItem[]>;
}

export interface PtypeFindManagerAllResponse extends PtypeBaseResponse {
  data: Record<string, PtypeListItem[]>;
}

export interface PtypeFindByIdResponse extends PtypeBaseResponse {
  data: Record<string, PtypeDetail[]>;
}

export interface PtypeCreateResponse extends PtypeBaseResponse {
  data: StoredProcedureResponse[];
}

export interface PtypeUpdateResponse extends PtypeBaseResponse {
  data: StoredProcedureResponse[];
}

export interface PtypeDeleteResponse extends PtypeBaseResponse {
  data: StoredProcedureResponse[];
}

export class PtypeError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PtypeError";
    Object.setPrototypeOf(this, PtypeError.prototype);
  }
}

export class PtypeNotFoundError extends PtypeError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Tipo não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Tipo não encontrado";
    super(message, "PTYPE_NOT_FOUND", 100404);
    this.name = "PtypeNotFoundError";
    Object.setPrototypeOf(this, PtypeNotFoundError.prototype);
  }
}

export class PtypeValidationError extends PtypeError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PTYPE_VALIDATION_ERROR", 100400);
    this.name = "PtypeValidationError";
    Object.setPrototypeOf(this, PtypeValidationError.prototype);
  }
}
