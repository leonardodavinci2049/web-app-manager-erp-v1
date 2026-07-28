import "server-only";

interface BrandBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface BrandBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface BrandFindAllRequest extends BrandBaseRequest {
  pe_search?: string;
  pe_inactive?: number;
  pe_limit?: number;
}

export interface BrandListItem {
  ID_MARCA: number;
  MARCA: string;
  SLUG: string;
  PATH_IMAGEM: string;
  INATIVO: number;
  DATADOCADASTRO: string;
}

export interface BrandFindByIdRequest extends BrandBaseRequest {
  pe_brand_id: number;
}

export interface BrandDetail {
  ID_MARCA: number;
  MARCA: string;
  SLUG: string;
  PATH_IMAGEM: string;
  ANOTACOES: string | null;
  INATIVO: number;
  DT_UPDATE: string | null;
  DATADOCADASTRO: string;
}

export interface BrandCreateRequest extends BrandBaseRequest {
  pe_brand: string;
  pe_image_path?: string;
  pe_notes?: string;
}

export interface BrandUpdateRequest extends BrandBaseRequest {
  pe_brand_id: number;
  pe_brand?: string;
  pe_image_path?: string;
  pe_notes?: string;
  pe_inactive?: number;
}

export interface BrandDeleteRequest extends BrandBaseRequest {
  pe_brand_id: number;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface BrandSearchAllRequest extends BrandBaseRequest {
  pe_search?: string;
  pe_inactive?: number;
  pe_limit?: number;
}

export interface BrandFindAllResponse extends BrandBaseResponse {
  data: Record<string, BrandListItem[]>;
}

export interface BrandSearchAllResponse extends BrandBaseResponse {
  data: Record<string, BrandListItem[]>;
}

export interface BrandFindByIdResponse extends BrandBaseResponse {
  data: Record<string, BrandDetail[]>;
}

export interface BrandCreateResponse extends BrandBaseResponse {
  data: StoredProcedureResponse[];
}

export interface BrandUpdateResponse extends BrandBaseResponse {
  data: StoredProcedureResponse[];
}

export interface BrandDeleteResponse extends BrandBaseResponse {
  data: StoredProcedureResponse[];
}

export class BrandError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "BrandError";
    Object.setPrototypeOf(this, BrandError.prototype);
  }
}

export class BrandNotFoundError extends BrandError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Marca não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Marca não encontrada";
    super(message, "BRAND_NOT_FOUND", 100404);
    this.name = "BrandNotFoundError";
    Object.setPrototypeOf(this, BrandNotFoundError.prototype);
  }
}

export class BrandValidationError extends BrandError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "BRAND_VALIDATION_ERROR", 100400);
    this.name = "BrandValidationError";
    Object.setPrototypeOf(this, BrandValidationError.prototype);
  }
}
