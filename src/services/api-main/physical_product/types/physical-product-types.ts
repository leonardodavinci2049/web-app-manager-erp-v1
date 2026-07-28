import "server-only";

interface PhysicalProductBaseRequest {
  pe_app_id?: number;
  pe_store_id?: number;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface PhysicalProductBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface PhysicalProductFindAllRequest
  extends PhysicalProductBaseRequest {
  pe_product_id?: number;
  pe_stock_flag?: number;
  pe_limit?: number;
}

export interface OrderItemFindAllCustomerRequest
  extends PhysicalProductBaseRequest {
  pe_customer_id: number;
  pe_search?: string;
  pe_limit?: number;
}

export interface OrderItemFindIdCustomerRequest
  extends PhysicalProductBaseRequest {
  pe_customer_id: number;
  pe_movement_id?: number;
}

export interface PhysicalProductWarrantyIdRequest
  extends PhysicalProductBaseRequest {
  pe_physical_id?: number;
}

export interface PhysicalProductWarrantyIdCustomerRequest
  extends PhysicalProductBaseRequest {
  pe_customer_id: number;
  pe_physical_id?: number;
}

export interface PhysicalProductWarrantyMovRequest
  extends PhysicalProductBaseRequest {
  pe_movement_id?: number;
  pe_product_id?: number;
  pe_limit?: number;
}

export interface PhysicalProductWarrantyMovCustomerRequest
  extends PhysicalProductBaseRequest {
  pe_customer_id: number;
  pe_movement_id?: number;
  pe_product_id?: number;
  pe_limit?: number;
}

export interface PhysicalProductWarrantySearchRequest
  extends PhysicalProductBaseRequest {
  pe_customer_id?: number;
  PE_search?: string;
  pe_limit?: number;
}

export interface PhysicalProductEntity {
  ID_FISICO: number;
  ID_LOJA: number;
  ID_PRODUTO: number;
  PRODUTO: string;
  TEMPODEGARANTIA_MES: number;
  IMPORTADO: number;
  ETIQUETA: string;
  N_SERIE: string | null;
  COD_BARRAS: string | null;
  TAMANHO: string | null;
  DESCRICAO: string | null;
  FORNECEDOR: string | null;
  FRETADOR: string | null;
  ID_EMPRESA: number;
  ID_ENTRADA: number;
  ID_ENTRADA_MOVIMENTO: number;
  DATA_ULT_ENTRADA: string | null;
  DT_ENTRADA: string | null;
  NF_ENTRADA: string | null;
  VL_CUSTO: string | null;
  DATA_PEDIDO: string | null;
  ID_PEDIDO: number | null;
  ID_PEDIDO_MOVIMENTO: number | null;
  ID_STATUS: number;
  ID_CLIENTE: number | null;
  CLIENTE: string | null;
  id_tipo_cliente: number | null;
  VL_VENDA: string | null;
  VENDEDOR: string | null;
  ESTOQUE: number;
  ID_LOCALIZACAO: number;
  LOCATION: string | null;
  DT_RETIRADA: string | null;
  HORA: string | null;
  DATA: string | null;
  NF_SAIDA: string | null;
  ID_STATUSRMA: number;
  GARANTIA: string | null;
  HISTORICO: string | null;
  DT_CADASTRO: string | null;
}

export interface OrderItemCustomerEntity {
  ID_MOVIMENTO: number;
  ID_PEDIDO: number;
  DATA_PEDIDO: string | null;
  ID_STATUS_PEDIDO: number;
  STATUS_PEDIDO: string;
  ID_PRODUTO: number;
  DESCRICAO: string;
  QT: number;
  VL_UNITARIO: string;
  MODELO: string;
  REF: string;
  ETIQUETA: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  PATH_IMAGEM: string;
  PATH_PAGE: string;
  TEMPODEGARANTIA_DIA: number;
  QT_ESTORNADA: number;
  VL_DESCONTO_ADM: string;
  VL_DESCONTO: string;
  VL_DESCONTO_TOTAL: string;
  VL_SUBTOTAL: string;
  VL_TOTAL: string;
  ID_STATUS_FINANCEIRO: number;
  STATUS_FINANCEIRO: string;
  ID_CLIENTE: number;
  CLIENTE: string;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  ID_TIPO_CLIENTE: number;
  ACCOUNT_STATUS: string;
  VENDEDOR: string;
  DATADOCADASTRO: string;
}

export interface PhysicalProductWarrantyEntity {
  GARANTIA_ID: number;
  ID_PRODUTO?: number | null;
  PRODUTO: string;
  ID_TIPO: number;
  TIPO: string;
  ID_MARCA: number;
  MARCA: string;
  TEMPODEGARANTIA_DIA: number;
  ETIQUETA: string;
  N_SERIE: string | null;
  COD_BARRAS: string | null;
  LOCATION: string | null;
  DATA_PEDIDO: string | null;
  ID_PEDIDO: number;
  ID_MOVIMENTO: number;
  ID_STATUS_PEDIDO: number;
  STATUS_PEDIDO: string;
  ID_STATUS_FINANCEIRO: number;
  STATUS_FINANCEIRO: string;
  ID_CLIENTE: number;
  CLIENTE: string;
  ID_PESSOA_TIPO: number;
  ACCOUNT_TIPO: string;
  ID_TIPO_CLIENTE: number;
  ACCOUNT_STATUS: string;
  VENDEDOR: string;
  VL_VENDA: string;
  DT_RETIRADA: string | null;
  GARANTIA_LIMITE: string | null;
  STATUS_GARANTIA: string;
}

export interface PhysicalProductWarrantyWithProductEntity
  extends PhysicalProductWarrantyEntity {
  ID_PRODUTO: number;
}

export interface PhysicalProductFindAllResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Physical Product find all": PhysicalProductEntity[];
  };
}

export interface OrderItemFindAllCustomerResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Order Item find all": OrderItemCustomerEntity[];
  };
}

export interface OrderItemFindIdCustomerResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Order Item find Id ": OrderItemCustomerEntity[];
  };
}

export interface PhysicalProductWarrantyIdResponse
  extends PhysicalProductBaseResponse {
  data: {
    "warranty find id customer": PhysicalProductWarrantyWithProductEntity[];
  };
}

export interface PhysicalProductWarrantyIdCustomerResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Warranty mov customer": PhysicalProductWarrantyWithProductEntity[];
  };
}

export interface PhysicalProductWarrantyMovResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Warranty mov": PhysicalProductWarrantyWithProductEntity[];
  };
}

export interface PhysicalProductWarrantyMovCustomerResponse
  extends PhysicalProductBaseResponse {
  data: {
    "warranty find id": PhysicalProductWarrantyWithProductEntity[];
  };
}

export interface PhysicalProductWarrantySearchResponse
  extends PhysicalProductBaseResponse {
  data: {
    "Warranty search": PhysicalProductWarrantyEntity[];
  };
}

export class PhysicalProductError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PhysicalProductError";
    Object.setPrototypeOf(this, PhysicalProductError.prototype);
  }
}

export class PhysicalProductNotFoundError extends PhysicalProductError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Dados de produto físico não encontrados com os parâmetros: ${JSON.stringify(params)}`
      : "Dados de produto físico não encontrados";
    super(message, "PHYSICAL_PRODUCT_NOT_FOUND", 100404);
    this.name = "PhysicalProductNotFoundError";
    Object.setPrototypeOf(this, PhysicalProductNotFoundError.prototype);
  }
}

export class PhysicalProductValidationError extends PhysicalProductError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PHYSICAL_PRODUCT_VALIDATION_ERROR", 100400);
    this.name = "PhysicalProductValidationError";
    Object.setPrototypeOf(this, PhysicalProductValidationError.prototype);
  }
}
