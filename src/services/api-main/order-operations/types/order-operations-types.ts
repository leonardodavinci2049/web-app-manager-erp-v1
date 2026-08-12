import "server-only";

interface OrderOperationsBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrderOperationsBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Request Interfaces ===

export interface OrderOperCreateRequest extends OrderOperationsBaseRequest {
  pe_customer_id?: number;
  pe_seller_id?: number;
  pe_business_type?: number;
  pe_payment_form_id?: number;
  pe_location_id?: number;
  pe_notes?: string;
}

export interface OrderOperAddItemRequest extends OrderOperationsBaseRequest {
  pe_order_id?: number;
  pe_customer_id?: number;
  pe_seller_id?: number;
  pe_payment_form_id?: number;
  pe_product_id?: number;
  pe_product_quantity?: number;
  pe_business_type?: number;
  pe_notes?: string;
}

export interface OrderOperCloseRequest extends OrderOperationsBaseRequest {
  pe_order_id: number;
}

export interface OrderOperReverseRequest extends OrderOperationsBaseRequest {
  pe_order_id: number;
}

export interface OrderOperSendingByEmailRequest
  extends OrderOperationsBaseRequest {
  pe_order_id?: number;
  pe_seller_id?: number;
  pe_business_type?: number;
}

// === Entity Interfaces (sending-by-email retorna dados compostos) ===

export interface OrderEmailSummaryEntity {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
}

export interface OrderEmailItemEntity {
  ID_ITEM: number;
  ID_PEDIDO: number;
  ID_PRODUTO: number;
  SKU: number;
  PRODUTO: string;
  QT: number;
  VL_UNITARIO: string;
  VL_SUBTOTAL: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_FRETE: string;
  VL_TOTAL: string;
  STATUS: string | null;
  ID_IMAGEM: number;
  PATH_IMAGEM: string;
  SLUG: string;
  TEMPODEGARANTIA_MES: number;
  TEMPODEGARANTIA_DIA: number;
  QT_ESTORNADA: number;
  DATADOCADASTRO: string;
}

export interface OrderEmailCustomerEntity {
  ID_USUARIO: number;
  ID_VENDEDOR: number;
  CEP: string;
  ENDERECO: string;
  ENDERECO_NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CIDADE: string;
  UF: string;
  REGIAO_PAIS: string;
  PAIS: string;
  COD_MUNICIPIO: number;
  COD_UF: number;
}

export interface OrderEmailSellerEntity {
  ID_VENDEDOR: number;
  ID_LOJA: number;
  NOME: string;
  PATH_IMAGEM: string;
  FONE1: string;
  WHATAPP1: string;
  EMAIL: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// === Response Interfaces ===

export interface OrderOperCreateResponse extends OrderOperationsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderOperAddItemResponse extends OrderOperationsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderOperCloseResponse extends OrderOperationsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderOperReverseResponse extends OrderOperationsBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderOperSendingByEmailResponse
  extends OrderOperationsBaseResponse {
  data: {
    orderSummary: OrderEmailSummaryEntity[];
    orderItems: OrderEmailItemEntity[];
    customerDetails: OrderEmailCustomerEntity[];
    sellerDetails: OrderEmailSellerEntity[];
  };
}

// === Error Classes ===

export class OrderOperationsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderOperationsError";
    Object.setPrototypeOf(this, OrderOperationsError.prototype);
  }
}

export class OrderOperationsNotFoundError extends OrderOperationsError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Pedido não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Pedido não encontrado";
    super(message, "ORDER_OPERATIONS_NOT_FOUND", 100404);
    this.name = "OrderOperationsNotFoundError";
    Object.setPrototypeOf(this, OrderOperationsNotFoundError.prototype);
  }
}

export class OrderOperationsValidationError extends OrderOperationsError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_OPERATIONS_VALIDATION_ERROR", 100400);
    this.name = "OrderOperationsValidationError";
    Object.setPrototypeOf(this, OrderOperationsValidationError.prototype);
  }
}
