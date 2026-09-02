import "server-only";

interface EntryItemBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface EntryItemBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface EntryItemFindAllRequest extends EntryItemBaseRequest {
  pe_search?: string;
  pe_type_id?: number;
  pe_qt_records?: number;
  pe_page_id?: number;
  pe_column_id?: number;
  pe_order_id?: number;
}

export interface EntryItemFindEntryIdRequest extends EntryItemBaseRequest {
  pe_entry_id: number;
  pe_limit?: number;
}

export interface EntryItemFindByIdRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
}

export interface EntryItemSearchRequest extends EntryItemBaseRequest {
  pe_search?: string;
  pe_limit?: number;
}

export interface EntryItemProductSearchRequest extends EntryItemBaseRequest {
  pe_supplier_id?: number;
  pe_search?: string;
  pe_limit?: number;
}

export interface EntryItemCreateRequest extends EntryItemBaseRequest {
  pe_member_id?: string;
  pe_entry_id: number;
  pe_product_id: number;
}

export interface EntryItemDeleteRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
}

export interface EntryItemUpdateDollarValueRequest
  extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_dollar_exchange_rate: number;
}

export interface EntryItemUpdateGeneralFieldRequest
  extends EntryItemBaseRequest {
  pe_register_id: number;
  pe_field_type: number;
  pe_field: string;
  pe_value_str?: string | null;
  pe_value_int?: number | null;
  pe_value_numeric?: number | null;
  pe_value_date?: string | null;
}

export interface EntryItemUpdateMainRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_qt_comprada: number;
  pe_qt_recebida: number;
  pe_vl_unit_real: number;
  pe_vl_frete_real: number;
  pe_vl_nota: number;
}

export interface EntryItemUpdateNotesRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_notes: string;
}

export interface EntryItemUpdateProductCostRequest
  extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_vl_custo: number;
}

export interface EntryItemUpdateProductPriceRequest
  extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_preco_venda_atac: number;
  pe_preco_venda_corporativo: number;
  pe_preco_venda_vare: number;
}

export interface EntryItemUpdateTaxCodesRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_cst: string;
  pe_cfop: string;
  pe_ncm: string;
}

export interface EntryItemUpdateTaxRatesRequest extends EntryItemBaseRequest {
  pe_item_movement_id: number;
  pe_vl_icms: number;
  pe_vl_ipi: number;
  pe_vl_st: number;
  pe_vl_ibs: number;
  pe_vl_cbs: number;
  pe_base_icms: number;
  pe_base_st: number;
  pe_base_ipi: number;
  pe_base_ibs: number;
  pe_base_cbs: number;
}

export interface EntryItemListItem {
  ID_MOVIMENTO: number;
  ID_ENTRADA: number;
  ID_USUARIO: number;
  USUARIO: string;
  ID_FORNECEDOR: number;
  FORNECEDOR: string;
  ID_TRANSPORTADORA: number;
  TRANSPORTADORA: string;
  ID_MARCA: number;
  MARCA_NOME: string;
  ID_PRODUTO: number;
  PRODUTO: string;
  MODELO: string;
  REF_PRODUTO: string;
  IMPORTADO: number;
  TIPO_PRODUTO: string;
  ID_IMAGEM: number;
  PATH_IMAGEM: string | null;
  PATH_PAGE: string | null;
  QT_COMPRADA: number;
  QT_RECEBIDA: number;
  VL_UNIT_REAL: string;
  VL_FRETE_REAL: string;
  VL_NOTA: string;
  VL_UNIT_DOLAR: string;
  CAMBIO: string;
  VL_ICMS: string;
  VL_IPI: string;
  VL_ST: string;
  VL_IBS: string;
  VL_CBS: string;
  CST: string;
  CFOP: string;
  NCM: string | null;
  VL_TOTAL_IMPOSTO: string | null;
  VL_CUSTO: string | null;
  DT_ENTRADA: string;
}

export interface EntryItemEntryListItem extends EntryItemListItem {
  REF_FORNECEDOR: string;
  ESTOQUE_LOJA: number;
  VL_ATACADO: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  BASE_ICMS: string | null;
  BASE_ST: string | null;
  BASE_IPI: string | null;
  BASE_IBS: string | null;
  BASE_CBS: string | null;
}

export interface EntryItemDetail extends EntryItemEntryListItem {
  VL_ULTIMO_CUSTO: string | null;
  VL_CUSTOREAL: string | null;
  TX_PRODUTO_LUCROATACADO: string;
  TX_PRODUTO_LUCROVAREJO: string;
  TX_PRODUTO_LUCROCORPORATIVO: string;
  ANOTACOES: string | null;
  DT_UPDATE: string | null;
}

export type EntryItemSearchItem = EntryItemDetail;

export interface EntryItemProduct {
  ID_PRODUTO: number;
  PRODUTO: string;
  ID_MARCA: number;
  MARCA: string;
  MODELO: string;
  REF_PRODUTO: string;
  PATH_IMAGEM: string | null;
  PATH_PAGE: string | null;
  ESTOQUE_LOJA: number;
  VL_ATACADO1: string;
  VL_CORPORATIVO: string;
  VL_VAREJO: string;
  INATIVO: number;
  IMPORTADO: number;
  FLAG_CONTROLE_FISICO: number;
  CONTROLAR_ESTOQUE: number;
  DATADOCADASTRO: string;
  DATA_ULT_ENTRADA: string | null;
  DATA_ULT_VENDA: string | null;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface EntryItemFindAllResponse extends EntryItemBaseResponse {
  data: {
    entryItemFindAll: EntryItemListItem[];
  };
}

export interface EntryItemFindEntryIdResponse extends EntryItemBaseResponse {
  data: {
    entryItemFindEntryId: EntryItemEntryListItem[];
  };
}

export interface EntryItemFindByIdResponse extends EntryItemBaseResponse {
  data: {
    entryItemFindId: EntryItemDetail[];
  };
}

export interface EntryItemSearchResponse extends EntryItemBaseResponse {
  data: {
    entryItemFindSearch: EntryItemSearchItem[];
  };
}

export interface EntryItemProductSearchResponse extends EntryItemBaseResponse {
  data: {
    entryItemProductSearch: EntryItemProduct[];
  };
}

export interface EntryItemMutationResponse extends EntryItemBaseResponse {
  data: StoredProcedureResponse[];
}

export class EntryItemError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "EntryItemError";
    Object.setPrototypeOf(this, EntryItemError.prototype);
  }
}

export class EntryItemNotFoundError extends EntryItemError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Item da entrada não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Item da entrada não encontrado";
    super(message, "ENTRY_ITEM_NOT_FOUND", 100404);
    this.name = "EntryItemNotFoundError";
    Object.setPrototypeOf(this, EntryItemNotFoundError.prototype);
  }
}

export class EntryItemValidationError extends EntryItemError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ENTRY_ITEM_VALIDATION_ERROR", 100400);
    this.name = "EntryItemValidationError";
    Object.setPrototypeOf(this, EntryItemValidationError.prototype);
  }
}
