import "server-only";

interface CustomerInlineRequestContext {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface CustomerInlineBaseRequest extends CustomerInlineRequestContext {
  pe_customer_id: number;
}

interface CustomerInlineBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// ===== Inline Update Generic Field =====

export interface CustomerInlineFieldRequest
  extends CustomerInlineRequestContext {
  pe_register_id: number;
  pe_field_type: 1 | 2 | 3 | 4;
  pe_field: string;
  pe_value_str?: string;
  pe_value_int?: number;
  pe_value_numeric?: number;
  pe_value_date?: string | null;
}

export interface CustomerInlineFieldResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Email =====

export interface CustomerInlineEmailRequest extends CustomerInlineBaseRequest {
  pe_email?: string;
}

export interface CustomerInlineEmailResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Name =====

export interface CustomerInlineNameRequest extends CustomerInlineBaseRequest {
  pe_name: string;
}

export interface CustomerInlineNameResponse extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Notes =====

export interface CustomerInlineNotesRequest extends CustomerInlineBaseRequest {
  pe_notes?: string;
}

export interface CustomerInlineNotesResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Phone =====

export interface CustomerInlinePhoneRequest extends CustomerInlineBaseRequest {
  pe_phone?: string;
}

export interface CustomerInlinePhoneResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Seller ID =====

export interface CustomerInlineSellerIdRequest
  extends CustomerInlineBaseRequest {
  pe_seller_id: number;
}

export interface CustomerInlineSellerIdResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Type Customer =====

export interface CustomerInlineTypeCustomerRequest
  extends CustomerInlineBaseRequest {
  pe_customer_type_id: number;
}

export interface CustomerInlineTypeCustomerResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update Type Person =====

export interface CustomerInlineTypePersonRequest
  extends CustomerInlineBaseRequest {
  pe_person_type_id: number;
}

export interface CustomerInlineTypePersonResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Inline Update WhatsApp =====

export interface CustomerInlineWhatsappRequest
  extends CustomerInlineBaseRequest {
  pe_whatsapp: string;
}

export interface CustomerInlineWhatsappResponse
  extends CustomerInlineBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Error Classes =====

export class CustomerInlineError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CustomerInlineError";
    Object.setPrototypeOf(this, CustomerInlineError.prototype);
  }
}

export class CustomerInlineNotFoundError extends CustomerInlineError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Cliente não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Cliente não encontrado";
    super(message, "CUSTOMER_INLINE_NOT_FOUND", 100404);
    this.name = "CustomerInlineNotFoundError";
    Object.setPrototypeOf(this, CustomerInlineNotFoundError.prototype);
  }
}

export class CustomerInlineValidationError extends CustomerInlineError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CUSTOMER_INLINE_VALIDATION_ERROR", 100400);
    this.name = "CustomerInlineValidationError";
    Object.setPrototypeOf(this, CustomerInlineValidationError.prototype);
  }
}
