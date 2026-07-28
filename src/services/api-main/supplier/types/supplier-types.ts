import "server-only";

interface SupplierBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface SupplierBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Find All ---

export interface SupplierFindAllRequest extends SupplierBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface SupplierListItem {
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
}

export interface SupplierFindAllResponse extends SupplierBaseResponse {
  data: Record<string, SupplierListItem[]>;
}

// --- Find By Id ---

export interface SupplierFindByIdRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
}

export interface SupplierDetail {
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  ANOTACOES: string | null;
  DT_UPDATE: string | null;
}

export interface SupplierFindByIdResponse extends SupplierBaseResponse {
  data: Record<string, SupplierDetail[]>;
}

// --- Create ---

export interface SupplierCreateRequest extends SupplierBaseRequest {
  pe_supplier_name: string;
  pe_slug: string;
}

export interface SupplierCreateResponse extends SupplierBaseResponse {
  data: StoredProcedureResponse[];
}

// --- Update ---

export interface SupplierUpdateRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
  pe_supplier?: string;
  pe_notes?: string;
  pe_inactive?: number;
}

export interface SupplierUpdateResponse extends SupplierBaseResponse {
  data: StoredProcedureResponse[];
}

// --- Delete ---

export interface SupplierDeleteRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
}

export interface SupplierDeleteResponse extends SupplierBaseResponse {
  data: StoredProcedureResponse[];
}

// --- Relationship: Supplier-Product ---

export interface SupplierRelCreateRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
  pe_product_id: number;
  pe_supplier_code: string;
}

export interface SupplierRelCreateResponse extends SupplierBaseResponse {
  data: StoredProcedureResponse[];
}

export interface SupplierRelDeleteRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
  pe_product_id: number;
}

export interface SupplierRelDeleteResponse extends SupplierBaseResponse {
  data: StoredProcedureResponse[];
}

export interface SupplierRelFindProdAllRequest extends SupplierBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface SupplierRelProdItem {
  ID_FORNECEDOR: number;
  ID_PRODUTO: number;
  PRODUTO: string;
  REF: string;
  CODIGODOPRODUTO: string;
  FORNECEDOR: string;
  DT_UPDATE: string | null;
}

export interface SupplierRelFindProdAllResponse extends SupplierBaseResponse {
  data: Record<string, SupplierRelProdItem[]>;
}

// --- Stored Procedure ---

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// --- Error Classes ---

export class SupplierError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "SupplierError";
    Object.setPrototypeOf(this, SupplierError.prototype);
  }
}

export class SupplierNotFoundError extends SupplierError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Fornecedor não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Fornecedor não encontrado";
    super(message, "SUPPLIER_NOT_FOUND", 100404);
    this.name = "SupplierNotFoundError";
    Object.setPrototypeOf(this, SupplierNotFoundError.prototype);
  }
}

export class SupplierValidationError extends SupplierError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "SUPPLIER_VALIDATION_ERROR", 100400);
    this.name = "SupplierValidationError";
    Object.setPrototypeOf(this, SupplierValidationError.prototype);
  }
}
