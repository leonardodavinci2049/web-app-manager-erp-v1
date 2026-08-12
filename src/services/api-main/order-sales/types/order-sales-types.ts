import "server-only";

interface OrderSalesBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface OrderSalesBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Request Interfaces ===

export interface OrderSalesFindByIdRequest extends OrderSalesBaseRequest {
  pe_order_id?: number;
  pe_type_business?: number;
}

export interface OrderSalesFindTipoFreteRequest extends OrderSalesBaseRequest {}

export interface OrderSalesDashboardRequest extends OrderSalesBaseRequest {
  pe_order_id?: number;
  pe_id_customer?: number;
  pe_id_seller?: number;
  pe_type_business?: number;
}

// === Entity Interfaces ===

/** Entidade transportadora do pedido */
export interface OrderCarrierEntity {
  ID_PEDIDO: number;
  ID_TRANSPORTADORA: number;
  NOME: string;
  FONE1: string;
  WHATAPP1: string;
  EMAIL1: string;
  CNPJ: string;
  INSC_ESTADUAL: string;
  ENDERECO: string;
  ENDERECO_NUMERO: string;
  CIDADE: string;
  UF: string;
}

/** Entidade cliente do pedido */
export interface OrderCustomerEntity {
  ID_CLIENTE: number;
  NOME_CLIENTE: string;
  PATH_IMAGEM: string;
  DATADOCADASTRO: string;
  DT_ULTIMA_COMPRA: string | null;
  FLAG_FRETE_GRATIS?: number;
  VL_PP_DESCONTO?: string;
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

/** Entidade entrega do pedido */
export interface OrderDeliveryEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  ID_TIPO_ENTREGA: number | null;
  USUARIO_ENTREGA: string | null;
  PRIORIDADE: number | null;
  ID_TIPO_FRETE: number;
  ID_FORMATO_ENVIO: number;
  TIPO_FRETE: string;
  PRAZO_ENTREGA_DIA: number;
  QT_VOLUME: number;
  CODIGO_CORREIOS: string;
  VL_FRETE: string;
  PESO_FRETE_GR: number | null;
  ALTURA_VOLUME: number;
  LARGURA_VOLUME: number;
  COMPRIMENTO_VOLUME: number;
  DATA_ORCAMENTO: string;
  DATA_PEDIDO: string | null;
  DATA_RETIRADA: string | null;
  DATA_ENTREGA: string | null;
  DATADOCADASTRO: string;
  ANOTACOES: string;
}

/** Entidade histórico do pedido */
export interface OrderHistoryEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  ID_STATUS_ORCAMENTO: number;
  ID_STATUS_PEDIDO: number;
  ID_STATUS_ENTREGA: number;
  ID_STATUS_ESTOQUE: number;
  ID_STATUS_FINANCEIRO: number;
  STATUS_PEDIDO: string;
  STATUS_FINANCEIRO: string;
  STATUS_ENTREGA: string;
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
}

/** Entidade nota fiscal do pedido */
export interface OrderNfEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  NFE_CHAVE: string | null;
  NFE_LOTE: string | null;
  NFE_NUMERO: string | null;
  NFE_OPERACAO: string | null;
  NFE_CHAVE_DEVOLUCAO: string | null;
  NFSE: string | null;
  INFO_NOTAFISCAL: string | null;
  ANOTACOES: string;
  DATADOCADASTRO: string;
}

/** Entidade forma de pagamento do pedido */
export interface OrderPgFormaEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  ID_PG_FORMA: number;
  PG_FORMA: string;
  QT_PARCELA: number;
  VL_FATOR: string;
  TX_PG_FINANCEIRA: string;
  TX_PG_DESCONTO: string;
  CODIGOP: string;
  TX_DESCONTO_CODP: string;
  VL_DESCONTO: string;
}

/** Entidade protocolo do pedido */
export interface OrderProtocolEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  ID_PROTOCOLO: number;
  DATA_RETIRADA_PROT: string | null;
  ID_USUARIO_RETIRADA: number;
  USUARIO_RETIRADA: string;
}

/** Entidade vendedor do pedido */
export interface OrderSellerEntity {
  ID_VENDEDOR: number;
  NOME_VENDEDOR: string;
  IMAGEM_VENDEDOR: string;
  TELEFONE_VENDEDOR: string;
  WHATSAPP_VENDEDOR: string;
  EMAIL_VENDEDOR: string;
}

/** Entidade tipo de frete do cliente */
export interface OrderTipoFreteEntity {
  ID_TIPO_FRETE: number;
  TIPO_FRETE: string;
  VALOR_PADRAO: string;
}

/** Entidade resumo do pedido */
export interface OrderSalesSummaryEntity {
  ID_PEDIDO: number;
  QT_ITENS: number;
  VL_SUBTOTAL: string;
  VL_FRETE: string;
  VL_ACRESCIMO: string;
  VL_SEGURO: string;
  VL_DESCONTO: string;
  VL_TOTAL_PEDIDO: string;
}

/** Entidade detalhes do pedido (dashboard) */
export interface OrderDashboardDetailsEntity {
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

/** Entidade item do pedido (dashboard) */
export interface OrderDashboardItemEntity {
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

/** Entidade equipamento do pedido */
export interface OrderEquipmentEntity {
  ID_PEDIDO: number;
  ID_CLIENTE: number;
  ENTRADA: string;
  DEFEITO: string;
  LAUDO: string;
  ANOTACOES: string;
  DATADOCADASTRO: string;
}

// === Response Interfaces ===

export interface OrderFindCoCarrierIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderCarrierEntity[]>;
}

export interface OrderFindCoCustomerIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderCustomerEntity[]>;
}

export interface OrderFindCoDeliveryIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderDeliveryEntity[]>;
}

export interface OrderFindCoHistoryIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderHistoryEntity[]>;
}

export interface OrderFindCoNfIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderNfEntity[]>;
}

export interface OrderFindCoPgFormaIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderPgFormaEntity[]>;
}

export interface OrderFindCoProtocolIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderProtocolEntity[]>;
}

export interface OrderFindCoSellerIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderSellerEntity[]>;
}

export interface OrderFindCoSummaryIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderSalesSummaryEntity[]>;
}

export interface OrderFindCoTipoFreteResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderTipoFreteEntity[]>;
}

export interface OrderFindDashboardIdResponse extends OrderSalesBaseResponse {
  data: {
    "Order Summary": OrderSalesSummaryEntity[];
    "Order Details": OrderDashboardDetailsEntity[];
    "Order Items": OrderDashboardItemEntity[];
    "Customer Details": OrderCustomerEntity[];
  };
}

export interface OrderFindEquipmentIdResponse extends OrderSalesBaseResponse {
  data: Record<string, OrderEquipmentEntity[]>;
}

// === Error Classes ===

export class OrderSalesError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderSalesError";
    Object.setPrototypeOf(this, OrderSalesError.prototype);
  }
}

export class OrderSalesNotFoundError extends OrderSalesError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Dados do pedido não encontrados com os parâmetros: ${JSON.stringify(params)}`
      : "Dados do pedido não encontrados";
    super(message, "ORDER_SALES_NOT_FOUND", 100404);
    this.name = "OrderSalesNotFoundError";
    Object.setPrototypeOf(this, OrderSalesNotFoundError.prototype);
  }
}

export class OrderSalesValidationError extends OrderSalesError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_SALES_VALIDATION_ERROR", 100400);
    this.name = "OrderSalesValidationError";
    Object.setPrototypeOf(this, OrderSalesValidationError.prototype);
  }
}
