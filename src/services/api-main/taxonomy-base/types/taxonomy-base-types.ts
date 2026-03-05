import "server-only";

interface TaxonomyBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface TaxonomyBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Request interfaces ---

export interface TaxonomyFindAllRequest extends TaxonomyBaseRequest {
  pe_parent_id?: number;
  pe_search?: string;
  pe_flag_inactive?: number;
  pe_records_quantity?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface TaxonomyFindByIdRequest extends TaxonomyBaseRequest {
  pe_taxonomy_id: number;
}

export interface TaxonomyFindMenuRequest extends TaxonomyBaseRequest {
  pe_type_id: number;
  pe_parent_id: number;
}

export interface TaxonomyCreateRequest extends TaxonomyBaseRequest {
  pe_type_id: number;
  pe_parent_id: number;
  pe_taxonomy_name: string;
  pe_slug: string;
  pe_level?: number;
}

export interface TaxonomyUpdateRequest extends TaxonomyBaseRequest {
  pe_taxonomy_id: number;
  pe_parent_id: number;
  pe_taxonomy_name: string;
  pe_slug: string;
  pe_image_path?: string;
  pe_sort_order?: number;
  pe_meta_title?: string;
  pe_meta_description?: string;
  pe_inactive?: number;
  pe_info?: string;
}

export interface TaxonomyDeleteRequest extends TaxonomyBaseRequest {
  pe_taxonomy_id: number;
}

export interface TaxonomyUpdateMetadataRequest extends TaxonomyBaseRequest {
  pe_taxonomy_id: number;
  pe_meta_title?: string;
  pe_meta_description?: string;
  pe_meta_keywords?: string;
}

// --- Entity interfaces ---

export interface TaxonomyListItem {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  ANOTACOES: string | null;
  PATH_IMAGEM: string | null;
  SLUG: string;
  LEVEL: number;
  ORDEM: number;
  ID_IMAGEM: number | null;
  QT_RECORDS: number | null;
  META_TITLE: string | null;
  META_DESCRIPTION: string | null;
}

export interface TaxonomyDetail {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  PARENT_CATEGORY: string | null;
  PATH_IMAGEM: string | null;
  SLUG: string;
  LEVEL: number;
  ORDEM: number;
  ID_IMAGEM: number | null;
  QT_RECORDS: number | null;
  INATIVO: number;
  META_TITLE: string | null;
  META_DESCRIPTION: string | null;
  ANOTACOES: string | null;
  CREATEDAT: string;
  UPDATEDAT: string;
}

export interface TaxonomyMenuItem {
  ID_TAXONOMY: number;
  PARENT_ID: number;
  TAXONOMIA: string;
  PATH_IMAGEM: string | null;
  SLUG: string;
  LEVEL: number;
  ORDEM: number;
  ID_IMAGEM: number | null;
  QT_RECORDS: number | null;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// --- Response interfaces ---

export interface TaxonomyFindAllResponse extends TaxonomyBaseResponse {
  data: Record<string, TaxonomyListItem[]>;
}

export interface TaxonomyFindByIdResponse extends TaxonomyBaseResponse {
  data: Record<string, TaxonomyDetail[]>;
}

export interface TaxonomyFindMenuResponse extends TaxonomyBaseResponse {
  data: Record<string, TaxonomyMenuItem[]>;
}

export interface TaxonomyCreateResponse extends TaxonomyBaseResponse {
  data: StoredProcedureResponse[];
}

export interface TaxonomyUpdateResponse extends TaxonomyBaseResponse {
  data: StoredProcedureResponse[];
}

export interface TaxonomyDeleteResponse extends TaxonomyBaseResponse {
  data: StoredProcedureResponse[];
}

export interface TaxonomyUpdateMetadataResponse extends TaxonomyBaseResponse {
  data: StoredProcedureResponse[];
}

// --- Error classes ---

export class TaxonomyBaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TaxonomyBaseError";
    Object.setPrototypeOf(this, TaxonomyBaseError.prototype);
  }
}

export class TaxonomyNotFoundError extends TaxonomyBaseError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Taxonomia não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Taxonomia não encontrada";
    super(message, "TAXONOMY_NOT_FOUND", 100404);
    this.name = "TaxonomyNotFoundError";
    Object.setPrototypeOf(this, TaxonomyNotFoundError.prototype);
  }
}

export class TaxonomyValidationError extends TaxonomyBaseError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "TAXONOMY_VALIDATION_ERROR", 100400);
    this.name = "TaxonomyValidationError";
    Object.setPrototypeOf(this, TaxonomyValidationError.prototype);
  }
}
