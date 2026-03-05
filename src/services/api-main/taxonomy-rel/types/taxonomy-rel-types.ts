import "server-only";

interface TaxonomyRelBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface TaxonomyRelBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface TaxonomyRelFindAllProductsRequest
  extends TaxonomyRelBaseRequest {
  pe_record_id: number;
}

export interface TaxonomyRelCreateRequest extends TaxonomyRelBaseRequest {
  pe_taxonomy_id: number;
  pe_record_id: number;
}

export interface TaxonomyRelDeleteRequest extends TaxonomyRelBaseRequest {
  pe_taxonomy_id: number;
  pe_record_id: number;
}

export interface TaxonomyRelProductItem {
  ID_TAXONOMY: number;
  TAXONOMIA: string;
  CREATEDAT: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface TaxonomyRelFindAllProductsResponse
  extends TaxonomyRelBaseResponse {
  data: Record<string, TaxonomyRelProductItem[]>;
}

export interface TaxonomyRelCreateResponse extends TaxonomyRelBaseResponse {
  data: StoredProcedureResponse[];
}

export interface TaxonomyRelDeleteResponse extends TaxonomyRelBaseResponse {
  data: StoredProcedureResponse[];
}

export class TaxonomyRelError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TaxonomyRelError";
    Object.setPrototypeOf(this, TaxonomyRelError.prototype);
  }
}

export class TaxonomyRelNotFoundError extends TaxonomyRelError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Relação taxonomia não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Relação taxonomia não encontrada";
    super(message, "TAXONOMY_REL_NOT_FOUND", 100404);
    this.name = "TaxonomyRelNotFoundError";
    Object.setPrototypeOf(this, TaxonomyRelNotFoundError.prototype);
  }
}

export class TaxonomyRelValidationError extends TaxonomyRelError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "TAXONOMY_REL_VALIDATION_ERROR", 100400);
    this.name = "TaxonomyRelValidationError";
    Object.setPrototypeOf(this, TaxonomyRelValidationError.prototype);
  }
}
