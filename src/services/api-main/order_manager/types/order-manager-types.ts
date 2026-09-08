import "server-only";

interface OrdersManagerBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrdersManagerBaseResponse {
  statusCode: number;
  message: string;
  recordId: string;
  quantity: number;
  errorId: number;
  info1?: string;
}

// --- Request Interfaces ---

export interface OrdersManagerFindAllRequest extends OrdersManagerBaseRequest {
  pe_customer_id?: number;
  pe_seller_id?: number;
  pe_search?: string;
  pe_order_status_id?: number;
  pe_financial_status_id?: number;
  pe_delivery_status_id?: number;
  pe_location_id?: number;
  pe_flag_operation_date?: number;
  pe_start_date: string;
  pe_end_date: string;
  pe_records_per_page?: number;
  pe_page_id?: number;
  pe_sort_column_id?: 1 | 2 | 3;
  pe_sort_order_id?: 1 | 2;
}

export interface OrdersManagerFindByIdRequest extends OrdersManagerBaseRequest {
  pe_order_id: number;
}

// --- Entity Interfaces (campos retornados pela API) ---

export interface OrdersManagerListItem {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  CLIENTE_NOME: string;
  ID_VENDEDOR: number;
  VENDEDOR_NOME: string;
  PATH_IMAGEM: string;
  TIPO_VENDA: string;
  STATUS_PEDIDO: string;
  STATUS_FINANCEIRO: string;
  STATUS_ENTREGA: string;
  ID_STATUS_ENTREGA: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_FINANCEIRO: number;
  FLAG_COMISSAO: number;
  FLAG_VENDA_ATACADO: number;
  QT_ITENS: number;
  QT_PRODUTOS_VENDIDOS: number;
  VL_SUBTOTAL: string;
  VL_SEGURO: string;
  VL_ACRESCIMO: string;
  VL_FRETE: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
  VL_TOTAL_BASE_COMISSAO: string;
  TX_MEDIA_COMISSAO_ATACADO: string;
  TX_MEDIA_COMISSAO_VAREJO: string;
  VL_COMISSAO_VENDEDOR: string;
  PG_FORMA: string | null;
  LOCALIZACAO: string | null;
  DATA_ORCAMENTO: string | null;
  DATA_PEDIDO: string | null;
  DATA_LIBERACAO: string | null;
  DATA_VENDA: string | null;
  DATA_ENTREGA: string | null;
  DATA_ESTORNO: string | null;
}

export interface OrdersManagerData {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_SEGURO: string;
  VL_ACRESCIMO: string;
  VL_FRETE: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
  VL_TOTAL_BASE_COMISSAO: string;
  VL_COMISSAO_VENDEDOR: string;
}

export interface OrdersManagerOrderItem {
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

export interface OrdersManagerStatusHistory {
  ID_PEDIDO: number;
  DATA_ORCAMENTO: string | null;
  DATA_PEDIDO: string | null;
  DATA_VENDA: string | null;
  DATA_PAGAMENTO: string | null;
  DATA_ENTREGA: string | null;
  DATA_ESTORNO: string | null;
}

export interface OrdersManagerCustomer {
  ID_CLIENTE: number;
  NOME_CLIENTE: string;
  DATADOCADASTRO: string;
  DT_ULTIMA_COMPRA: string;
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
}

export interface OrdersManagerSeller {
  ID_VENDEDOR: number;
  NOME_VENDEDOR: string;
  IMAGEM_VENDEDOR: string;
  TELEFONE_VENDEDOR: string;
  WHATSAPP_VENDEDOR: string;
  EMAIL_VENDEDOR: string;
}

// --- Response Interfaces ---

export interface OrdersManagerFindAllResponse
  extends Omit<OrdersManagerBaseResponse, "recordId"> {
  recordId: number;
  data: {
    ordersFindAll: OrdersManagerListItem[];
  };
}

export interface OrdersManagerFindByIdData {
  ordersData: OrdersManagerData[];
  ordersItems: OrdersManagerOrderItem[];
  ordersStatusHistory: OrdersManagerStatusHistory[];
  ordersCustomer: OrdersManagerCustomer[];
  ordersSeller: OrdersManagerSeller[];
}

export interface OrdersManagerFindByIdResponse
  extends Omit<OrdersManagerBaseResponse, "recordId"> {
  recordId: number;
  data: OrdersManagerFindByIdData;
}

// --- Error Classes ---

export class OrderManagerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderManagerError";
    Object.setPrototypeOf(this, OrderManagerError.prototype);
  }
}

export class OrderManagerNotFoundError extends OrderManagerError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Pedido do gestor de pedidos não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Pedido do gestor de pedidos não encontrado";
    super(message, "ORDER_MANAGER_NOT_FOUND", 100404);
    this.name = "OrderManagerNotFoundError";
    Object.setPrototypeOf(this, OrderManagerNotFoundError.prototype);
  }
}

export class OrderManagerValidationError extends OrderManagerError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_MANAGER_VALIDATION_ERROR", 100400);
    this.name = "OrderManagerValidationError";
    Object.setPrototypeOf(this, OrderManagerValidationError.prototype);
  }
}
