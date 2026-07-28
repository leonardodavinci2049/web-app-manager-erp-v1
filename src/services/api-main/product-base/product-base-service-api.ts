import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PRODUCT_BASE_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformProductDetail,
  transformProductList,
  transformProductSearchList,
  type UIProduct,
  type UIProductDetail,
} from "./transformers/transformers";
import type {
  ProductCreateRequest,
  ProductCreateResponse,
  ProductDetail,
  ProductDetailCategory,
  ProductDetailRelated,
  ProductFindAllRequest,
  ProductFindAllResponse,
  ProductFindByIdRequest,
  ProductFindByIdResponse,
  ProductListItem,
  ProductSearchAllRequest,
  ProductSearchAllResponse,
  ProductSearchItem,
  StoredProcedureResponse,
} from "./types/product-base-types";
import {
  ProductBaseError,
  ProductBaseNotFoundError,
} from "./types/product-base-types";
import {
  ProductCreateSchema,
  ProductFindAllSchema,
  ProductFindByIdSchema,
  ProductSearchAllSchema,
} from "./validation/product-base-schemas";

const logger = createLogger("ProductBaseServiceApi");

export class ProductBaseServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllProducts(
    params: Partial<ProductFindAllRequest> = {},
  ): Promise<ProductFindAllResponse> {
    try {
      const validatedParams = ProductFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_taxonomy_id: validatedParams.pe_taxonomy_id,
        pe_type_id: validatedParams.pe_type_id,
        pe_brand_id: validatedParams.pe_brand_id,
        pe_flag_stock: validatedParams.pe_flag_stock,
        pe_flag_service: validatedParams.pe_flag_service,
        pe_records_quantity: validatedParams.pe_records_quantity ?? 100,
        pe_page_id: validatedParams.pe_page_id,
        pe_column_id: validatedParams.pe_column_id,
        pe_order_id: validatedParams.pe_order_id,
      });

      const response = await this.post<ProductFindAllResponse>(
        PRODUCT_BASE_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os produtos", error);
      throw error;
    }
  }

  async searchAllProducts(
    params: ProductSearchAllRequest,
  ): Promise<ProductSearchAllResponse> {
    try {
      const validatedParams = ProductSearchAllSchema.parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_customer_id: validatedParams.pe_customer_id,
        pe_search: validatedParams.pe_search,
        pe_flag_stock: validatedParams.pe_flag_stock,
        pe_records_quantity: validatedParams.pe_records_quantity ?? 100,
      });

      const response = await this.post<ProductSearchAllResponse>(
        PRODUCT_BASE_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptySearchResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar produtos", error);
      throw error;
    }
  }

  async findProductById(
    params: ProductFindByIdRequest,
  ): Promise<ProductFindByIdResponse> {
    try {
      const validatedParams = ProductFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductFindByIdResponse>(
        PRODUCT_BASE_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new ProductBaseNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new ProductBaseError(
          response.message || "Erro ao buscar produto por ID",
          "PRODUCT_BASE_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar produto por ID", error);
      throw error;
    }
  }

  async createProduct(
    params: ProductCreateRequest,
  ): Promise<ProductCreateResponse> {
    try {
      const validatedParams = ProductCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<ProductCreateResponse>(
        PRODUCT_BASE_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar produto", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: ProductCreateResponse): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new ProductBaseError(
        spResponse.sp_message || "Erro na operação de produto",
        "PRODUCT_BASE_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: ProductFindAllResponse,
  ): ProductFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptySearchResponse(
    response: ProductSearchAllResponse,
  ): ProductSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Product find All": [],
        },
      };
    }
    return response;
  }

  extractProducts(response: ProductFindAllResponse): ProductListItem[] {
    return response.data?.["Product find All"] ?? [];
  }

  extractSearchProducts(
    response: ProductSearchAllResponse,
  ): ProductSearchItem[] {
    return response.data?.["Product find All"] ?? [];
  }

  extractProductById(response: ProductFindByIdResponse): ProductDetail | null {
    const items = response.data?.["Product find Id"] as
      | ProductDetail[]
      | undefined;
    return items?.[0] ?? null;
  }

  extractProductCategories(
    response: ProductFindByIdResponse,
  ): ProductDetailCategory[] {
    return (
      (response.data?.[
        "Product find Id categories"
      ] as ProductDetailCategory[]) ?? []
    );
  }

  extractProductRelated(
    response: ProductFindByIdResponse,
  ): ProductDetailRelated[] {
    return (
      (response.data?.["Product find Id related"] as ProductDetailRelated[]) ??
      []
    );
  }

  extractStoredProcedureResult(
    response: ProductCreateResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidProductList(response: ProductFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Product find All"])
    );
  }

  isValidProductDetail(response: ProductFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Product find Id"]) &&
      (response.data["Product find Id"] as ProductDetail[]).length > 0
    );
  }
}

export const productBaseServiceApi = new ProductBaseServiceApi();

export async function getProducts(
  params: {
    search?: string;
    taxonomyId?: number;
    typeId?: number;
    brandId?: number;
    flagStock?: number;
    flagService?: number;
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
  } = {},
): Promise<UIProduct[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await productBaseServiceApi.findAllProducts({
    pe_search: params.search,
    pe_taxonomy_id: params.taxonomyId,
    pe_type_id: params.typeId,
    pe_brand_id: params.brandId,
    pe_flag_stock: params.flagStock,
    pe_flag_service: params.flagService,
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

  const products = productBaseServiceApi.extractProducts(response);
  return transformProductList(products);
}

export async function searchProducts(params: {
  search: string;
  customerId?: number;
  flagStock?: number;
  recordsQuantity?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}): Promise<UIProduct[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await productBaseServiceApi.searchAllProducts({
    pe_search: params.search,
    pe_customer_id: params.customerId,
    pe_flag_stock: params.flagStock,
    pe_records_quantity: params.recordsQuantity,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const products = productBaseServiceApi.extractSearchProducts(response);
  return transformProductSearchList(products);
}

export async function getProductById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIProductDetail | undefined> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await productBaseServiceApi.findProductById({
    pe_product_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const product = productBaseServiceApi.extractProductById(response);
  if (!product) {
    return undefined;
  }

  const categories = productBaseServiceApi.extractProductCategories(response);
  const related = productBaseServiceApi.extractProductRelated(response);

  return transformProductDetail(product, categories, related);
}
