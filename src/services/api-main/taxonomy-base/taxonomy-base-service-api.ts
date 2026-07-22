import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  TAXONOMY_BASE_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformTaxonomyDetail,
  transformTaxonomyList,
  transformTaxonomyMenuList,
  transformTaxonomyMenuManagerList,
  transformTaxonomyProductList,
  type UITaxonomy,
  type UITaxonomyMenuItem,
  type UITaxonomyMenuManagerItem,
  type UITaxonomyProduct,
} from "./transformers/transformers";
import type {
  StoredProcedureResponse,
  TaxonomyCreateRequest,
  TaxonomyCreateResponse,
  TaxonomyDeleteRequest,
  TaxonomyDeleteResponse,
  TaxonomyDetail,
  TaxonomyFindAllRequest,
  TaxonomyFindAllResponse,
  TaxonomyFindByIdRequest,
  TaxonomyFindByIdResponse,
  TaxonomyFindMenuManagerRequest,
  TaxonomyFindMenuManagerResponse,
  TaxonomyFindMenuRequest,
  TaxonomyFindMenuResponse,
  TaxonomyListItem,
  TaxonomyMenuItem,
  TaxonomyMenuManagerItem,
  TaxonomyProductItem,
  TaxonomyProductManagerRequest,
  TaxonomyProductManagerResponse,
  TaxonomyRelCreateBulkRequest,
  TaxonomyRelCreateBulkResponse,
  TaxonomyUpdateMetadataRequest,
  TaxonomyUpdateMetadataResponse,
  TaxonomyUpdateRequest,
  TaxonomyUpdateResponse,
} from "./types/taxonomy-base-types";
import {
  TaxonomyBaseError,
  TaxonomyNotFoundError,
} from "./types/taxonomy-base-types";
import {
  TaxonomyCreateSchema,
  TaxonomyDeleteSchema,
  TaxonomyFindAllSchema,
  TaxonomyFindByIdSchema,
  TaxonomyFindMenuManagerSchema,
  TaxonomyFindMenuSchema,
  TaxonomyProductManagerSchema,
  TaxonomyRelCreateBulkSchema,
  TaxonomyUpdateMetadataSchema,
  TaxonomyUpdateSchema,
} from "./validation/taxonomy-base-schemas";

const logger = createLogger("TaxonomyBaseServiceApi");

export class TaxonomyBaseServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllTaxonomies(
    params: Partial<TaxonomyFindAllRequest> = {},
  ): Promise<TaxonomyFindAllResponse> {
    try {
      const validatedParams = TaxonomyFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_parent_id: validatedParams.pe_parent_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_flag_inactive: validatedParams.pe_flag_inactive ?? 0,
        pe_records_quantity: validatedParams.pe_records_quantity ?? 20,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      const response = await this.post<TaxonomyFindAllResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todas as taxonomias", error);
      throw error;
    }
  }

  async findTaxonomyById(
    params: TaxonomyFindByIdRequest,
  ): Promise<TaxonomyFindByIdResponse> {
    try {
      const validatedParams = TaxonomyFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyFindByIdResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new TaxonomyNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new TaxonomyBaseError(
          response.message || "Erro ao buscar taxonomia por ID",
          "TAXONOMY_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar taxonomia por ID", error);
      throw error;
    }
  }

  async findTaxonomyMenu(
    params: TaxonomyFindMenuRequest,
  ): Promise<TaxonomyFindMenuResponse> {
    try {
      const validatedParams = TaxonomyFindMenuSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyFindMenuResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_MENU,
        requestBody,
      );

      return this.normalizeEmptyFindMenuResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar menu de taxonomias", error);
      throw error;
    }
  }

  async createTaxonomy(
    params: TaxonomyCreateRequest,
  ): Promise<TaxonomyCreateResponse> {
    try {
      const validatedParams = TaxonomyCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyCreateResponse>(
        TAXONOMY_BASE_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar taxonomia", error);
      throw error;
    }
  }

  async updateTaxonomy(
    params: TaxonomyUpdateRequest,
  ): Promise<TaxonomyUpdateResponse> {
    try {
      const validatedParams = TaxonomyUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyUpdateResponse>(
        TAXONOMY_BASE_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar taxonomia", error);
      throw error;
    }
  }

  async deleteTaxonomy(
    params: TaxonomyDeleteRequest,
  ): Promise<TaxonomyDeleteResponse> {
    try {
      const validatedParams = TaxonomyDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyDeleteResponse>(
        TAXONOMY_BASE_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir taxonomia", error);
      throw error;
    }
  }

  async updateTaxonomyMetadata(
    params: TaxonomyUpdateMetadataRequest,
  ): Promise<TaxonomyUpdateMetadataResponse> {
    try {
      const validatedParams = TaxonomyUpdateMetadataSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyUpdateMetadataResponse>(
        TAXONOMY_BASE_ENDPOINTS.UPDATE_METADATA,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar metadata da taxonomia", error);
      throw error;
    }
  }

  async taxonomyProductManager(
    params: TaxonomyProductManagerRequest,
  ): Promise<TaxonomyProductManagerResponse> {
    try {
      const validatedParams = TaxonomyProductManagerSchema.parse(params);
      const requestBody = this.buildBasePayload({
        ...validatedParams,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<TaxonomyProductManagerResponse>(
        TAXONOMY_BASE_ENDPOINTS.PRODUCT_MANAGER,
        requestBody,
      );

      return this.normalizeEmptyProductManagerResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar produtos por taxonomia", error);
      throw error;
    }
  }

  async findTaxonomyMenuManager(
    params: TaxonomyFindMenuManagerRequest,
  ): Promise<TaxonomyFindMenuManagerResponse> {
    try {
      const validatedParams = TaxonomyFindMenuManagerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyFindMenuManagerResponse>(
        TAXONOMY_BASE_ENDPOINTS.FIND_MENU_MANAGER,
        requestBody,
      );

      return this.normalizeEmptyFindMenuManagerResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar menu de gerenciamento de taxonomias", error);
      throw error;
    }
  }

  async createTaxonomyRelBulk(
    params: TaxonomyRelCreateBulkRequest,
  ): Promise<TaxonomyRelCreateBulkResponse> {
    try {
      const validatedParams = TaxonomyRelCreateBulkSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<TaxonomyRelCreateBulkResponse>(
        TAXONOMY_BASE_ENDPOINTS.REL_CREATE_BULK,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao criar relacionamentos taxonomia-produto em lote",
        error,
      );
      throw error;
    }
  }

  private checkStoredProcedureError(
    response:
      | TaxonomyCreateResponse
      | TaxonomyUpdateResponse
      | TaxonomyDeleteResponse
      | TaxonomyUpdateMetadataResponse
      | TaxonomyRelCreateBulkResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new TaxonomyBaseError(
        spResponse.sp_message || "Erro na operação de taxonomia",
        "TAXONOMY_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: TaxonomyFindAllResponse,
  ): TaxonomyFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Taxonomy find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyFindMenuResponse(
    response: TaxonomyFindMenuResponse,
  ): TaxonomyFindMenuResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Taxonomy find Menu": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyProductManagerResponse(
    response: TaxonomyProductManagerResponse,
  ): TaxonomyProductManagerResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        recordId: 0,
        data: {
          "Taxonomy product manager": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyFindMenuManagerResponse(
    response: TaxonomyFindMenuManagerResponse,
  ): TaxonomyFindMenuManagerResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        recordId: "0",
        data: {
          "Taxonomy find menu manager": [],
          "Taxonomy quantity": [],
        },
      };
    }
    return response;
  }

  extractTaxonomies(response: TaxonomyFindAllResponse): TaxonomyListItem[] {
    return response.data?.["Taxonomy find All"] ?? [];
  }

  extractTaxonomyById(
    response: TaxonomyFindByIdResponse,
  ): TaxonomyDetail | null {
    return response.data?.["Taxonomy find Id"]?.[0] ?? null;
  }

  extractTaxonomyMenu(response: TaxonomyFindMenuResponse): TaxonomyMenuItem[] {
    return response.data?.["Taxonomy find Menu"] ?? [];
  }

  extractTaxonomyProducts(
    response: TaxonomyProductManagerResponse,
  ): TaxonomyProductItem[] {
    return response.data?.["Taxnomy product manager"] ?? [];
  }

  extractTaxonomyMenuManager(
    response: TaxonomyFindMenuManagerResponse,
  ): TaxonomyMenuManagerItem[] {
    const data: unknown = response.data;
    if (!data) return [];

    const candidates = Array.isArray(data)
      ? [data, ...data]
      : typeof data === "object"
        ? Object.values(data)
        : [];

    for (const candidate of candidates) {
      if (
        Array.isArray(candidate) &&
        candidate.some(
          (item) =>
            typeof item === "object" && item !== null && "ID_TAXONOMY" in item,
        )
      ) {
        return candidate as TaxonomyMenuManagerItem[];
      }
    }

    return [];
  }

  extractTaxonomyQuantity(response: TaxonomyFindMenuManagerResponse): number {
    const data: unknown = response.data;
    if (!data) return 0;

    const candidates = Array.isArray(data)
      ? [data, ...data]
      : typeof data === "object"
        ? Object.values(data)
        : [];

    for (const candidate of candidates) {
      if (!Array.isArray(candidate)) continue;

      const quantity = candidate.find(
        (item) =>
          typeof item === "object" && item !== null && "QTY_TAXONOMIES" in item,
      );
      if (quantity && "QTY_TAXONOMIES" in quantity) {
        return Number(quantity.QTY_TAXONOMIES) || 0;
      }
    }

    return 0;
  }

  extractStoredProcedureResult(
    response:
      | TaxonomyCreateResponse
      | TaxonomyUpdateResponse
      | TaxonomyDeleteResponse
      | TaxonomyUpdateMetadataResponse
      | TaxonomyRelCreateBulkResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidTaxonomyList(response: TaxonomyFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find All"])
    );
  }

  isValidTaxonomyDetail(response: TaxonomyFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find Id"]) &&
      response.data["Taxonomy find Id"].length > 0
    );
  }

  isValidTaxonomyMenu(response: TaxonomyFindMenuResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find Menu"])
    );
  }

  isValidTaxonomyProductList(
    response: TaxonomyProductManagerResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy product manager"])
    );
  }

  isValidTaxonomyMenuManager(
    response: TaxonomyFindMenuManagerResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data != null &&
      Array.isArray(response.data["Taxonomy find menu manager"])
    );
  }
}

export const taxonomyBaseServiceApi = new TaxonomyBaseServiceApi();

export async function getTaxonomies(
  params: {
    parentId?: number;
    search?: string;
    inactive?: number;
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
): Promise<UITaxonomy[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await taxonomyBaseServiceApi.findAllTaxonomies({
    pe_parent_id: params.parentId,
    pe_search: params.search,
    pe_flag_inactive: params.inactive,
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

  const taxonomies = taxonomyBaseServiceApi.extractTaxonomies(response);
  const transformedTaxonomies = transformTaxonomyList(taxonomies);
  if (params.inactive !== 1) return transformedTaxonomies;

  return transformedTaxonomies.map((taxonomy) => ({
    ...taxonomy,
    inactive: true,
  }));
}

export async function getTaxonomyById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UITaxonomy | undefined> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await taxonomyBaseServiceApi.findTaxonomyById({
    pe_taxonomy_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const taxonomy = taxonomyBaseServiceApi.extractTaxonomyById(response);
  if (!taxonomy) return undefined;

  return transformTaxonomyDetail(taxonomy);
}

export async function getTaxonomyMenu(
  typeId: number,
  parentId: number = 0,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UITaxonomyMenuItem[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await taxonomyBaseServiceApi.findTaxonomyMenu({
    pe_type_id: typeId,
    pe_parent_id: parentId,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const menuItems = taxonomyBaseServiceApi.extractTaxonomyMenu(response);
  return transformTaxonomyMenuList(menuItems);
}

export async function getTaxonomyProducts(
  params: {
    search?: string;
    taxonomyId?: number;
    flagNoFamily?: number;
    flagNoGroup?: number;
    flagNoSubgroup?: number;
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
): Promise<{ items: UITaxonomyProduct[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], total: 0 };
  }

  const response = await taxonomyBaseServiceApi.taxonomyProductManager({
    pe_search: params.search,
    pe_id_taxonomy: params.taxonomyId ?? 0,
    pe_flag_no_family: params.flagNoFamily ?? 0,
    pe_flag_no_group: params.flagNoGroup ?? 0,
    pe_flag_no_subgroup: params.flagNoSubgroup ?? 0,
    pe_qt_registros: params.recordsQuantity ?? 20,
    pe_pagina_id: params.pageId ?? 0,
    pe_coluna_id: params.columnId ?? 1,
    pe_ordem_id: params.orderId ?? 1,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const products = taxonomyBaseServiceApi.extractTaxonomyProducts(response);
  return {
    items: transformTaxonomyProductList(products),
    total: response.recordId,
  };
}

export async function getTaxonomyMenuManager(
  params: {
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<{ items: UITaxonomyMenuManagerItem[]; totalTaxonomies: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], totalTaxonomies: 0 };
  }

  const response = await taxonomyBaseServiceApi.findTaxonomyMenuManager({
    pe_limit: params.limit ?? 100,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const items = taxonomyBaseServiceApi.extractTaxonomyMenuManager(response);
  const totalTaxonomies =
    taxonomyBaseServiceApi.extractTaxonomyQuantity(response);
  return {
    items: transformTaxonomyMenuManagerList(items),
    totalTaxonomies,
  };
}
