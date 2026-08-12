import "server-only";

interface OrderReportsBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrderReportsBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Shared filter params for "find all" endpoints ===

export interface OrderReportsFindAllFilters extends OrderReportsBaseRequest {
  pe_order_id?: number;
  pe_customer_id?: number;
  pe_seller_id?: number;
  pe_order_status_id?: number;
  pe_financial_status_id?: number;
  pe_location_id?: number;
  pe_initial_date?: string;
  pe_final_date?: string;
  pe_limit?: number;
}

export interface OrderReportsFindByIdRequest extends OrderReportsBaseRequest {
  pe_order_id?: number;
  pe_type_business?: number;
}

// === Entity Interfaces ===

/** Entidade compartilhada para customer-all list */
export interface OrderCustomerAllEntity {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
  ID_CLIENTE: number;
  ID_VENDEDOR: number;
  NOMEDOCLIENTE: string;
  NOMEDOVENDEDOR: string;
  LOCATION: string;
  ID_PG_FORMA: number;
  PG_FORMA: string;
  ID_STATUS_ORCAMENTO: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_ENTREGA: number;
  ID_STATUS_ESTOQUE: number;
  ID_STATUS_FINANCEIRO: number;
  FLAG_VENDA_ATACADO: number;
  STATUS_PEDIDO: string;
  STATUS_FINANCEIRO: string;
  DATA_ORCAMENTO: string;
  DATA_PEDIDO: string;
  DATA_VENDA: string | null;
  DATA_ENTREGA: string | null;
  DATADOCADASTRO: string;
}

/** Entidade para latest-all / sale-all / seller-all (com comissão) */
export interface OrderReportListEntity {
  DATA_VENDA: string | null;
  ID_PEDIDO?: number;
  ID_CLIENTE: number;
  CLIENTE_NOME: string;
  ID_VENDEDOR: number;
  VENDEDOR_NOME: string;
  TAXA_TIPO: string;
  STATUS_PEDI: string;
  STATUS_FINA: string;
  STATUS_ENTR: string;
  STATUS_ESTO: string;
  QT_ITENS: number;
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
  PG_FORMA: string;
  LOCALIZACAO: string;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_FINANCEIRO: number;
  flag_comissao: number;
  FLAG_VENDA_ATACADO: number;
  DATA_ORCAMENTO: string;
  DATA_PEDIDO: string;
  DATA_LIBERACAO: string | null;
  DATA_ENTREGA: string | null;
  DATA_ESTORNO: string | null;
}

/** Entidade resumo do pedido (find-by-id) */
export interface OrderSummaryEntity {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
  VL_TOTAL_BASE_COMISSAO?: string;
  TX_MEDIA_COMISSAO_ATACADO?: string;
  TX_MEDIA_COMISSAO_VAREJO?: string;
  VL_COMISSAO_VENDEDOR?: string;
}

/** Entidade item do pedido (customer-id / latest-id) */
export interface OrderReportItemEntity {
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

/** Entidade histórico de status */
export interface OrderStatusHistoryEntity {
  ID_PEDIDO: number;
  DATA_ORCAMENTO: string;
  DATA_PEDIDO: string;
  DATA_VENDA: string | null;
  DATA_PAGAMENTO: string | null;
  DATA_ENTREGA: string | null;
  DATA_ESTORNO: string | null;
}

/** Entidade informação do cliente */
export interface OrderCustomerInfoEntity {
  ID_CLIENTE: number;
  NOME_CLIENTE: string;
  DATADOCADASTRO: string;
  DT_ULTIMA_COMPRA: string | null;
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

/** Entidade informação do vendedor */
export interface OrderSellerInfoEntity {
  ID_VENDEDOR: number;
  NOME_VENDEDOR: string;
  IMAGEM_VENDEDOR: string;
  TELEFONE_VENDEDOR: string;
  WHATSAPP_VENDEDOR: string;
  EMAIL_VENDEDOR: string;
}

/** Entidade detalhes completos do pedido (sale-id Order Items) */
export interface OrderSaleDetailEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  CLIENTE_NOME: string;
  ID_VENDEDOR: number;
  VENDEDOR_NOME: string;
  TAXA_TIPO: string;
  ID_PG_FORMA: number;
  PG_FORMA: string;
  LOCALIZACAO: string;
  ID_EQUIPAMENTO: number | null;
  USUARIO_ENTREGA: string | null;
  QT_PARCELA: number;
  VL_FATOR: string;
  TX_PG_FINANCEIRA: string;
  TX_PG_DESCONTO: string;
  CODIGOP: string;
  TX_DESCONTO_CODP: string;
  VL_DESCONTO: string;
  ID_STATUS_ORCAMENTO: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_ENTREGA: number;
  ID_STATUS_ESTOQUE: number;
  ID_STATUS_FINANCEIRO: number;
  FLAG_VENDA_ATACADO: number;
  STATUS_PEDI: string;
  STATUS_FINA: string;
  STATUS_ENTR: string;
  STATUS_ESTO: string;
  ID_TIPO_ENTREGA: number | null;
  PRIORIDADE: string;
  ID_TIPO_FRETE: number;
  ID_FORMATO_ENVIO: number;
  PRAZO_ENTREGA_DIA: number;
  QT_VOLUME: number;
  CODIGO_CORREIOS: string;
  VL_FRETE: string;
  PESO_FRETE_GR: number | null;
  ALTURA_VOLUME: number;
  LARGURA_VOLUME: number;
  COMPRIMENTO_VOLUME: number;
  DATA_ORCAMENTO: string;
  DATA_PEDIDO: string;
  DATA_VENDA: string | null;
  DATA_LIBERACAO: string | null;
  DATA_RETIRADA: string | null;
  DATA_PAGAMENTO: string | null;
  DATA_ESTOQUE: string | null;
  DATA_ESTORNO: string | null;
  DATA_ENTREGA: string | null;
  DATA: string;
  HORA: string;
  DATA_VALIDADE_ORC: string | null;
  DATADOCADASTRO: string;
  EQUIPAMENTO: string | null;
  MODELO: string | null;
  SERIAL: string | null;
  TERCEIRIZADO: string | null;
  TECNICO: string | null;
  ID_STATUS_OS: number | null;
  STATUS_OS: string | null;
  ENTRADA: string | null;
  DEFEITO: string | null;
  LAUDO: string | null;
  ANOTACOES: string;
  ID_PROTOCOLO: number;
  NFE_CHAVE: string | null;
  NFE_LOTE: string | null;
  NFE_NUMERO: string | null;
  NFE_OPERACAO: string | null;
  NFE_CHAVE_DEVOLUCAO: string | null;
  NFSE: string | null;
  INFO_NOTAFISCAL: string | null;
}

/** Entidade informação de protocolo */
export interface OrderTradingInfoEntity {
  ID_PROTOCOLO: number;
  DATA_RETIRADA_PROT: string | null;
  ID_USUARIO_RETIRADA: number;
  USUARIO_RETIRADA: string;
}

/** Entidade informação de transportadora */
export interface OrderShippingInfoEntity {
  ID_TRANSPORTADORA: number;
  NOME: string;
  FONE: string;
  WHATSAPP: string;
  EMAIL: string;
  CNPJ: string;
  INSC_ESTADUAL: string;
  CEP: string;
  ENDERECO: string;
  ENDERECO_NUMERO: string;
  CIDADE: string;
  UF: string;
}

// === Response Interfaces ===

export interface OrderFindCustomerAllResponse extends OrderReportsBaseResponse {
  data: Record<string, OrderCustomerAllEntity[]>;
}

export interface OrderFindCustomerIdResponse extends OrderReportsBaseResponse {
  data: {
    "Customer Orders Summary": OrderSummaryEntity[];
    "Customer Order Items": OrderReportItemEntity[];
    "Status History": OrderStatusHistoryEntity[];
    "Customer Information": OrderCustomerInfoEntity[];
    "Seller Information": OrderSellerInfoEntity[];
  };
}

export interface OrderFindLatestAllResponse extends OrderReportsBaseResponse {
  data: Record<string, OrderReportListEntity[]>;
}

export interface OrderFindLatestIdResponse extends OrderReportsBaseResponse {
  data: {
    "Latest Orders Summary": OrderSummaryEntity[];
    "Latest Order Items": OrderReportItemEntity[];
    "Status History": OrderStatusHistoryEntity[];
    "Customer Information": OrderCustomerInfoEntity[];
    "Seller Information": OrderSellerInfoEntity[];
  };
}

export interface OrderFindSaleAllResponse extends OrderReportsBaseResponse {
  data: Record<string, OrderReportListEntity[]>;
}

export interface OrderFindSaleIdResponse extends OrderReportsBaseResponse {
  data: {
    "Order Summary": OrderSummaryEntity[];
    "Order Items": OrderSaleDetailEntity[];
    "Customer Information": OrderCustomerInfoEntity[];
    "Seller Information": OrderSellerInfoEntity[];
    "Trading Information": OrderTradingInfoEntity[];
    "Shipping Information": OrderShippingInfoEntity[];
  };
}

export interface OrderFindSellerAllResponse extends OrderReportsBaseResponse {
  data: Record<string, OrderReportListEntity[]>;
}

// === Error Classes ===

export class OrderReportsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderReportsError";
    Object.setPrototypeOf(this, OrderReportsError.prototype);
  }
}

export class OrderReportsNotFoundError extends OrderReportsError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Relatório de pedido não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Relatório de pedido não encontrado";
    super(message, "ORDER_REPORTS_NOT_FOUND", 100404);
    this.name = "OrderReportsNotFoundError";
    Object.setPrototypeOf(this, OrderReportsNotFoundError.prototype);
  }
}

export class OrderReportsValidationError extends OrderReportsError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_REPORTS_VALIDATION_ERROR", 100400);
    this.name = "OrderReportsValidationError";
    Object.setPrototypeOf(this, OrderReportsValidationError.prototype);
  }
}
