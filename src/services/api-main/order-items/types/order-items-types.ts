import "server-only";

interface OrderItemsBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrderItemsBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Request Interfaces ===

export interface OrderItemsFindAllRequest extends OrderItemsBaseRequest {
  pe_order_id?: number;
  pe_limit?: number;
}

export interface OrderItemsFindByIdRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
}

export interface OrderItemsDeleteRequest extends OrderItemsBaseRequest {
  pe_movement_id?: number;
}

export interface OrderItemsInlineFieldRequest extends OrderItemsBaseRequest {
  pe_register_id: number;
  pe_field_type: 1 | 2 | 3 | 4;
  pe_field: string;
  pe_value_str?: string;
  pe_value_int?: number;
  pe_value_numeric?: number;
  pe_value_date?: string | null;
}

export interface OrderItemsDiscountRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_discount_value: number;
}

export interface OrderItemsDiscountAdmRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_discount_adm_value: number;
}

export interface OrderItemsFreteVlRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_frete_value: number;
}

export interface OrderItemsInsuranceVlRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_insurance_value: number;
}

export interface OrderItemsNotesRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_notes?: string;
}

export interface OrderItemsQtRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_quantity: number;
}

export interface OrderItemsValueRequest extends OrderItemsBaseRequest {
  pe_order_item_id: number;
  pe_item_value: number;
}

// === Entity Interfaces (API response data) ===

export interface OrderItemListEntity {
  ID_MOVIMENTO: number;
  ID_PEDIDO: number;
  ID_PRODUTO: number;
  EAN: string;
  REF: string;
  SKU: string | null;
  ETIQUETA: string;
  ID_TIPO: number;
  MODELO: string;
  PRODUTO: string;
  QT: number;
  VL_UNITARIO: string;
  VL_DESCONTO: string;
  VL_DESCONTO_ADM: string;
  CODIGOP: string | null;
  PROMOCAO: number;
  ESTOQUE_LOJA1: number;
  DEPOSITO1: number;
  ID_FAMILIA: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  TEMPODEGARANTIA_DIA: number;
  QT_ESTORNADA: number;
  DATADOCADASTRO: string;
  VL_DESCONTO_TOTAL: string;
  VL_CUSTO_PRODUTO: string;
  VL_SUBTOTAL: string;
  VL_TOTAL: string;
  ANOTACOES: string | null;
}

export interface OrderItemDetailEntity {
  ID_MOVIMENTO: number;
  ID_PEDIDO: number;
  ID_PRODUTO: number;
  PRODUTO: string;
  QT: number;
  VL_UNITARIO: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO_ADM: string;
  VL_DESCONTO: string;
  VL_DESCONTO_TOTAL: string;
  VL_CUSTO_PRODUTO: string;
  VL_SUBTOTAL: string;
  VL_TOTAL: string;
  REF: string;
  SKU: string | null;
  ETIQUETA: string;
  ID_TIPO: number;
  MODELO: string;
  ID_MARCA: number;
  MARCA_NOME: string;
  DESCRICAO_TAB: string;
  ID_RMA: number;
  DT_RETORNO: string | null;
  SETOR_RMA: string | null;
  STATUS: string | null;
  ESTOQUE_LOJA1: number;
  DEPOSITO1: number;
  ESTOQUE_MINIMO: number;
  ESTOQUE_ATUAL: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  STQ_PRATELEIRA: number;
  STQ_GONDULA: number;
  STQ_FILEIRA: number;
  IMPORTADO: number;
  FLAG_CONTROLE_FISICO: number;
  CONTROLAR_ESTOQUE: number;
  QT_FISICA_EXPEDIDA: number;
  STATUS_EXPEDICAO: string | null;
  CFOP: string | null;
  VL_NFE_DESC: string;
  CEST: number;
  CST: string;
  CST_SAIDA: string;
  NCM: number;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  NFE_CEST: string;
  NFE_CFOP_SAIDA: string;
  NFE_CST_CSOSN: string;
  CFOP_SAIDA: string;
  EAN: string;
  FLAG_WEBSITE_OFF: number;
  VL_ATACADO1: string;
  VL_CORPORATIVO1: string;
  VL_VAREJO1: string;
  ICMS: string;
  IPI: string;
  TAXA_PERCA: string;
  VL_ST: string;
  ICMS_BC: string;
  ICMS_VALOR: string;
  ICMS_ALIQUOTA: string;
  ST_BC: string;
  ST_VALOR: string;
  ST_ALIQUOTA: string;
  IPI_CENQ: string;
  IPI_CST: string;
  IPI_BC: string;
  IPI_VALOR: string;
  IPI_ALIQUOTA: string;
  VL_DESPESAS_ADICIONAIS: string;
  CODIGOP: string | null;
  PROMOCAO: number;
  QT_ESTORNADA: number;
  ANOTACOES: string | null;
  ID_EQUIPAMENTO: number | null;
  FLAG_EMISSAO: number;
  ID_FISICO: number | null;
  FLAG_SERVICO: number;
  DATADOCADASTRO: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// === Response Interfaces ===

export interface OrderItemsFindAllResponse extends OrderItemsBaseResponse {
  data: {
    orderItems: OrderItemListEntity[];
  };
}

export interface OrderItemsFindByIdResponse extends OrderItemsBaseResponse {
  data: {
    orderItem: OrderItemDetailEntity[];
  };
}

export interface OrderItemsDeleteResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsInlineFieldResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsDiscountResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsDiscountAdmResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsFreteVlResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsInsuranceVlResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsNotesResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsQtResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderItemsValueResponse extends OrderItemsBaseResponse {
  data: StoredProcedureResponse[];
}

// === Error Classes ===

export class OrderItemsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderItemsError";
    Object.setPrototypeOf(this, OrderItemsError.prototype);
  }
}

export class OrderItemsNotFoundError extends OrderItemsError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Item de pedido não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Item de pedido não encontrado";
    super(message, "ORDER_ITEMS_NOT_FOUND", 100404);
    this.name = "OrderItemsNotFoundError";
    Object.setPrototypeOf(this, OrderItemsNotFoundError.prototype);
  }
}

export class OrderItemsValidationError extends OrderItemsError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_ITEMS_VALIDATION_ERROR", 100400);
    this.name = "OrderItemsValidationError";
    Object.setPrototypeOf(this, OrderItemsValidationError.prototype);
  }
}
