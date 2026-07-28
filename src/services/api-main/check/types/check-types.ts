import "server-only";

interface CheckBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface CheckBaseResponse {
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

export interface CheckTermRequest extends CheckBaseRequest {
  pe_parent_id?: number;
  pe_term: string;
}

export interface CheckTermResponse extends CheckBaseResponse {
  data: StoredProcedureResponse[];
}

export class CheckError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CheckError";
    Object.setPrototypeOf(this, CheckError.prototype);
  }
}

export class CheckValidationError extends CheckError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CHECK_VALIDATION_ERROR", 100400);
    this.name = "CheckValidationError";
    Object.setPrototypeOf(this, CheckValidationError.prototype);
  }
}
