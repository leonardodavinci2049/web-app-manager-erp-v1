import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PRODUCT_MANAGER_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformProductManager,
  transformProductManagerList,
  transformProductManagerSearchList,
  transformRelatedCategories,
  type UIProductManager,
  type UIProductManagerRelatedCategory,
} from "./transformers/transformers";
import type {
  ProductManagerDetail,
  ProductManagerFindAllRequest,
  ProductManagerFindAllResponse,
  ProductManagerFindByIdRequest,
  ProductManagerFindByIdResponse,
  ProductManagerFindSearchRequest,
  ProductManagerFindSearchResponse,
  ProductManagerListItem,
  ProductManagerRelatedCategory,
  ProductManagerRelatedProduct,
  ProductManagerSearchItem,
} from "./types/product-manager-types";
import {
  ProductManagerError,
  ProductManagerNotFoundError,
} from "./types/product-manager-types";
import {
  ProductManagerFindAllSchema,
  ProductManagerFindByIdSchema,
  ProductManagerFindSearchSchema,
} from "./validation/product-manager-schemas";

const logger = createLogger("ProductManagerServiceApi");

export class ProductManagerServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllProductsManager(
    params: Partial<ProductManagerFindAllRequest> = {},
  ): Promise<ProductManagerFindAllResponse> {
    try {
      const validatedParams =
        ProductManagerFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_ean: validatedParams.pe_ean ?? "",
        pe_reference: validatedParams.pe_reference ?? "",
        pe_model: validatedParams.pe_model ?? "",
        pe_taxonomy_id: validatedParams.pe_taxonomy_id ?? 0,
        pe_type_id: validatedParams.pe_type_id ?? 0,
        pe_brand_id: validatedParams.pe_brand_id ?? 0,
        pe_supplier_id: validatedParams.pe_supplier_id ?? 0,
        pe_physical_id: validatedParams.pe_physical_id ?? 0,
        pe_flag_best_sellers: validatedParams.pe_flag_best_sellers ?? 0,
        pe_flag_lowest_selling: validatedParams.pe_flag_lowest_selling ?? 0,
        pe_flag_stalled_product: validatedParams.pe_flag_stalled_product ?? 0,
        pe_flag_latest_arrivals: validatedParams.pe_flag_latest_arrivals ?? 0,
        pe_flag_price_less_than: validatedParams.pe_flag_price_less_than ?? 0,
        pe_flag_low_stock: validatedParams.pe_flag_low_stock ?? 0,
        pe_flag_no_image: validatedParams.pe_flag_no_image ?? 0,
        pe_flag_no_description: validatedParams.pe_flag_no_description ?? 0,
        pe_flag_no_sales_copy: validatedParams.pe_flag_no_sales_copy ?? 0,
        pe_flag_promotion: validatedParams.pe_flag_promotion ?? 0,
        pe_flag_featured: validatedParams.pe_flag_featured ?? 0,
        pe_flag_imported: validatedParams.pe_flag_imported ?? 0,
        pe_flag_inactive: validatedParams.pe_flag_inactive ?? 0,
        pe_flag_consignment: validatedParams.pe_flag_consignment ?? 0,
        pe_flag_discontinued: validatedParams.pe_flag_discontinued ?? 0,
        pe_flag_no_inventory: validatedParams.pe_flag_no_inventory ?? 0,
        pe_flag_Website_Off: validatedParams.pe_flag_Website_Off ?? 0,
        pe_flag_Premium: validatedParams.pe_flag_Premium ?? 0,
        pe_flag_stock: validatedParams.pe_flag_stock ?? 0,
        pe_flag_service: validatedParams.pe_flag_service ?? 0,
        pe_flag_registration: validatedParams.pe_flag_registration ?? 0,
        pe_start_date: validatedParams.pe_start_date ?? "",
        pe_end_date: validatedParams.pe_end_date ?? "",
        pe_records_quantity: validatedParams.pe_records_quantity ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      const response = await this.post<ProductManagerFindAllResponse>(
        PRODUCT_MANAGER_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os produtos do Manager", error);
      throw error;
    }
  }

  async findProductManagerById(
    params: ProductManagerFindByIdRequest,
  ): Promise<ProductManagerFindByIdResponse> {
    try {
      const validatedParams = ProductManagerFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductManagerFindByIdResponse>(
        PRODUCT_MANAGER_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new ProductManagerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new ProductManagerError(
          response.message || "Erro ao buscar produto do Manager por ID",
          "PRODUCT_MANAGER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar produto do Manager por ID", error);
      throw error;
    }
  }

  async findProductsManagerSearch(
    params: Partial<ProductManagerFindSearchRequest> = {},
  ): Promise<ProductManagerFindSearchResponse> {
    try {
      const validatedParams =
        ProductManagerFindSearchSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_customer_id: validatedParams.pe_customer_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_flag_stock: validatedParams.pe_flag_stock,
        pe_limit: validatedParams.pe_limit,
      });

      const response = await this.post<ProductManagerFindSearchResponse>(
        PRODUCT_MANAGER_ENDPOINTS.FIND_SEARCH,
        requestBody,
      );

      return this.normalizeEmptyFindSearchResponse(response);
    } catch (error) {
      logger.error(
        "Erro ao buscar produtos do Manager por termo de pesquisa",
        error,
      );
      throw error;
    }
  }

  private normalizeEmptyFindAllResponse(
    response: ProductManagerFindAllResponse,
  ): ProductManagerFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product Manager find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyFindSearchResponse(
    response: ProductManagerFindSearchResponse,
  ): ProductManagerFindSearchResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product Manager find Search": [],
        },
      };
    }
    return response;
  }

  extractProductsManager(
    response: ProductManagerFindAllResponse,
  ): ProductManagerListItem[] {
    return response.data?.["Product Manager find All"] ?? [];
  }

  extractProductsManagerSearch(
    response: ProductManagerFindSearchResponse,
  ): ProductManagerSearchItem[] {
    return response.data?.["Product Manager find Search"] ?? [];
  }

  extractProductManagerById(
    response: ProductManagerFindByIdResponse,
  ): ProductManagerDetail | null {
    return response.data?.["Product Manager find Id"]?.[0] ?? null;
  }

  extractRelatedCategories(
    response: ProductManagerFindByIdResponse,
  ): ProductManagerRelatedCategory[] {
    return response.data?.["Related Categories"] ?? [];
  }

  extractRelatedProducts(
    response: ProductManagerFindByIdResponse,
  ): ProductManagerRelatedProduct[] {
    return response.data?.["Related Products"] ?? [];
  }

  isValidProductManagerList(response: ProductManagerFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Manager find All"])
    );
  }

  isValidProductManagerDetail(
    response: ProductManagerFindByIdResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Manager find Id"]) &&
      response.data["Product Manager find Id"].length > 0
    );
  }

  isValidProductManagerSearchList(
    response: ProductManagerFindSearchResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Product Manager find Search"])
    );
  }
}

export const productManagerServiceApi = new ProductManagerServiceApi();

export interface GetProductsManagerParams {
  search?: string;
  ean?: string;
  reference?: string;
  model?: string;
  taxonomyId?: number;
  typeId?: number;
  brandId?: number;
  supplierId?: number;
  physicalId?: number;
  flagBestSellers?: number;
  flagLowestSelling?: number;
  flagStalledProduct?: number;
  flagLatestArrivals?: number;
  flagPriceLessThan?: number;
  flagLowStock?: number;
  flagNoImage?: number;
  flagNoDescription?: number;
  flagNoSalesCopy?: number;
  flagPromotion?: number;
  flagFeatured?: number;
  flagImported?: number;
  flagInactive?: number;
  flagConsignment?: number;
  flagDiscontinued?: number;
  flagNoInventory?: number;
  flagWebsiteOff?: number;
  flagPremium?: number;
  flagStock?: number;
  flagService?: number;
  flagRegistration?: number;
  startDate?: string;
  endDate?: string;
  recordsQuantity?: number;
  pageId?: number;
  columnId?: number;
  orderId?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

export async function getProductsManager(
  params: GetProductsManagerParams = {},
): Promise<{ products: UIProductManager[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { products: [], total: 0 };
  }

  const response = await productManagerServiceApi.findAllProductsManager({
    pe_search: params.search,
    pe_ean: params.ean,
    pe_reference: params.reference,
    pe_model: params.model,
    pe_taxonomy_id: params.taxonomyId,
    pe_type_id: params.typeId,
    pe_brand_id: params.brandId,
    pe_supplier_id: params.supplierId,
    pe_physical_id: params.physicalId,
    pe_flag_best_sellers: params.flagBestSellers,
    pe_flag_lowest_selling: params.flagLowestSelling,
    pe_flag_stalled_product: params.flagStalledProduct,
    pe_flag_latest_arrivals: params.flagLatestArrivals,
    pe_flag_price_less_than: params.flagPriceLessThan,
    pe_flag_low_stock: params.flagLowStock,
    pe_flag_no_image: params.flagNoImage,
    pe_flag_no_description: params.flagNoDescription,
    pe_flag_no_sales_copy: params.flagNoSalesCopy,
    pe_flag_promotion: params.flagPromotion,
    pe_flag_featured: params.flagFeatured,
    pe_flag_imported: params.flagImported,
    pe_flag_inactive: params.flagInactive,
    pe_flag_consignment: params.flagConsignment,
    pe_flag_discontinued: params.flagDiscontinued,
    pe_flag_no_inventory: params.flagNoInventory,
    pe_flag_Website_Off: params.flagWebsiteOff,
    pe_flag_Premium: params.flagPremium,
    pe_flag_stock: params.flagStock,
    pe_flag_service: params.flagService,
    pe_flag_registration: params.flagRegistration,
    pe_start_date: params.startDate,
    pe_end_date: params.endDate,
    pe_records_quantity: params.recordsQuantity,
    pe_page_id: params.pageId,
    pe_column_id: params.columnId,
    pe_order_id: params.orderId,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const products = productManagerServiceApi.extractProductsManager(response);
  return {
    products: transformProductManagerList(products),
    total: response.quantity ?? products.length,
  };
}

export async function getProductManagerById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
    pe_type_business?: number;
  } = {},
): Promise<
  | {
      product: UIProductManager;
      relatedCategories: UIProductManagerRelatedCategory[];
    }
  | undefined
> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await productManagerServiceApi.findProductManagerById({
    pe_product_id: id,
    pe_type_business: params.pe_type_business,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const productEntity =
    productManagerServiceApi.extractProductManagerById(response);
  if (!productEntity) {
    return undefined;
  }

  const product = transformProductManager(productEntity);
  if (!product) {
    return undefined;
  }

  const categoriesEntities =
    productManagerServiceApi.extractRelatedCategories(response);
  const relatedCategories = transformRelatedCategories(categoriesEntities);

  return { product, relatedCategories };
}

export async function searchProductsManager(
  params: {
    search?: string;
    customerId?: number;
    flagStock?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIProductManager[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await productManagerServiceApi.findProductsManagerSearch({
    pe_search: params.search,
    pe_customer_id: params.customerId,
    pe_flag_stock: params.flagStock,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const products =
    productManagerServiceApi.extractProductsManagerSearch(response);
  return transformProductManagerSearchList(products);
}
