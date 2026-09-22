import "server-only";

interface AppConfigBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

interface AppConfigBaseResponse {
  statusCode: number;
  message: string;
  recordId: number | string;
  quantity: number;
  errorId: number;
  info1?: string;
}

export interface AppConfigFindAllRequest extends AppConfigBaseRequest {
  pe_customer_id?: number;
}

export interface AppConfigFindByIdRequest extends AppConfigBaseRequest {
  pe_config_id: number;
}

export interface AppMenuFindByTypeRequest extends AppConfigBaseRequest {
  pe_customer_id?: number;
  pe_type: string;
}

export interface AppConfigUpdateGeneralFieldRequest
  extends AppConfigBaseRequest {
  pe_register_id: number;
  pe_field_type: number;
  pe_field: string;
  pe_value_str?: string | null;
  pe_value_int?: number | null;
  pe_value_numeric?: number | null;
  pe_value_date?: string | null;
}

export interface AppConfig {
  ID: number;
  APP_NAME: string | null;
  CLIENT_NAME: string | null;
  GENERAL_CONFIG_JSON: string | null;
  COMPANY_INFO_JSON: string | null;
  COMPANY_ABOUT_JSON: string | null;
  COMPANY_ADDRESS_JSON: string | null;
  COMPANY_SEO_JSON: string | null;
  COMPANY_FAQ_JSON: string | null;
  COMPANY_LINKS_JSON: string | null;
  PAYMENT_METHOD_JSON: string | null;
  HOME_INFO_JSON: string | null;
  HOME_BRAND_JSON: string | null;
  HOME_CATEGORY_JSON: string | null;
  HOME_SECTION_JSON: string | null;
  HOME_MENU_JSON: string | null;
  HOME_HERO_JSON: string | null;
  IS_ACTIVE: number | null;
  UPDATEDAT: string | null;
}

export interface AppMenuEntry {
  ID: number;
  APP_ID: number | null;
  PARENT_ID: number | null;
  NAME: string | null;
  SLUG: string | null;
  URL: string | null;
  TYPE: string | null;
  ICON: string | null;
  IMAGE_URL: string | null;
  CSS_CLASS: string | null;
  SORT_ORDER: number | null;
  IS_ACTIVE: number | null;
  NOTES: string | null;
  CREATEDAT: string | null;
  UPDATEDAT: string | null;
}

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

export interface AppConfigFindAllResponse extends AppConfigBaseResponse {
  data: {
    "App Config": AppConfig[];
  };
}

export interface AppConfigFindByIdResponse extends AppConfigBaseResponse {
  data: {
    "App Config": AppConfig[];
  };
}

export interface AppMenuFindByTypeResponse extends AppConfigBaseResponse {
  data: {
    "App Menu": AppMenuEntry[];
  };
}

export interface AppConfigMutationResponse extends AppConfigBaseResponse {
  data: StoredProcedureResponse[];
}

export class AppConfigError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AppConfigError";
    Object.setPrototypeOf(this, AppConfigError.prototype);
  }
}

export class AppConfigNotFoundError extends AppConfigError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Configuração do aplicativo não encontrada com os parâmetros: ${JSON.stringify(params)}`
      : "Configuração do aplicativo não encontrada";
    super(message, "APP_CONFIG_NOT_FOUND", 100404);
    this.name = "AppConfigNotFoundError";
    Object.setPrototypeOf(this, AppConfigNotFoundError.prototype);
  }
}

export class AppConfigValidationError extends AppConfigError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "APP_CONFIG_VALIDATION_ERROR", 100400);
    this.name = "AppConfigValidationError";
    Object.setPrototypeOf(this, AppConfigValidationError.prototype);
  }
}
