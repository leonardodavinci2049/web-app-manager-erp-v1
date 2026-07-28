import "server-only";

interface CarrierBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface CarrierBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface CarrierFindAllRequest extends CarrierBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface CarrierListItem {
  ID_TRANSPORTADORA: number;
  ID_PESSOA_TIPO: number;
  TIPO_PESSOA: string;
  NOME: string;
  FONE1: string;
  WHATAPP1: string;
  EMAIL1: string;
  WEBSITE: string;
  CNPJ: string;
  RAZAO_SOCIAL: string;
  NOME_RESPONSAVEL: string;
  CPF: string;
  PATH_IMAGEM: string | null;
  CREATEDAT: string | null;
}

export interface CarrierFindByIdRequest extends CarrierBaseRequest {
  pe_carrier_id: number;
}

export type CarrierDetail = CarrierListItem;

export interface CarrierCreateRequest extends CarrierBaseRequest {
  pe_type_person_id?: number;
  pe_name?: string;
  pe_phone?: string;
  pe_whatsapp?: string;
  pe_email?: string;
  pe_website?: string;
  pe_cnpj?: string;
  pe_company_name?: string;
  pe_responsible_name?: string;
  pe_cpf?: string;
  pe_image_path?: string;
}

export interface CarrierUpdateRequest extends CarrierBaseRequest {
  pe_carrier_id: number;
  pe_type_person_id?: number;
  pe_carrier_name?: string;
  pe_phone?: string;
  pe_whatsapp?: string;
  pe_email?: string;
  pe_website?: string;
  pe_cnpj?: string;
  pe_company_name?: string;
  pe_responsible_name?: string;
  pe_cpf?: string;
  pe_image_path?: string;
  pe_notes?: string;
}

export interface CarrierDeleteRequest extends CarrierBaseRequest {
  pe_carrier_id: number;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface CarrierFindAllResponse extends CarrierBaseResponse {
  data: Record<string, CarrierListItem[]>;
}

export interface CarrierFindByIdResponse extends CarrierBaseResponse {
  data: Record<string, CarrierDetail[]>;
}

export interface CarrierCreateResponse extends CarrierBaseResponse {
  data: StoredProcedureResponse[];
}

export interface CarrierUpdateResponse extends CarrierBaseResponse {
  data: StoredProcedureResponse[];
}

export interface CarrierDeleteResponse extends CarrierBaseResponse {
  data: StoredProcedureResponse[];
}

export class CarrierError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CarrierError";
    Object.setPrototypeOf(this, CarrierError.prototype);
  }
}

export class CarrierNotFoundError extends CarrierError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Transportadora não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Transportadora não encontrada";
    super(message, "CARRIER_NOT_FOUND", 100404);
    this.name = "CarrierNotFoundError";
    Object.setPrototypeOf(this, CarrierNotFoundError.prototype);
  }
}

export class CarrierValidationError extends CarrierError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "CARRIER_VALIDATION_ERROR", 100400);
    this.name = "CarrierValidationError";
    Object.setPrototypeOf(this, CarrierValidationError.prototype);
  }
}
