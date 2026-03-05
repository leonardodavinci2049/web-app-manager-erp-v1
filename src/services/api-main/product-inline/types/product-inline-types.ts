import "server-only";

interface ProductInlineBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
  pe_product_id?: number;
}

interface ProductInlineBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface UpdateProductBrandInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_brand_id: number;
}

export interface UpdateProductDescriptionInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_product_description: string;
}

export interface UpdateProductNameInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_product_name: string;
}

export interface UpdateProductImagePathInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_path_imagem: string;
}

export interface UpdateProductShortDescriptionInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_descricao_curta: string;
}

export interface UpdateProductStockMinInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_stock_min: number;
}

export interface UpdateProductStockInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_stock: number;
}

export interface UpdateProductTypeInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_type_id: number;
}

export interface UpdateProductVariousInlineRequest
  extends ProductInlineBaseRequest {
  pe_product_id: number;
  pe_termo: string;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface ProductInlineResponse extends ProductInlineBaseResponse {
  data: StoredProcedureResponse[];
}

export class ProductInlineError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductInlineError";
    Object.setPrototypeOf(this, ProductInlineError.prototype);
  }
}

export class ProductInlineNotFoundError extends ProductInlineError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto não encontrado";
    super(message, "PRODUCT_INLINE_NOT_FOUND", 100404);
    this.name = "ProductInlineNotFoundError";
    Object.setPrototypeOf(this, ProductInlineNotFoundError.prototype);
  }
}

export class ProductInlineValidationError extends ProductInlineError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_INLINE_VALIDATION_ERROR", 100400);
    this.name = "ProductInlineValidationError";
    Object.setPrototypeOf(this, ProductInlineValidationError.prototype);
  }
}
