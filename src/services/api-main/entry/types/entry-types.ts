import "server-only";

interface EntryBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface EntryBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface EntryFindAllRequest extends EntryBaseRequest {
  pe_search?: string;
  pe_flag_operation_list?: number;
  pe_start_date?: string | null;
  pe_end_date?: string | null;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface EntryFindByIdRequest extends EntryBaseRequest {
  pe_entry_id: number;
}

export interface EntrySearchAllRequest extends EntryBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface EntryCreateRequest extends EntryBaseRequest {
  pe_member_id?: string;
  pe_supplier_id: number;
  pe_carrier_id: number;
  pe_category_id: number;
  pe_invoice_number: string;
  pe_model: string;
  pe_total_invoice_value: number;
  pe_total_product_value: number;
  pe_freight_value: number;
  pe_freight_rate: number;
  pe_exchange_rate: number;
  pe_vl_icms: number;
  pe_vl_ipi: number;
  pe_vl_pis: number;
  pe_vl_confins: number;
  pe_vl_ibs: number;
  pe_vl_cbs: number;
  pe_notes: string;
}

export interface EntryDeleteRequest extends EntryBaseRequest {
  pe_entry_id: number;
}

export interface EntryProcessInventoryRequest extends EntryBaseRequest {
  pe_entry_id: number;
}

export interface EntryUpdateCarrierRequest extends EntryBaseRequest {
  pe_entry_id: number;
  pe_carrier_id: number;
}

export interface EntryUpdateGeneralFieldRequest extends EntryBaseRequest {
  pe_register_id: number;
  pe_field_type: number;
  pe_field: string;
  pe_value_str?: string | null;
  pe_value_int?: number | null;
  pe_value_numeric?: number | null;
  pe_value_date?: string | null;
}

export interface EntryUpdateMainRequest extends EntryBaseRequest {
  pe_entry_id: number;
  pe_invoice_number: string;
  pe_model: string;
  pe_freight_value: number;
  pe_freight_rate: number;
  pe_exchange_rate: number;
}

export interface EntryUpdateNotesRequest extends EntryBaseRequest {
  pe_entry_id: number;
  pe_notes: string;
}

export interface EntryUpdateSupplierRequest extends EntryBaseRequest {
  pe_entry_id: number;
  pe_supplier_id: number;
}

export interface EntryUpdateTaxRatesRequest extends EntryBaseRequest {
  pe_entry_id: number;
  pe_vl_icms: number;
  pe_vl_ipi: number;
  pe_vl_pis: number;
  pe_vl_confins: number;
  pe_vl_ibs: number;
  pe_vl_cbs: number;
}

export interface EntryListItem {
  ID_ENTRADA: number;
  ID_USUARIO: number;
  USUARIO: string;
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  PATH_IMAGEM: string | null;
  ID_TRANSPORTADORA: number;
  TRANSPORTADORA: string;
  NUMERODANOTA: string;
  MODELO: string;
  DESCRICAO: string;
  CAMBIO: string;
  VL_FRETE: string;
  TX_FRETE: string;
  VL_TOTAL_NOTA: string;
  VL_TOTAL_PRODUTO: string;
  VL_ICMS: string;
  VL_IPI: string;
  VL_PIS: string;
  VL_CONFINS: string;
  VL_IBS: string;
  VL_CBS: string;
  QT_MOVIMENTO: number;
  VL_TOTAL_REAL: string;
  VL_TOTAL_DOLAR: string;
  ESTOQUE: number;
  STATUS_ESTOQUE: string;
  FISICO: number;
  STATUS_FISICO: string;
  ETIQUETA: number;
  STATUS_ETIQUETA: string;
  DT_ENTRADA: string;
}

export interface EntryDetail {
  ID_ENTRADA: number;
  ID_USUARIO: number;
  USUARIO: string;
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  PATH_IMAGEM: string | null;
  ID_TRANSPORTADORA: number;
  TRANSPORTADORA: string;
  NUMERODANOTA: string;
  MODELO: string;
  DESCRICAO: string;
  CAMBIO: string;
  VL_FRETE: string;
  TX_FRETE: string;
  VL_TOTAL_NOTA: string;
  VL_TOTAL_PRODUTO: string;
  VL_ICMS: string;
  VL_IPI: string;
  VL_PIS: string;
  VL_CONFINS: string;
  VL_IBS: string;
  VL_CBS: string;
  ESTOQUE: number;
  STATUS_ESTOQUE: string;
  FISICO: number;
  STATUS_FISICO: string;
  ETIQUETA: number;
  STATUS_ETIQUETA: string;
  ANOTACOES: string;
  DATA_ENTRADA_ESTOQUE: string | null;
  HORA_ENTRADA_ESTOQUE: string | null;
  HR_LANCAMENTO: string;
  DT_LANCAMENTO: string;
  DT_ENTRADA: string;
  DT_UPDATE: string;
}

export interface EntrySummary {
  ID_ENTRADA: number;
  QT_MOVIMENTO: number;
  VL_TOTAL_REAL: string;
  VL_TOTAL_DOLAR: string;
}

export interface EntrySearchItem {
  ID_ENTRADA: number;
  ID_FORNECEDOR: number;
  USUARIO: string;
  FORNECEDOR: string;
  TRANSPORTADORA: string;
  NUMERODANOTA: string;
  MODELO: string;
  ID_FRETE: number;
  ID_TIPO: number;
  ID_FRETADOR: number;
  DESCRICAO: string;
  CAMBIO: string;
  VL_TOTAL_NOTA: string;
  VL_FRETE: string;
  VL_TOTAL_PRODUTO: string;
  ESTOQUE: number;
  FISICO: number;
  ETIQUETA: number;
  TX_FRETE: string;
  DATA_ENTRADA_ESTOQUE: string | null;
  HORA_ENTRADA_ESTOQUE: string | null;
  HR_LANCAMENTO: string;
  DT_LANCAMENTO: string;
  DATADOCADASTRO: string;
  DT_UPDATE: string | null;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface EntryFindAllResponse extends EntryBaseResponse {
  data: {
    entryFindAll: EntryListItem[];
  };
}

export interface EntryFindByIdResponse extends EntryBaseResponse {
  data: {
    entryData: EntryDetail[];
    entrySummary: EntrySummary[];
  };
}

export interface EntrySearchAllResponse extends EntryBaseResponse {
  data: {
    entrySearch: EntrySearchItem[];
  };
}

export interface EntryMutationResponse extends EntryBaseResponse {
  data: StoredProcedureResponse[];
}

export class EntryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "EntryError";
    Object.setPrototypeOf(this, EntryError.prototype);
  }
}

export class EntryNotFoundError extends EntryError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Entrada não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Entrada não encontrada";
    super(message, "ENTRY_NOT_FOUND", 100404);
    this.name = "EntryNotFoundError";
    Object.setPrototypeOf(this, EntryNotFoundError.prototype);
  }
}

export class EntryValidationError extends EntryError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ENTRY_VALIDATION_ERROR", 100400);
    this.name = "EntryValidationError";
    Object.setPrototypeOf(this, EntryValidationError.prototype);
  }
}
