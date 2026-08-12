import "server-only";

interface OrderB2bBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrderB2bBaseResponse {
  statusCode: number;
  message: string;
  recordId: number | string;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Request Interfaces ===

export interface OrderFindBudgetCustomerIdRequest extends OrderB2bBaseRequest {
  pe_customer_id: number;
}

export interface OrderFindDashboardCustomerIdRequest
  extends OrderB2bBaseRequest {
  pe_order_id: number;
  pe_customer_id: number;
}

export interface OrderItemFindQtRequest extends OrderB2bBaseRequest {
  pe_customer_id: number;
}

export interface OrderFindLatestRequest extends OrderB2bBaseRequest {
  pe_customer_id: number;
}

export interface OrderStatisticsCustomerRequest extends OrderB2bBaseRequest {
  pe_customer_id: number;
}

// === Entity Interfaces - Budget / Dashboard ===

export interface OrderB2bSummaryEntity {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
}

export interface OrderB2bDetailsEntity {
  ID_PEDIDO: number;
  ID_LOJA: number;
  ID_CLIENTE: number;
  ID_VENDEDOR: number;
  ID_PROTOCOLO: number;
  ID_LOCALIZACAO_PED: number;
  ID_EQUIPAMENTO: number | null;
  ID_PG_FORMA: number;
  ID_CARRINHO: number;
  ID_TRANSPORTADORA: number;
  FLAG_VENDA_ATACADO: number;
  VL_DESCONTO: string;
  VL_FRETE: string;
  ID_STATUS_ESTOQUE: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_FINANCEIRO: number;
  ID_STATUS_ENTREGA: number;
  STATUS_PEDIDO: string;
  STATUS_FINANCEIRO: string;
  STATUS_ENTREGA: string;
  STATUS_ESTOQUE: string;
  DATA_PEDIDO: string | null;
  DATA_VENDA: string | null;
  DATA_RETIRADA: string | null;
  DATA_ESTOQUE: string | null;
  DATA_PAGAMENTO: string | null;
  DATA_ENTREGA: string | null;
  DATADOCADASTRO: string;
  ANOTACOES: string;
}

export interface OrderB2bItemEntity {
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
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  CODIGOP: string | null;
  PROMOCAO: number;
  ESTOQUE_LOJA1: number;
  DEPOSITO1: number;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  TEMPODEGARANTIA_DIA: number;
  QT_ESTORNADA: number;
  VL_SUBTOTAL: string;
  VL_DESCONTO_TOTAL: string;
  VL_TOTAL: string;
  DATADOCADASTRO: string;
  ANOTACOES: string;
}

export interface OrderB2bCustomerEntity {
  ID_CLIENTE: number;
  NOME_CLIENTE: string;
  PATH_IMAGEM: string;
  DATADOCADASTRO: string;
  DT_ULTIMA_COMPRA: string | null;
  FLAG_FRETE_GRATIS: number;
  VL_PP_DESCONTO: string;
  FONE1: string;
  WHATAPP1: string;
  EMAIL: string;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  ID_TIPO_CLIENTE: number;
  ACCOUNT_STATUS: string;
  CPF: string;
  RG: string;
  RAZAO_SOCIAL: string;
  NOME_FANTASIA: string;
  CNPJ: string;
  INSC_ESTADUAL: string;
  INSC_MUNICIPAL: string;
  CEP: string;
  ENDERECO: string;
  ENDERECO_NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CIDADE: string;
  UF: string;
  PAIS: string;
  COD_MUNICIPIO: number;
  COD_UF: number;
  ANOTACOES: string;
}

export interface OrderB2bSellerEntity {
  ID_VENDEDOR: number;
  NOME_VENDEDOR: string;
  IMAGEM_VENDEDOR: string;
  TELEFONE_VENDEDOR: string;
  WHATSAPP_VENDEDOR: string;
  EMAIL_VENDEDOR: string;
}

// === Entity - Item Quantity ===

export interface OrderItemQtEntity {
  QT_ITEMS: number;
}

// === Entity - Order Find Latest ===

export interface OrderFindLatestEntity {
  DATA_PEDIDO: string;
  ID_CLIENTE: number;
  CLIENTE: string;
  ID_PEDIDO: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_FINANCEIRO: number;
  ID_STATUS_ENTREGA: number;
  STATUS_PEDIDO: string;
  STATUS_FINANCEIRO: string;
  STATUS_ENTREGA: string;
  QT_ITENS: number;
  VL_FRETE: string;
  VL_DESCONTO: string;
  VL_TOTAL: string;
}

// === Entity - Order Statistics Customer ===

export interface OrderStatisticsCustomerEntity {
  ID_CLIENTE: number;
  CLIENTE: string;
  QT_PEDIDOS: number;
  QT_ITENS: string;
  TICKET_MEDIO: string;
  TOTAL_GERAL_PEDIDO: string;
}

// === Response Interfaces ===

export interface OrderFindBudgetCustomerIdResponse
  extends OrderB2bBaseResponse {
  recordId: number;
  data: {
    "Order Summary": OrderB2bSummaryEntity[];
    "Order Details": OrderB2bDetailsEntity[];
    "Order Items": OrderB2bItemEntity[];
    "Customer Details": OrderB2bCustomerEntity[];
    "Seller Details": OrderB2bSellerEntity[];
  };
}

export interface OrderFindDashboardCustomerIdResponse
  extends OrderB2bBaseResponse {
  recordId: string;
  data: {
    "Order Summary": OrderB2bSummaryEntity[];
    "Order Details": OrderB2bDetailsEntity[];
    "Order Items": OrderB2bItemEntity[];
    "Customer Details": OrderB2bCustomerEntity[];
    "Seller Details": OrderB2bSellerEntity[];
  };
}

export interface OrderItemFindQtResponse extends OrderB2bBaseResponse {
  recordId: number;
  data: {
    "Qt Items": OrderItemQtEntity[];
  };
}

export interface OrderFindLatestResponse extends OrderB2bBaseResponse {
  recordId: number;
  data: {
    "Orders Find Latest": OrderFindLatestEntity[];
  };
}

export interface OrderStatisticsCustomerResponse extends OrderB2bBaseResponse {
  recordId: number;
  data: {
    "Orders Statistics Customer": OrderStatisticsCustomerEntity[];
  };
}

// === Error Classes ===

export class OrderB2bError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderB2bError";
    Object.setPrototypeOf(this, OrderB2bError.prototype);
  }
}

export class OrderB2bNotFoundError extends OrderB2bError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Pedido B2B não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Pedido B2B não encontrado";
    super(message, "ORDER_B2B_NOT_FOUND", 100404);
    this.name = "OrderB2bNotFoundError";
    Object.setPrototypeOf(this, OrderB2bNotFoundError.prototype);
  }
}
