import "server-only";

interface TaxonomyInlineBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface TaxonomyInlineBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface UpdateTaxonomyImagePathInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_image_path: string;
}

export interface UpdateTaxonomyInactiveInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_inactive: number;
}

export interface UpdateTaxonomyNameInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_taxonomy_name: string;
}

export interface UpdateTaxonomyNotesInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_notes?: string;
}

export interface UpdateTaxonomyOrderInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_order: number;
}

export interface UpdateTaxonomyParentIdInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_parent_id?: number;
}

export interface UpdateTaxonomyQtProductsInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_qt_products: number;
}

export interface UpdateTaxonomySlugInlineRequest
  extends TaxonomyInlineBaseRequest {
  pe_taxonomy_id: number;
  pe_slug: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface TaxonomyInlineResponse extends TaxonomyInlineBaseResponse {
  data: StoredProcedureResponse[];
}

export class TaxonomyInlineError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TaxonomyInlineError";
    Object.setPrototypeOf(this, TaxonomyInlineError.prototype);
  }
}

export class TaxonomyInlineNotFoundError extends TaxonomyInlineError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Taxonomia não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Taxonomia não encontrada";
    super(message, "TAXONOMY_INLINE_NOT_FOUND", 100404);
    this.name = "TaxonomyInlineNotFoundError";
    Object.setPrototypeOf(this, TaxonomyInlineNotFoundError.prototype);
  }
}

export class TaxonomyInlineValidationError extends TaxonomyInlineError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "TAXONOMY_INLINE_VALIDATION_ERROR", 100400);
    this.name = "TaxonomyInlineValidationError";
    Object.setPrototypeOf(this, TaxonomyInlineValidationError.prototype);
  }
}
