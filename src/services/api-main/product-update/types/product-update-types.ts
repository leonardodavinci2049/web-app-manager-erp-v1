import "server-only";

interface ProductUpdateBaseRequest {
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

interface ProductUpdateBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface UpdateProductCharacteristicsRequest
  extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_weight_gr?: number;
  pe_length_mm?: number;
  pe_width_mm?: number;
  pe_height_mm?: number;
  pe_diameter_mm?: number;
  pe_warranty_period_days?: number;
  pe_warranty_period_months?: number;
}

export interface UpdateProductFlagsRequest extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_inactive_flag?: number;
  pe_imported_flag?: number;
  pe_physical_control_flag?: number;
  pe_stock_control_flag?: number;
  pe_featured_flag?: number;
  pe_promotion_flag?: number;
  pe_discontinued_flag?: number;
  pe_service_flag?: number;
  pe_website_off_flag?: number;
}

export interface UpdateProductGeneralRequest extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_product_name?: string;
  pe_ref?: string;
  pe_model?: string;
  pe_label?: string;
  pe_tab_description?: string;
}

export interface UpdateProductMetadataRequest extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_meta_title?: string;
  pe_meta_description?: string;
}

export interface UpdateProductPriceRequest extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_wholesale_price?: number;
  pe_corporate_price?: number;
  pe_retail_price?: number;
}

export interface UpdateProductTaxValuesRequest
  extends ProductUpdateBaseRequest {
  pe_product_id: number;
  pe_cfop?: string;
  pe_cst?: string;
  pe_ean?: string;
  pe_nbm?: string;
  pe_ncm?: number;
  pe_ppb?: number;
  pe_temp?: number;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface ProductUpdateResponse extends ProductUpdateBaseResponse {
  data: StoredProcedureResponse[];
}

export class ProductUpdateError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "ProductUpdateError";
    Object.setPrototypeOf(this, ProductUpdateError.prototype);
  }
}

export class ProductUpdateNotFoundError extends ProductUpdateError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Produto não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Produto não encontrado";
    super(message, "PRODUCT_UPDATE_NOT_FOUND", 100404);
    this.name = "ProductUpdateNotFoundError";
    Object.setPrototypeOf(this, ProductUpdateNotFoundError.prototype);
  }
}

export class ProductUpdateValidationError extends ProductUpdateError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "PRODUCT_UPDATE_VALIDATION_ERROR", 100400);
    this.name = "ProductUpdateValidationError";
    Object.setPrototypeOf(this, ProductUpdateValidationError.prototype);
  }
}
