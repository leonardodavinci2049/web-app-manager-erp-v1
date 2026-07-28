import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  BRAND_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import { generalCallServiceApi } from "@/services/api-main/general-call/general-call-service-api";
import type {
  GeneralTableUpdInlFieldRequest,
  GeneralTableUpdInlFieldResponse,
} from "@/services/api-main/general-call/types/general-call-types";
import {
  transformBrand,
  transformBrandList,
  type UIBrand,
} from "./transformers/transformers";
import type {
  BrandCreateRequest,
  BrandCreateResponse,
  BrandDeleteRequest,
  BrandDeleteResponse,
  BrandDetail,
  BrandFindAllRequest,
  BrandFindAllResponse,
  BrandFindByIdRequest,
  BrandFindByIdResponse,
  BrandListItem,
  BrandSearchAllRequest,
  BrandSearchAllResponse,
  BrandUpdateRequest,
  BrandUpdateResponse,
  StoredProcedureResponse,
} from "./types/brand-types";
import { BrandError, BrandNotFoundError } from "./types/brand-types";
import {
  BrandCreateSchema,
  BrandDeleteSchema,
  BrandFindAllSchema,
  BrandFindByIdSchema,
  BrandSearchAllSchema,
  BrandUpdateSchema,
} from "./validation/brand-schemas";

const logger = createLogger("BrandServiceApi");

const BRAND_TABLE_NAME = "tbl_produto_marca";
const BRAND_PRIMARY_KEY_FIELD = "ID_MARCA";

export type BrandInlineFieldRequest = Omit<
  GeneralTableUpdInlFieldRequest,
  "pe_table_name" | "pe_primary_key_field"
>;

export class BrandServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllBrands(
    params: Partial<BrandFindAllRequest> = {},
  ): Promise<BrandFindAllResponse> {
    try {
      const validatedParams = BrandFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_inactive: validatedParams.pe_inactive ?? 0,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 2,
        pe_order_id: validatedParams.pe_order_id ?? 2,
      });

      const response = await this.post<BrandFindAllResponse>(
        BRAND_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyBrandFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todas as marcas", error);
      throw error;
    }
  }

  async searchAllBrands(
    params: Partial<BrandSearchAllRequest> = {},
  ): Promise<BrandSearchAllResponse> {
    try {
      const validatedParams = BrandSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_inactive: validatedParams.pe_inactive ?? 0,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<BrandSearchAllResponse>(
        BRAND_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptyBrandSearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar marcas", error);
      throw error;
    }
  }

  async findBrandById(
    params: BrandFindByIdRequest,
  ): Promise<BrandFindByIdResponse> {
    try {
      const validatedParams = BrandFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandFindByIdResponse>(
        BRAND_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new BrandNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao buscar marca por ID",
          "BRAND_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar marca por ID", error);
      throw error;
    }
  }

  async createBrand(params: BrandCreateRequest): Promise<BrandCreateResponse> {
    try {
      const validatedParams = BrandCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandCreateResponse>(
        BRAND_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar marca", error);
      throw error;
    }
  }

  async updateBrand(params: BrandUpdateRequest): Promise<BrandUpdateResponse> {
    try {
      const validatedParams = BrandUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandUpdateResponse>(
        BRAND_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar marca", error);
      throw error;
    }
  }

  async updateBrandInlineField(
    params: BrandInlineFieldRequest,
  ): Promise<GeneralTableUpdInlFieldResponse> {
    return generalCallServiceApi.updateTableInlineField({
      ...params,
      pe_table_name: BRAND_TABLE_NAME,
      pe_primary_key_field: BRAND_PRIMARY_KEY_FIELD,
    });
  }

  async deleteBrand(params: BrandDeleteRequest): Promise<BrandDeleteResponse> {
    try {
      const validatedParams = BrandDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<BrandDeleteResponse>(
        BRAND_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir marca", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response: BrandCreateResponse | BrandUpdateResponse | BrandDeleteResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new BrandError(
        spResponse.sp_message || "Erro na operação de marca",
        "BRAND_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyBrandFindAllResponse(
    response: BrandFindAllResponse,
  ): BrandFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Brand find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyBrandSearchAllResponse(
    response: BrandSearchAllResponse,
  ): BrandSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Brand find All": [],
        },
      };
    }
    return response;
  }

  extractBrands(response: BrandFindAllResponse): BrandListItem[] {
    return response.data?.["Brand find All"] ?? [];
  }

  extractSearchBrands(response: BrandSearchAllResponse): BrandListItem[] {
    return response.data?.["Brand find All"] ?? [];
  }

  extractBrandById(response: BrandFindByIdResponse): BrandDetail | null {
    return response.data?.["Brand find All"]?.[0] ?? null;
  }

  extractStoredProcedureResult(
    response: BrandCreateResponse | BrandUpdateResponse | BrandDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidBrandList(response: BrandFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"])
    );
  }

  isValidBrandSearchList(response: BrandSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"])
    );
  }

  isValidBrandDetail(response: BrandFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"]) &&
      response.data["Brand find All"].length > 0
    );
  }
}

export const brandServiceApi = new BrandServiceApi();

export async function getBrands(
  params: {
    search?: string;
    inactive?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await brandServiceApi.searchAllBrands({
    pe_search: params.search,
    pe_inactive: params.inactive,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const brands = brandServiceApi.extractSearchBrands(response);
  return transformBrandList(brands);
}

export async function searchBrands(
  params: {
    search?: string;
    inactive?: number;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await brandServiceApi.searchAllBrands({
    pe_search: params.search,
    pe_inactive: params.inactive,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const brands = brandServiceApi.extractSearchBrands(response);
  return transformBrandList(brands);
}

export async function getBrandById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIBrand | undefined> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await brandServiceApi.findBrandById({
    pe_brand_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const brand = brandServiceApi.extractBrandById(response);
  if (!brand) {
    return undefined;
  }

  return transformBrand(brand) ?? undefined;
}
