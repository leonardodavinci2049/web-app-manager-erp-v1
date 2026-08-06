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

// --- Search All (V2) ---

export interface SupplierSearchAllRequest extends SupplierBaseRequest {
  pe_search?: string;
}

export interface SupplierSearchListItem {
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  FONE1: string | null;
  WHATAPP1: string | null;
  RAZAO_SOCIAL: string | null;
  CPF: string | null;
  CNPJ: string | null;
  EMAIL: string | null;
  ID_IMAGEM: number;
  PATH_IMAGEM?: string | null;
  ULTIMA_COMPRA: string | null;
  UF: string | null;
  CIDADE: string | null;
  DATA_CADASTRO: string | null;
}

export interface SupplierSearchAllResponse extends SupplierBaseResponse {
  data: Record<string, SupplierSearchListItem[]>;
}

// --- Find Manager All (V2) ---

export interface SupplierFindManagerAllRequest extends SupplierBaseRequest {
  pe_search?: string;
  pe_status_id?: number;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface SupplierFindManagerAllResponse extends SupplierBaseResponse {
  data: Record<string, SupplierSearchListItem[]>;
}

// --- Find By Id ---

export interface SupplierFindByIdRequest extends SupplierBaseRequest {
  pe_supplier_id: number;
}

export interface SupplierDetail {
  ID_FORNECEDOR: number;
  NOME: string | null;
  FISIJURI: string | null;
  FONE1: string | null;
  WHATAPP1: string | null;
  CONTATO1: string | null;
  SETOR1: string | null;
  EMAIL1: string | null;
  PATH_IMAGEM: string | null;
  ID_PESSOA_TIPO: number | null;
  TIPO_PESSOA: string;
  RAZAO_SOCIAL: string | null;
  CNPJ: string | null;
  INSC_ESTADUAL: string | null;
  INSC_MUNICIPAL: string | null;
  NOME_FANTASIA: string | null;
  DATA_CNPJ: string | null;
  NOME_RESPONSAVEL: string | null;
  CARGO: string | null;
  CPF: string | null;
  RG: string | null;
  CEP: string | null;
  ENDERECO: string | null;
  ENDERECO_NUMERO: string | null;
  COMPLEMENTO: string | null;
  BAIRRO: string | null;
  CIDADE: string | null;
  UF: string | null;
  REGIAO_PAIS: string | null;
  PAIS: string | null;
  COD_MUNICIPIO: number | null;
  COD_UF: number | null;
  WEBSITE: string | null;
  FACEBOOK: string | null;
  TWITTER: string | null;
  FRETADOR: number | null;
  INATIVO: number | null;
  DT_ULTIMA_COMPRA: string | null;
  DATADOCADASTRO: string | null;
  ANOTACOES: string | null;
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
