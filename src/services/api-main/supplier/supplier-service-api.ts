import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  isApiSuccess,
  SUPPLIER_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformSupplier,
  transformSupplierSearchList,
  type UISupplier,
} from "./transformers/transformers";

import type {
  StoredProcedureResponse,
  SupplierCreateRequest,
  SupplierCreateResponse,
  SupplierDeleteRequest,
  SupplierDeleteResponse,
  SupplierDetail,
  SupplierFindAllRequest,
  SupplierFindAllResponse,
  SupplierFindByIdRequest,
  SupplierFindByIdResponse,
  SupplierFindManagerAllRequest,
  SupplierFindManagerAllResponse,
  SupplierListItem,
  SupplierRelCreateRequest,
  SupplierRelCreateResponse,
  SupplierRelDeleteRequest,
  SupplierRelDeleteResponse,
  SupplierRelFindProdAllRequest,
  SupplierRelFindProdAllResponse,
  SupplierRelProdItem,
  SupplierSearchAllRequest,
  SupplierSearchAllResponse,
  SupplierSearchListItem,
  SupplierUpdateRequest,
  SupplierUpdateResponse,
} from "./types/supplier-types";
import { SupplierError, SupplierNotFoundError } from "./types/supplier-types";
import {
  SupplierCreateSchema,
  SupplierDeleteSchema,
  SupplierFindAllSchema,
  SupplierFindByIdSchema,
  SupplierFindManagerAllSchema,
  SupplierRelCreateSchema,
  SupplierRelDeleteSchema,
  SupplierRelFindProdAllSchema,
  SupplierSearchAllSchema,
  SupplierUpdateSchema,
} from "./validation/supplier-schemas";

const logger = createLogger("SupplierServiceApi");

export class SupplierServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  // --- Find All ---

  async findAllSuppliers(
    params: Partial<SupplierFindAllRequest> = {},
  ): Promise<SupplierFindAllResponse> {
    try {
      const validatedParams = SupplierFindAllSchema.partial().parse(params);
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

      const response = await this.post<SupplierFindAllResponse>(
        SUPPLIER_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptySupplierFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os fornecedores", error);
      throw error;
    }
  }

  // --- Search All (V2) ---

  async searchAllSuppliers(
    params: Partial<SupplierSearchAllRequest> = {},
  ): Promise<SupplierSearchAllResponse> {
    try {
      const validatedParams = SupplierSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<SupplierSearchAllResponse>(
        SUPPLIER_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptySupplierSearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar fornecedores", error);
      throw error;
    }
  }

  // --- Find Manager All (V2) ---

  async findManagerAllSuppliers(
    params: Partial<SupplierFindManagerAllRequest> = {},
  ): Promise<SupplierFindManagerAllResponse> {
    try {
      const validatedParams =
        SupplierFindManagerAllSchema.partial().parse(params);
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

      const response = await this.post<SupplierFindManagerAllResponse>(
        SUPPLIER_ENDPOINTS.FIND_MANAGER_ALL,
        requestBody,
      );

      return this.normalizeEmptySupplierFindManagerAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar fornecedores (manager)", error);
      throw error;
    }
  }

  // --- Find By Id ---

  async findSupplierById(
    params: SupplierFindByIdRequest,
  ): Promise<SupplierFindByIdResponse> {
    try {
      const validatedParams = SupplierFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierFindByIdResponse>(
        SUPPLIER_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new SupplierNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new SupplierError(
          response.message || "Erro ao buscar fornecedor por ID",
          "SUPPLIER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar fornecedor por ID", error);
      throw error;
    }
  }

  // --- Create ---

  async createSupplier(
    params: SupplierCreateRequest,
  ): Promise<SupplierCreateResponse> {
    try {
      const validatedParams = SupplierCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierCreateResponse>(
        SUPPLIER_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar fornecedor", error);
      throw error;
    }
  }

  // --- Update ---

  async updateSupplier(
    params: SupplierUpdateRequest,
  ): Promise<SupplierUpdateResponse> {
    try {
      const validatedParams = SupplierUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierUpdateResponse>(
        SUPPLIER_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar fornecedor", error);
      throw error;
    }
  }

  // --- Delete ---

  async deleteSupplier(
    params: SupplierDeleteRequest,
  ): Promise<SupplierDeleteResponse> {
    try {
      const validatedParams = SupplierDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierDeleteResponse>(
        SUPPLIER_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir fornecedor", error);
      throw error;
    }
  }

  // --- Relationship: Supplier-Product ---

  async createSupplierRelation(
    params: SupplierRelCreateRequest,
  ): Promise<SupplierRelCreateResponse> {
    try {
      const validatedParams = SupplierRelCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierRelCreateResponse>(
        SUPPLIER_ENDPOINTS.REL_CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar relação fornecedor-produto", error);
      throw error;
    }
  }

  async deleteSupplierRelation(
    params: SupplierRelDeleteRequest,
  ): Promise<SupplierRelDeleteResponse> {
    try {
      const validatedParams = SupplierRelDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<SupplierRelDeleteResponse>(
        SUPPLIER_ENDPOINTS.REL_DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir relação fornecedor-produto", error);
      throw error;
    }
  }

  async findAllSupplierRelProds(
    params: Partial<SupplierRelFindProdAllRequest> = {},
  ): Promise<SupplierRelFindProdAllResponse> {
    try {
      const validatedParams =
        SupplierRelFindProdAllSchema.partial().parse(params);
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

      const response = await this.post<SupplierRelFindProdAllResponse>(
        SUPPLIER_ENDPOINTS.REL_FIND_PROD_ALL,
        requestBody,
      );

      return this.normalizeEmptySupplierRelFindProdAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar relações fornecedor-produto", error);
      throw error;
    }
  }

  // --- Private helpers ---

  private checkStoredProcedureError(
    response:
      | SupplierCreateResponse
      | SupplierUpdateResponse
      | SupplierDeleteResponse
      | SupplierRelCreateResponse
      | SupplierRelDeleteResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new SupplierError(
        spResponse.sp_message || "Erro na operação de fornecedor",
        "SUPPLIER_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptySupplierFindAllResponse(
    response: SupplierFindAllResponse,
  ): SupplierFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Supplier find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptySupplierSearchAllResponse(
    response: SupplierSearchAllResponse,
  ): SupplierSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Supplier find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptySupplierFindManagerAllResponse(
    response: SupplierFindManagerAllResponse,
  ): SupplierFindManagerAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Supplier find manager All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptySupplierRelFindProdAllResponse(
    response: SupplierRelFindProdAllResponse,
  ): SupplierRelFindProdAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Supplier relationship find All": [],
        },
      };
    }
    return response;
  }

  // --- Extract helpers ---

  extractSuppliers(response: SupplierFindAllResponse): SupplierListItem[] {
    return response.data?.["Supplier find All"] ?? [];
  }

  extractSearchSuppliers(
    response: SupplierSearchAllResponse,
  ): SupplierSearchListItem[] {
    return response.data?.["Supplier find All"] ?? [];
  }

  extractManagerAllSuppliers(
    response: SupplierFindManagerAllResponse,
  ): SupplierSearchListItem[] {
    return response.data?.["Supplier find manager All"] ?? [];
  }

  extractSupplierById(
    response: SupplierFindByIdResponse,
  ): SupplierDetail | null {
    return response.data?.["Supplier find Id"]?.[0] ?? null;
  }

  extractSupplierRelProds(
    response: SupplierRelFindProdAllResponse,
  ): SupplierRelProdItem[] {
    return response.data?.["Supplier relationship find All"] ?? [];
  }

  extractStoredProcedureResult(
    response:
      | SupplierCreateResponse
      | SupplierUpdateResponse
      | SupplierDeleteResponse
      | SupplierRelCreateResponse
      | SupplierRelDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  // --- Validation helpers ---

  isValidSupplierList(response: SupplierFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Supplier find All"])
    );
  }

  isValidSupplierSearchList(response: SupplierSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Supplier find All"])
    );
  }

  isValidSupplierManagerList(
    response: SupplierFindManagerAllResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Supplier find manager All"])
    );
  }

  isValidSupplierDetail(response: SupplierFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Supplier find Id"]) &&
      response.data["Supplier find Id"].length > 0
    );
  }

  isValidSupplierRelProdList(
    response: SupplierRelFindProdAllResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Supplier relationship find All"])
    );
  }
}

export const supplierServiceApi = new SupplierServiceApi();

export interface GetSuppliersPageParams {
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

export async function getSuppliersPage(
  params: GetSuppliersPageParams = {},
): Promise<{ items: UISupplier[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], total: 0 };
  }

  const response = await supplierServiceApi.findManagerAllSuppliers({
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

  const suppliers = supplierServiceApi.extractManagerAllSuppliers(response);
  const filteredTotal = Number(response.recordId);

  return {
    items: transformSupplierSearchList(suppliers),
    total:
      Number.isFinite(filteredTotal) && filteredTotal >= 0
        ? filteredTotal
        : (response.quantity ?? suppliers.length),
  };
}

export async function getSupplierById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UISupplier | undefined> {
  if (!params.pe_system_client_id) {
    return undefined;
  }

  const response = await supplierServiceApi.findSupplierById({
    pe_supplier_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });

  const supplier = supplierServiceApi.extractSupplierById(response);
  return transformSupplier(supplier) ?? undefined;
}
