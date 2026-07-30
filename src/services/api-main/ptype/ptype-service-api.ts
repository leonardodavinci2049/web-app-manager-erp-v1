import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  PTYPE_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformPtype,
  transformPtypeList,
  type UIPtype,
} from "./transformers/transformers";
import type {
  PtypeCreateRequest,
  PtypeCreateResponse,
  PtypeDeleteRequest,
  PtypeDeleteResponse,
  PtypeDetail,
  PtypeFindAllRequest,
  PtypeFindAllResponse,
  PtypeFindByIdRequest,
  PtypeFindByIdResponse,
  PtypeFindManagerAllRequest,
  PtypeFindManagerAllResponse,
  PtypeListItem,
  PtypeSearchAllRequest,
  PtypeSearchAllResponse,
  PtypeUpdateRequest,
  PtypeUpdateResponse,
  StoredProcedureResponse,
} from "./types/ptype-types";
import { PtypeError, PtypeNotFoundError } from "./types/ptype-types";
import {
  PtypeCreateSchema,
  PtypeDeleteSchema,
  PtypeFindAllSchema,
  PtypeFindByIdSchema,
  PtypeFindManagerAllSchema,
  PtypeSearchAllSchema,
  PtypeUpdateSchema,
} from "./validation/ptype-schemas";

const logger = createLogger("PtypeServiceApi");

export class PtypeServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllPtypes(
    params: Partial<PtypeFindAllRequest> = {},
  ): Promise<PtypeFindAllResponse> {
    try {
      const validatedParams = PtypeFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<PtypeFindAllResponse>(
        PTYPE_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyPtypeFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os tipos", error);
      throw error;
    }
  }

  async searchAllPtypes(
    params: Partial<PtypeSearchAllRequest> = {},
  ): Promise<PtypeSearchAllResponse> {
    try {
      const validatedParams = PtypeSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<PtypeSearchAllResponse>(
        PTYPE_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptyPtypeSearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar tipos", error);
      throw error;
    }
  }

  async findManagerAllPtypes(
    params: Partial<PtypeFindManagerAllRequest> = {},
  ): Promise<PtypeFindManagerAllResponse> {
    try {
      const validatedParams = PtypeFindManagerAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_status_id: validatedParams.pe_status_id ?? 0,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 2,
        pe_order_id: validatedParams.pe_order_id ?? 2,
      });

      const response = await this.post<PtypeFindManagerAllResponse>(
        PTYPE_ENDPOINTS.FIND_MANAGER_ALL,
        requestBody,
      );

      return this.normalizeEmptyPtypeFindManagerAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar tipos (manager)", error);
      throw error;
    }
  }

  async findPtypeById(
    params: PtypeFindByIdRequest,
  ): Promise<PtypeFindByIdResponse> {
    try {
      const validatedParams = PtypeFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PtypeFindByIdResponse>(
        PTYPE_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new PtypeNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new PtypeError(
          response.message || "Erro ao buscar tipo por ID",
          "PTYPE_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar tipo por ID", error);
      throw error;
    }
  }

  async createPtype(params: PtypeCreateRequest): Promise<PtypeCreateResponse> {
    try {
      const validatedParams = PtypeCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PtypeCreateResponse>(
        PTYPE_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar tipo", error);
      throw error;
    }
  }

  async updatePtype(params: PtypeUpdateRequest): Promise<PtypeUpdateResponse> {
    try {
      const validatedParams = PtypeUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PtypeUpdateResponse>(
        PTYPE_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar tipo", error);
      throw error;
    }
  }

  async deletePtype(params: PtypeDeleteRequest): Promise<PtypeDeleteResponse> {
    try {
      const validatedParams = PtypeDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PtypeDeleteResponse>(
        PTYPE_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir tipo", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response: PtypeCreateResponse | PtypeUpdateResponse | PtypeDeleteResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new PtypeError(
        spResponse.sp_message || "Erro na operação de tipo",
        "PTYPE_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyPtypeFindAllResponse(
    response: PtypeFindAllResponse,
  ): PtypeFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Type find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyPtypeSearchAllResponse(
    response: PtypeSearchAllResponse,
  ): PtypeSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Type find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyPtypeFindManagerAllResponse(
    response: PtypeFindManagerAllResponse,
  ): PtypeFindManagerAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Type find manager All": [],
        },
      };
    }
    return response;
  }

  extractPtypes(response: PtypeFindAllResponse): PtypeListItem[] {
    return response.data?.["Type find All"] ?? [];
  }

  extractSearchPtypes(response: PtypeSearchAllResponse): PtypeListItem[] {
    return response.data?.["Type find All"] ?? [];
  }

  extractManagerAllPtypes(
    response: PtypeFindManagerAllResponse,
  ): PtypeListItem[] {
    return response.data?.["Type find manager All"] ?? [];
  }

  extractPtypeById(response: PtypeFindByIdResponse): PtypeDetail | null {
    return response.data?.["Type find Id"]?.[0] ?? null;
  }

  extractStoredProcedureResult(
    response: PtypeCreateResponse | PtypeUpdateResponse | PtypeDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidPtypeList(response: PtypeFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Type find All"])
    );
  }

  isValidPtypeSearchList(response: PtypeSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Type find All"])
    );
  }

  isValidPtypeManagerList(response: PtypeFindManagerAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Type find manager All"])
    );
  }

  isValidPtypeDetail(response: PtypeFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Type find Id"]) &&
      response.data["Type find Id"].length > 0
    );
  }
}

export const ptypeServiceApi = new PtypeServiceApi();

export async function getPtypes(
  params: {
    search?: string;
    limit?: number;
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIPtype[]> {
  if (!params.pe_system_client_id) {
    return [];
  }

  const response = await ptypeServiceApi.findAllPtypes({
    pe_search: params.search,
    pe_limit: params.limit,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const ptypes = ptypeServiceApi.extractPtypes(response);
  return transformPtypeList(ptypes);
}

export interface GetPtypesPageParams {
  search?: string;
  statusId?: number;
  page?: number;
  pageSize?: number;
  columnId?: number;
  orderId?: number;
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

/**
 * Leitura paginada para a central de tipos de produtos. O total filtrado vem
 * de `recordId`, com fallback defensivo para `quantity` ou para a quantidade
 * efetivamente carregada.
 */
export async function getPtypesPage(
  params: GetPtypesPageParams = {},
): Promise<{ items: UIPtype[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], total: 0 };
  }

  const response = await ptypeServiceApi.findManagerAllPtypes({
    pe_search: params.search ?? "",
    pe_status_id: params.statusId ?? 0,
    pe_qt_records: params.pageSize ?? 50,
    pe_page_id: params.page ?? 0,
    pe_column_id: params.columnId ?? 2,
    pe_order_id: params.orderId ?? 2,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const ptypes = ptypeServiceApi.extractManagerAllPtypes(response);
  const filteredTotal = Number(response.recordId);

  return {
    items: transformPtypeList(ptypes),
    total:
      Number.isFinite(filteredTotal) && filteredTotal >= 0
        ? filteredTotal
        : (response.quantity ?? ptypes.length),
  };
}

export async function getPtypeById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UIPtype | undefined> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await ptypeServiceApi.findPtypeById({
    pe_type_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const ptype = ptypeServiceApi.extractPtypeById(response);
  if (!ptype) {
    return undefined;
  }

  return transformPtype(ptype) ?? undefined;
}
