/**
 * Constantes da API para endpoints e configurações
 */

import { envs } from "@/core/config";

// URL base da API Externa (Servidor NestJS) - apenas server-side
// Esta é a URL do backend que fornece os dados via REST API
export const EXTERNAL_API_BASE_URL = envs.EXTERNAL_API_MAIN_URL;

// Configurações de timeout (em milissegundos)
export const API_TIMEOUTS = {
  CLIENT_DEFAULT: 15000, // 15 segundos para requisições normais do cliente
  CLIENT_UPLOAD: 60000, // 60 segundos para uploads de arquivos
  SERVER_DEFAULT: 30000, // 30 segundos para requisições normais do servidor
  SERVER_LONG_RUNNING: 120000, // 120 segundos para operações longas (relatórios, exports)
  SERVER_UPLOAD: 180000, // 180 segundos para uploads grandes no servidor
} as const;

// Endpoints de Produto
export const PRODUCT_ENDPOINTS = {
  // Query endpoints
  FIND_BY_ID: "/product/v2/product-find-id",
  FIND: "/product/v2/product-find",

  // Create endpoint
  CREATE: "/product/v2/product-create",

  // Update endpoints
  UPDATE_GENERAL: "/product/v2/product-upd-general",
  UPDATE_NAME: "/product/v2/product-upd-name",
  UPDATE_TYPE: "/product/v2/product-upd-type",
  UPDATE_BRAND: "/product/v2/product-upd-brand",
  UPDATE_STOCK: "/product/v2/product-upd-stock",
  UPDATE_PRICE: "/product/v2/product-upd-price",
  UPDATE_FLAGS: "/product/v2/product-upd-flags",
  UPDATE_CHARACTERISTICS: "/product/v2/product-upd-caracteristics",
  UPDATE_TAX_VALUES: "/product/v2/product-upd-tax-values",
  UPDATE_SHORT_DESCRIPTION: "/product/v2/product-upd-short-description",
  UPDATE_DESCRIPTION: "/product/v2/product-upd-description",
  UPDATE_VARIOUS: "/product/v2/product-upd-variou",
  UPDATE_IMAGE_PATH: "/product/v2/product-upd-path-image",
  UPDATE_METADATA: "/product/v2/product-upd-metadata",
} as const;

// Endpoints de Produto Inline (V3)
export const PRODUCT_INLINE_ENDPOINTS = {
  UPDATE_BRAND: "/product-inline/v3/product-upd-inl-brand",
  UPDATE_DESCRIPTION: "/product-inline/v3/product-upd-inl-description",
  UPDATE_NAME: "/product-inline/v3/product-upd-inl-name",
  UPDATE_IMAGE_PATH: "/product-inline/v3/product-upd-inl-path-image",
  UPDATE_SHORT_DESCRIPTION:
    "/product-inline/v3/product-upd-inl-short-description",
  UPDATE_STOCK_MIN: "/product-inline/v3/product-upd-inl-stock-min",
  UPDATE_STOCK: "/product-inline/v3/product-upd-inl-stock",
  UPDATE_TYPE: "/product-inline/v3/product-upd-inl-type",
  UPDATE_VARIOUS: "/product-inline/v3/product-upd-inl-variou",
} as const;

// Endpoints de Product Update (V3) - Mutations agrupadas
export const PRODUCT_UPDATE_ENDPOINTS = {
  UPDATE_CHARACTERISTICS: "/product-update/v3/product-upd-characteristics",
  UPDATE_FLAGS: "/product-update/v3/product-upd-flags",
  UPDATE_GENERAL: "/product-update/v3/product-upd-general",
  UPDATE_METADATA: "/product-update/v3/product-upd-metadata",
  UPDATE_PRICE: "/product-update/v3/product-upd-price",
  UPDATE_TAX_VALUES: "/product-update/v3/product-upd-tax-values",
} as const;

// Endpoints de Product Base (V3) - CRUD completo
export const PRODUCT_BASE_ENDPOINTS = {
  FIND_ALL: "/product-base/v3/product-find-all",
  FIND_BY_ID: "/product-base/v3/product-find-id",
  SEARCH_ALL: "/product-base/v3/product-search-all",
  CREATE: "/product-base/v3/product-create",
} as const;

// Endpoints de Taxonomy Base (V3) - CRUD completo
export const TAXONOMY_BASE_ENDPOINTS = {
  FIND_ALL: "/taxonomy-base/v3/taxonomy-find-all",
  FIND_BY_ID: "/taxonomy-base/v3/taxonomy-find-id",
  FIND_MENU: "/taxonomy-base/v3/taxonomy-find-menu",
  CREATE: "/taxonomy-base/v3/taxonomy-create",
  UPDATE: "/taxonomy-base/v3/taxonomy-update",
  DELETE: "/taxonomy-base/v3/taxonomy-delete",
  UPDATE_METADATA: "/taxonomy-base/v3/taxonomy-upd-metadata",
} as const;

// Endpoints de Taxonomy Inline (V3) - Mutations inline
export const TAXONOMY_INLINE_ENDPOINTS = {
  UPDATE_IMAGE_PATH: "/taxonomy-inline/v3/taxonomy-upd-inl-image-path",
  UPDATE_INACTIVE: "/taxonomy-inline/v3/taxonomy-upd-inl-inactive",
  UPDATE_NAME: "/taxonomy-inline/v3/taxonomy-upd-inl-name",
  UPDATE_NOTES: "/taxonomy-inline/v3/taxonomy-upd-inl-notes",
  UPDATE_ORDER: "/taxonomy-inline/v3/taxonomy-upd-inl-order",
  UPDATE_PARENT_ID: "/taxonomy-inline/v3/taxonomy-upd-inl-parent-id",
  UPDATE_QT_PRODUCTS: "/taxonomy-inline/v3/taxonomy-upd-inl-qt-products",
  UPDATE_SLUG: "/taxonomy-inline/v3/taxonomy-upd-inl-slug",
} as const;

// Endpoints de Taxonomy Rel (V3) - Relações taxonomia↔produto
export const TAXONOMY_REL_ENDPOINTS = {
  FIND_ALL_PRODUCTS: "/taxonomy-rel/v3/taxonomy-rel-produto-all",
  CREATE: "/taxonomy-rel/v3/taxonomy-rel-create",
  DELETE: "/taxonomy-rel/v3/taxonomy-rel-delete",
} as const;

// Endpoints de Produto Web
export const PRODUCT_WEB_ENDPOINTS = {
  FIND_BY_ID: "/product/v2/product-web-find-id",
  FIND: "/product/v2/product-web-find",
  SECTIONS: "/product/v2/product-web-sections",
} as const;

// Endpoints de Carrinho
export const CART_ENDPOINTS = {
  ADD_ITEM: "/cart/v1/cart-item-add",
  UPDATE_QUANTITY: "/cart/v1/cart-item-qt-update",
  DELETE_ITEM: "/cart/v1/cart-item-delete",
  SELECT_ITEMS: "/cart/v1/cart-items-select",
  VIEW_CUSTOMER: "/cart/v1/cart-view-customer",
  CREATE_ORDER: "/cart/v1/cart-order-create",
  QUANTITY_ITEMS: "/cart/v1/cart-quantity-items",
  CLEAR_ALL: "/cart/v1/cart-clear-all",
} as const;

// Endpoints de Cliente (Legacy - Cart)
export const CUSTOMER_ENDPOINTS = {
  CHECK_CUSTOMER: "/cart/v1/cart-check-customer",
} as const;

// Endpoints de Cliente (General)
export const CUSTOMER_GENERAL_ENDPOINTS = {
  FIND_ALL: "/customer/v2/customer-find-all",
  FIND_BY_ID: "/customer/v2/customer-find-by-id",
  CREATE: "/customer/v2/customer-create",
  FIND_LATEST_PRODUCTS: "/customer/v2/customer-find-latest-products",
} as const;

// Endpoints de Cliente (Update - seções do cadastro)
export const CUSTOMER_UPD_ENDPOINTS = {
  UPD_GENERAL: "/customer-upd/v2/customer-upd-general",
  UPD_PERSONAL: "/customer-upd/v2/customer-upd-personal",
  UPD_BUSINESS: "/customer-upd/v2/customer-upd-business",
  UPD_ADDRESS: "/customer-upd/v2/customer-upd-address",
  UPD_INTERNET: "/customer-upd/v2/customer-upd-internet",
  UPD_FLAG: "/customer-upd/v2/customer-upd-flag",
} as const;

// Endpoints de Cliente (Inline Update - campo individual)
export const CUSTOMER_INLINE_ENDPOINTS = {
  UPD_EMAIL: "/customer-inline/v2/customer-upd-inline-email",
  UPD_NAME: "/customer-inline/v2/customer-upd-inline-name",
  UPD_NOTES: "/customer-inline/v2/customer-upd-inline-notes",
  UPD_PHONE: "/customer-inline/v2/customer-upd-inline-phone",
  UPD_SELLER_ID: "/customer-inline/v2/customer-upd-inline-seller-id",
  UPD_TYPE_CUSTOMER: "/customer-inline/v2/customer-upd-inline-type-customer",
  UPD_TYPE_PERSON: "/customer-inline/v2/customer-upd-inline-type-person",
  UPD_WHATSAPP: "/customer-inline/v2/customer-upd-inline-whatsapp",
} as const;

// Endpoints de Category (Legacy)
export const CATEGORY_ENDPOINTS = {
  FIND_MENU: "/category/v1/category-find-menu",
  FIND_BY_ID: "/category/v1/category-find-id",
} as const;

// Endpoints de Checkout
export const CHECKOUT_ENDPOINTS = {
  VIEW_CUSTOMER: "/cart/v1/cart-view-customer",
  CREATE_ORDER: "/cart/v1/cart-order-create",
} as const;

// Endpoints de Taxonomy
export const TAXONOMY_ENDPOINTS = {
  FIND_MENU: "/taxonomy/v2/taxonomy-find-menu",
  FIND: "/taxonomy/v2/taxonomy-find",
  FIND_BY_ID: "/taxonomy/v2/taxonomy-find-id",
  CREATE: "/taxonomy/v2/taxonomy-create",
  UPDATE: "/taxonomy/v2/taxonomy-update",
  DELETE: "/taxonomy/v2/taxonomy-delete",
  REL_CREATE: "/taxonomy/v2/taxonomy-rel-create",
  REL_PRODUTO: "/taxonomy/v2/taxonomy-rel-produto",
  REL_DELETE: "/taxonomy/v2/taxonomy-rel-delete",
  UPDATE_INACTIVE: "/taxonomy/v2/taxonomy-upd-inactive",
  UPDATE_METADATA: "/taxonomy/v2/taxonomy-upd-metadata",
  UPDATE_NAME: "/taxonomy/v2/taxonomy-upd-name",
  UPDATE_ORDEM: "/taxonomy/v2/taxonomy-upd-ordem",
  UPDATE_PARENT_ID: "/taxonomy/v2/taxonomy-upd-parent-id",
  UPDATE_PATH_IMAGE: "/taxonomy/v2/taxonomy-upd-path-image",
} as const;

// Endpoints de Product Type
export const PTYPE_ENDPOINTS = {
  FIND_ALL: "/ptype/v2/ptype-find-all",
  FIND_BY_ID: "/ptype/v2/ptype-find-id",
  CREATE: "/ptype/v2/ptype-create",
  UPDATE: "/ptype/v2/ptype-update",
  DELETE: "/ptype/v2/ptype-delete",
} as const;

// Endpoints de Brand
export const BRAND_ENDPOINTS = {
  FIND_ALL: "/brand/v2/brand-find-all",
  FIND_BY_ID: "/brand/v2/brand-find-id",
  CREATE: "/brand/v2/brand-create",
  UPDATE: "/brand/v2/brand-update",
  DELETE: "/brand/v2/brand-delete",
} as const;

// Endpoints de Product PDV
export const PRODUCT_PDV_ENDPOINTS = {
  FIND_ALL: "/product-pdv/v2/product-find-pdv-all",
  FIND_BY_ID: "/product-pdv/v2/product-find-pdv-id",
  FIND_SEARCH: "/product-pdv/v2/product-find-pdv-search",
} as const;

// Endpoints de Carrier
export const CARRIER_ENDPOINTS = {
  FIND_ALL: "/carrier/v2/carrier-find-all",
  FIND_BY_ID: "/carrier/v2/carrier-find-id",
  CREATE: "/carrier/v2/carrier-create",
  UPDATE: "/carrier/v2/carrier-update",
  DELETE: "/carrier/v2/carrier-delete",
} as const;

// Endpoints de Supplier
export const SUPPLIER_ENDPOINTS = {
  FIND_ALL: "/supplier/v2/supplier-find-all",
  FIND_BY_ID: "/supplier/v2/supplier-find-id",
  CREATE: "/supplier/v2/supplier-create",
  UPDATE: "/supplier/v2/supplier-update",
  DELETE: "/supplier/v2/supplier-delete",
  REL_CREATE: "/supplier/v2/supplier-rel-create",
  REL_DELETE: "/supplier/v2/supplier-rel-delete",
  REL_FIND_PROD_ALL: "/supplier/v2/supplier-rel-find-prod-all",
} as const;

// Endpoints de Account (Dashboard da Conta)
export const ACCOUNT_ENDPOINTS = {
  // Endpoints de consulta (01-09)
  STATISTICS: "/account/v1/find-account-statistics",
  LATEST_ORDERS: "/account/v1/find-account-orders-latest",
  SUMMARY: "/account/v1/find-account-summary",
  PROFILE: "/account/v1/find-account-profile",
  ORDERS_LIST: "/account/v1/find-account-orders-list",
  ORDER_SUMMARY: "/account/v1/find-account-orders-summary",
  PROMOTIONS: "/account/v1/find-account-promotion",
  SERVICES: "/account/v1/find-account-services",
  CONFIG: "/account/v1/find-account-config",

  // Endpoints de atualização (10-19)
  UPDATE_GENERAL: "/account/v1/upd-account-general",
  UPDATE_TYPE: "/account/v1/upd-account-type",
  UPDATE_BUSINESS: "/account/v1/upd-account-business",
  UPDATE_PERSONAL: "/account/v1/upd-account-personal",
  UPDATE_ADDRESS: "/account/v1/upd-account-address",
  UPDATE_SOCIAL: "/account/v1/upd-account-internet",
  UPDATE_THEME: "/account/v1/upd-account-theme",
  UPDATE_NOTIFICATIONS: "/account/v1/upd-account-notification",
  UPDATE_EMAIL: "/account/v1/upd-account-email",
  UPDATE_PASSWORD: "/account/v1/upd-account-password",
} as const;

// Endpoints de Order Items
export const ORDER_ITEMS_ENDPOINTS = {
  FIND_ALL: "/order-items/v2/order-items-find-all",
  FIND_BY_ID: "/order-items/v2/order-items-find-id",
  DELETE: "/order-items/v2/order-items-delete",
  DISCOUNT: "/order-items/v2/order-items-discount",
  DISCOUNT_ADM: "/order-items/v2/order-items-discount-adm",
  FRETE_VL: "/order-items/v2/order-items-frete-vl",
  INSURANCE_VL: "/order-items/v2/order-items-insurance-vl",
  NOTES: "/order-items/v2/order-items-notes",
  QT: "/order-items/v2/order-items-qt",
  VALUE: "/order-items/v2/order-items-value",
} as const;

// Endpoints de Order Operations
export const ORDER_OPERATIONS_ENDPOINTS = {
  CREATE: "/order-operation/v2/order-oper-create",
  ADD_ITEM: "/order-operation/v2/order-oper-add-item",
  CLOSE: "/order-operation/v2/order-oper-close-id",
  REVERSE: "/order-operation/v2/order-oper-reverse-id",
  SENDING_BY_EMAIL: "/order-operation/v2/order-oper-sending-by-email",
} as const;

// Endpoints de Order Reports
export const ORDER_REPORTS_ENDPOINTS = {
  FIND_CUSTOMER_ALL: "/order-reports/v2/order-find-customer-all",
  FIND_CUSTOMER_ID: "/order-reports/v2/order-find-customer-id",
  FIND_LATEST_ALL: "/order-reports/v2/order-find-latest-all",
  FIND_LATEST_ID: "/order-reports/v2/order-find-latest-id",
  FIND_SALE_ALL: "/order-reports/v2/order-find-sale-all",
  FIND_SALE_ID: "/order-reports/v2/order-find-sale-id",
  FIND_SELLER_ALL: "/order-reports/v2/order-find-seller-all",
} as const;

// Endpoints de Order Sales
export const ORDER_SALES_ENDPOINTS = {
  FIND_CO_CARRIER_ID: "/order-sales/v2/order-find-co-carrier-id",
  FIND_CO_CUSTOMER_ID: "/order-sales/v2/order-find-co-customer-id",
  FIND_CO_DELIVERY_ID: "/order-sales/v2/order-find-co-delivery-id",
  FIND_CO_HISTORY_ID: "/order-sales/v2/order-find-co-history-id",
  FIND_CO_NF_ID: "/order-sales/v2/order-find-co-nf-id",
  FIND_CO_PG_FORMA_ID: "/order-sales/v2/order-find-co-pg-forma-id",
  FIND_CO_PROTOCOL_ID: "/order-sales/v2/order-find-co-protocol-id",
  FIND_CO_SELLER_ID: "/order-sales/v2/order-find-co-seller-id",
  FIND_CO_SUMMARY_ID: "/order-sales/v2/order-find-co-summary-id",
  FIND_DASHBOARD_ID: "/order-sales/v2/order-find-dashboard-id",
  FIND_EQUIPMENT_ID: "/order-sales/v2/order-find-equipment-id",
} as const;

// Endpoints de Order Update
export const ORDER_UPD_ENDPOINTS = {
  UPD_CUSTOMER_ID: "/order-upd/v2/order-upd-customer-id",
  UPD_DISCOUNT_ID: "/order-upd/v2/order-upd-discount-id",
  UPD_FRETE_ID: "/order-upd/v2/order-upd-frete-id",
  UPD_NOTES_ID: "/order-upd/v2/order-upd-notes-id",
  UPD_PG_METHOD_ID: "/order-upd/v2/order-upd-pg-method-id",
  UPD_SELLER_ID: "/order-upd/v2/order-upd-seller-id",
  UPD_STATUS_ID: "/order-upd/v2/order-upd-status-id",
} as const;

// Endpoints de Validação (Check if Exists)
export const CHECK_ENDPOINTS = {
  STATUS: "/check", // Health check endpoint (GET)
  EMAIL: "/check/v3/check-if-email-exists",
  CPF: "/check/v3/check-if-cpf-exists",
  CNPJ: "/check/v3/check-if-cnpj-exists",
  TAXONOMY_NAME: "/check/v3/check-if-taxonomy-name-exists",
  TAXONOMY_SLUG: "/check/v3/check-if-taxonomy-slug-exists",
  PRODUCT_NAME: "/check/v3/check-if-product-name-exists",
  PRODUCT_SLUG: "/check/v3/check-if-product-slug-exists",
} as const;

// Configurações padrão do sistema
export const SYSTEM_CONFIG = {
  ID_SYSTEM: 1,
  ID_LOJA: 1,
  ID_TIPO: 1,
} as const;

// Headers padrão para requisições
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
} as const;

// Configurações de retry
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  RETRY_CODES: [408, 429, 500, 502, 503, 504],
} as const;

// Tipos de resposta da API
/**
 * Códigos de status da API externa (NestJS)
 * ATENÇÃO: São diferentes dos códigos HTTP padrão
 * A API retorna códigos customizados no formato 100XXX
 */
export const API_STATUS_CODES = {
  SUCCESS: 100200, // Operação bem-sucedida
  EMPTY_RESULT: 100204, // Busca válida mas sem resultados
  ERROR: 100400, // Erro de validação ou regra de negócio
  NOT_FOUND: 100404, // Recurso não encontrado
  UNPROCESSABLE: 100422, // Entidade não processável (deprecated - usar NOT_FOUND)
} as const;

/**
 * Mapeia os códigos de status customizados da API para códigos HTTP padrão
 * Útil para integração com bibliotecas que esperam status HTTP convencionais
 *
 * @param apiStatus - Código de status da API (100XXX)
 * @returns Código HTTP padrão correspondente
 *
 * @example
 * ```typescript
 * const httpStatus = mapApiStatusToHttp(100200); // 200
 * const notFoundStatus = mapApiStatusToHttp(100404); // 404
 * ```
 */
export function mapApiStatusToHttp(apiStatus: number): number {
  switch (apiStatus) {
    case API_STATUS_CODES.SUCCESS:
      return 200;
    case API_STATUS_CODES.EMPTY_RESULT:
      return 204;
    case API_STATUS_CODES.NOT_FOUND:
    case API_STATUS_CODES.UNPROCESSABLE:
      return 404;
    case API_STATUS_CODES.ERROR:
      return 400;
    default:
      return 500;
  }
}

/**
 * Verifica se um código de status da API representa sucesso
 *
 * @param apiStatus - Código de status da API
 * @returns true se for código de sucesso
 */
export function isApiSuccess(apiStatus: number): boolean {
  return (
    apiStatus === API_STATUS_CODES.SUCCESS ||
    apiStatus === API_STATUS_CODES.EMPTY_RESULT
  );
}

/**
 * Verifica se um código de status da API representa erro
 *
 * @param apiStatus - Código de status da API
 * @returns true se for código de erro
 */
export function isApiError(apiStatus: number): boolean {
  return !isApiSuccess(apiStatus);
}
