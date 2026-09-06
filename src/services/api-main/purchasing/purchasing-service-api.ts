import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PURCHASING_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformPurchasing,
  transformPurchasingList,
  transformRelatedCategories,
  transformRelatedSuppliers,
  type UIPurchasingProduct,
  type UIPurchasingRelatedCategory,
  type UIPurchasingRelatedSupplier,
} from "./transformers/transformers";
import type {
  PurchasingDetail,
  PurchasingFindAllRequest,
  PurchasingFindAllResponse,
  PurchasingFindByIdRequest,
  PurchasingFindByIdResponse,
  PurchasingListItem,
  PurchasingRelatedCategory,
  PurchasingRelatedSupplier,
} from "./types/purchasing-types";
import {
  PurchasingError,
  PurchasingNotFoundError,
} from "./types/purchasing-types";
import {
  PurchasingFindAllSchema,
  PurchasingFindByIdSchema,
} from "./validation/purchasing-schemas";

const logger = createLogger("PurchasingServiceApi");

export class PurchasingServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllPurchasingManager(
    params: Partial<PurchasingFindAllRequest> = {},
  ): Promise<PurchasingFindAllResponse> {
    try {
      const validatedParams = PurchasingFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_taxonomy_id: validatedParams.pe_taxonomy_id ?? 0,
        pe_type_id: validatedParams.pe_type_id ?? 0,
        pe_brand_id: validatedParams.pe_brand_id ?? 0,
        pe_supplier_id: validatedParams.pe_supplier_id ?? 0,
        pe_flag_sales_list: validatedParams.pe_flag_sales_list ?? 0,
        pe_flag_stock_list: validatedParams.pe_flag_stock_list ?? 0,
        pe_flag_advanced: validatedParams.pe_flag_advanced ?? 0,
        pe_flag_imported: validatedParams.pe_flag_imported ?? 0,
        pe_flag_premium: validatedParams.pe_flag_premium ?? 0,
        pe_criticality_level: validatedParams.pe_criticality_level ?? 0,
        pe_flag_various_lists: validatedParams.pe_flag_various_lists ?? 0,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      const response = await this.post<PurchasingFindAllResponse>(
        PURCHASING_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error(
        "Erro ao buscar todos os produtos do gestor de compras",
        error,
      );
      throw error;
    }
  }

  async findPurchasingManagerById(
    params: PurchasingFindByIdRequest,
  ): Promise<PurchasingFindByIdResponse> {
    try {
      const validatedParams = PurchasingFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PurchasingFindByIdResponse>(
        PURCHASING_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new PurchasingNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new PurchasingError(
          response.message ||
            "Erro ao buscar produto do gestor de compras por ID",
          "PURCHASING_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar produto do gestor de compras por ID", error);
      throw error;
    }
  }

  private normalizeEmptyFindAllResponse(
    response: PurchasingFindAllResponse,
  ): PurchasingFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          purchasingFindAll: [],
        },
      };
    }
    return response;
  }

  extractPurchasingProducts(
    response: PurchasingFindAllResponse,
  ): PurchasingListItem[] {
    return response.data?.purchasingFindAll ?? [];
  }

  extractPurchasingProductById(
    response: PurchasingFindByIdResponse,
  ): PurchasingDetail | null {
    return response.data?.purchasingData?.[0] ?? null;
  }

  extractRelatedCategories(
    response: PurchasingFindByIdResponse,
  ): PurchasingRelatedCategory[] {
    return response.data?.purchasingCategories ?? [];
  }

  extractRelatedSuppliers(
    response: PurchasingFindByIdResponse,
  ): PurchasingRelatedSupplier[] {
    return response.data?.purchasingSuppliers ?? [];
  }

  isValidPurchasingList(response: PurchasingFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data.purchasingFindAll)
    );
  }

  isValidPurchasingDetail(response: PurchasingFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data.purchasingData) &&
      response.data.purchasingData.length > 0
    );
  }
}

export const purchasingServiceApi = new PurchasingServiceApi();

export interface GetPurchasingProductsParams {
  search?: string;
  taxonomyId?: number;
  typeId?: number;
  brandId?: number;
  supplierId?: number;
  flagSalesList?: 0 | 1 | 2 | 3;
  flagStockList?: 0 | 1 | 2 | 3;
  flagAdvanced?: 0 | 1 | 2;
  flagImported?: 0 | 1 | 2;
  flagPremium?: 0 | 1;
  criticalityLevel?: 0 | 1 | 2 | 3 | 4;
  flagVariousLists?: number;
  qtRecords?: number;
  pageId?: number;
  columnId?: 1 | 2 | 3;
  orderId?: 1 | 2;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

export async function getPurchasingProducts(
  params: GetPurchasingProductsParams = {},
): Promise<{ products: UIPurchasingProduct[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { products: [], total: 0 };
  }

  const response = await purchasingServiceApi.findAllPurchasingManager({
    pe_search: params.search,
    pe_taxonomy_id: params.taxonomyId,
    pe_type_id: params.typeId,
    pe_brand_id: params.brandId,
    pe_supplier_id: params.supplierId,
    pe_flag_sales_list: params.flagSalesList,
    pe_flag_stock_list: params.flagStockList,
    pe_flag_advanced: params.flagAdvanced,
    pe_flag_imported: params.flagImported,
    pe_flag_premium: params.flagPremium,
    pe_criticality_level: params.criticalityLevel,
    pe_flag_various_lists: params.flagVariousLists,
    pe_qt_records: params.qtRecords,
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

  const products = purchasingServiceApi.extractPurchasingProducts(response);
  const filteredTotal = Number(response.recordId);

  return {
    products: transformPurchasingList(products),
    total:
      Number.isFinite(filteredTotal) && filteredTotal >= 0
        ? filteredTotal
        : (response.quantity ?? products.length),
  };
}

export async function getPurchasingProductById(
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
      product: UIPurchasingProduct;
      relatedCategories: UIPurchasingRelatedCategory[];
      relatedSuppliers: UIPurchasingRelatedSupplier[];
    }
  | undefined
> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await purchasingServiceApi.findPurchasingManagerById({
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
    purchasingServiceApi.extractPurchasingProductById(response);
  if (!productEntity) {
    return undefined;
  }

  const product = transformPurchasing(productEntity);
  if (!product) {
    return undefined;
  }

  const categoriesEntities =
    purchasingServiceApi.extractRelatedCategories(response);
  const relatedCategories = transformRelatedCategories(categoriesEntities);

  const suppliersEntities =
    purchasingServiceApi.extractRelatedSuppliers(response);
  const relatedSuppliers = transformRelatedSuppliers(suppliersEntities);

  return { product, relatedCategories, relatedSuppliers };
}
