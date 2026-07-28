import "server-only";

interface CustomerUpdBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
  pe_customer_id: number;
}

interface CustomerUpdBaseResponse {
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

// ===== Update General =====

export interface CustomerUpdGeneralRequest extends CustomerUpdBaseRequest {
  pe_name: string;
  pe_phone?: string;
  pe_whatsapp?: string;
  pe_email?: string;
  pe_image_path?: string;
}

export interface CustomerUpdGeneralResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Update Personal =====

export interface CustomerUpdPersonalRequest extends CustomerUpdBaseRequest {
  pe_cpf?: string;
  pe_first_name?: string;
  pe_last_name?: string;
  pe_image_path?: string;
  pe_birth_date?: string;
}

export interface CustomerUpdPersonalResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Update Business =====

export interface CustomerUpdBusinessRequest extends CustomerUpdBaseRequest {
  pe_cnpj: string;
  pe_company_name: string;
  pe_state_registration?: string;
  pe_municipal_registration?: string;
  pe_responsible_name?: string;
  pe_main_activity?: string;
}

export interface CustomerUpdBusinessResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Update Address =====

export interface CustomerUpdAddressRequest extends CustomerUpdBaseRequest {
  pe_zip_code?: string;
  pe_address?: string;
  pe_address_number?: string;
  pe_complement?: string;
  pe_neighborhood?: string;
  pe_city?: string;
  pe_state?: string;
  pe_city_code?: string;
  pe_state_code?: string;
}

export interface CustomerUpdAddressResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Update Internet =====

export interface CustomerUpdInternetRequest extends CustomerUpdBaseRequest {
  pe_website?: string;
  pe_facebook?: string;
  pe_twitter?: string;
  pe_linkedin?: string;
  pe_instagram?: string;
  pe_tiktok?: string;
  pe_telegram?: string;
}

export interface CustomerUpdInternetResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Update Flag =====

export interface CustomerUpdFlagRequest extends CustomerUpdBaseRequest {
  pe_client?: number;
  pe_seller?: number;
  pe_supplier?: number;
  pe_professional?: number;
  pe_employee?: number;
  pe_restriction?: number;
}

export interface CustomerUpdFlagResponse extends CustomerUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// ===== Error Classes =====

export class CustomerUpdError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CustomerUpdError";
    Object.setPrototypeOf(this, CustomerUpdError.prototype);
  }
}

export class CustomerUpdNotFoundError extends CustomerUpdError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Cliente não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Cliente não encontrado";
    super(message, "CUSTOMER_UPD_NOT_FOUND", 100404);
    this.name = "CustomerUpdNotFoundError";
    Object.setPrototypeOf(this, CustomerUpdNotFoundError.prototype);
  }
}

export class CustomerUpdValidationError extends CustomerUpdError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CUSTOMER_UPD_VALIDATION_ERROR", 100400);
    this.name = "CustomerUpdValidationError";
    Object.setPrototypeOf(this, CustomerUpdValidationError.prototype);
  }
}
