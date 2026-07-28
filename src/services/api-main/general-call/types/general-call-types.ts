import "server-only";

/**
 * Tipos lógicos de campo suportados pelo endpoint
 * de atualização inline de tabela.
 */
export const FIELD_TYPE = {
  STRING: 1,
  BIGINT: 2,
  DECIMAL: 3,
  DATE: 4,
} as const;

export type FieldType = (typeof FIELD_TYPE)[keyof typeof FIELD_TYPE];

interface GeneralCallBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface GeneralCallBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

/**
 * Request do endpoint `general-table-upd-inl-field`.
 *
 * O valor deve ser informado exclusivamente no parâmetro correspondente
 * ao `pe_field_type`; os demais parâmetros de valor devem receber `null`.
 */
export interface GeneralTableUpdInlFieldRequest extends GeneralCallBaseRequest {
  pe_table_name: string;
  pe_primary_key_field: string;
  pe_register_id: number;
  pe_field_type: FieldType;
  pe_field: string;
  pe_value_str?: string | null;
  pe_value_int?: number | null;
  pe_value_numeric?: number | null;
  pe_value_date?: string | null;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface GeneralTableUpdInlFieldResponse
  extends GeneralCallBaseResponse {
  data: StoredProcedureResponse[];
}

export class GeneralCallError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "GeneralCallError";
    Object.setPrototypeOf(this, GeneralCallError.prototype);
  }
}

export class GeneralCallValidationError extends GeneralCallError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "GENERAL_CALL_VALIDATION_ERROR", 100400);
    this.name = "GeneralCallValidationError";
    Object.setPrototypeOf(this, GeneralCallValidationError.prototype);
  }
}
