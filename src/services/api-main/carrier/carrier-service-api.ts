import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  CARRIER_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformCarrier,
  transformCarrierList,
  type UICarrier,
} from "./transformers/transformers";

import type {
  CarrierCreateRequest,
  CarrierCreateResponse,
  CarrierDeleteRequest,
  CarrierDeleteResponse,
  CarrierDetail,
  CarrierFindAllRequest,
  CarrierFindAllResponse,
  CarrierFindByIdRequest,
  CarrierFindByIdResponse,
  CarrierFindManagerAllRequest,
  CarrierFindManagerAllResponse,
  CarrierListItem,
  CarrierSearchAllRequest,
  CarrierSearchAllResponse,
  CarrierUpdateRequest,
  CarrierUpdateResponse,
  StoredProcedureResponse,
} from "./types/carrier-types";
import { CarrierError, CarrierNotFoundError } from "./types/carrier-types";
import {
  CarrierCreateSchema,
  CarrierDeleteSchema,
  CarrierFindAllSchema,
  CarrierFindByIdSchema,
  CarrierFindManagerAllSchema,
  CarrierSearchAllSchema,
  CarrierUpdateSchema,
} from "./validation/carrier-schemas";

const logger = createLogger("CarrierServiceApi");

export class CarrierServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllCarriers(
    params: Partial<CarrierFindAllRequest> = {},
  ): Promise<CarrierFindAllResponse> {
    try {
      const validatedParams = CarrierFindAllSchema.partial().parse(params);
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

      const response = await this.post<CarrierFindAllResponse>(
        CARRIER_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyCarrierFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todas as transportadoras", error);
      throw error;
    }
  }

  async searchAllCarriers(
    params: Partial<CarrierSearchAllRequest> = {},
  ): Promise<CarrierSearchAllResponse> {
    try {
      const validatedParams = CarrierSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<CarrierSearchAllResponse>(
        CARRIER_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptyCarrierSearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar transportadoras", error);
      throw error;
    }
  }

  async findManagerAllCarriers(
    params: Partial<CarrierFindManagerAllRequest> = {},
  ): Promise<CarrierFindManagerAllResponse> {
    try {
      const validatedParams =
        CarrierFindManagerAllSchema.partial().parse(params);
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

      const response = await this.post<CarrierFindManagerAllResponse>(
        CARRIER_ENDPOINTS.FIND_MANAGER_ALL,
        requestBody,
      );

      return this.normalizeEmptyCarrierFindManagerAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar transportadoras (manager)", error);
      throw error;
    }
  }

  async findCarrierById(
    params: CarrierFindByIdRequest,
  ): Promise<CarrierFindByIdResponse> {
    try {
      const validatedParams = CarrierFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CarrierFindByIdResponse>(
        CARRIER_ENDPOINTS.FIND_MANAGER_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new CarrierNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new CarrierError(
          response.message || "Erro ao buscar transportadora por ID",
          "CARRIER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar transportadora por ID", error);
      throw error;
    }
  }

  async createCarrier(
    params: CarrierCreateRequest,
  ): Promise<CarrierCreateResponse> {
    try {
      const validatedParams = CarrierCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CarrierCreateResponse>(
        CARRIER_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar transportadora", error);
      throw error;
    }
  }

  async updateCarrier(
    params: CarrierUpdateRequest,
  ): Promise<CarrierUpdateResponse> {
    try {
      const validatedParams = CarrierUpdateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CarrierUpdateResponse>(
        CARRIER_ENDPOINTS.UPDATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar transportadora", error);
      throw error;
    }
  }

  async deleteCarrier(
    params: CarrierDeleteRequest,
  ): Promise<CarrierDeleteResponse> {
    try {
      const validatedParams = CarrierDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CarrierDeleteResponse>(
        CARRIER_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir transportadora", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response:
      | CarrierCreateResponse
      | CarrierUpdateResponse
      | CarrierDeleteResponse,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new CarrierError(
        spResponse.sp_message || "Erro na operação de transportadora",
        "CARRIER_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyCarrierFindAllResponse(
    response: CarrierFindAllResponse,
  ): CarrierFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Carrier find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyCarrierSearchAllResponse(
    response: CarrierSearchAllResponse,
  ): CarrierSearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Carrier find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyCarrierFindManagerAllResponse(
    response: CarrierFindManagerAllResponse,
  ): CarrierFindManagerAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Carrier find manager All": [],
        },
      };
    }
    return response;
  }

  extractCarriers(response: CarrierFindAllResponse): CarrierListItem[] {
    return response.data?.["Carrier find All"] ?? [];
  }

  extractSearchCarriers(response: CarrierSearchAllResponse): CarrierListItem[] {
    return response.data?.["Carrier find All"] ?? [];
  }

  extractManagerAllCarriers(
    response: CarrierFindManagerAllResponse,
  ): CarrierListItem[] {
    return response.data?.["Carrier find manager All"] ?? [];
  }

  extractCarrierById(response: CarrierFindByIdResponse): CarrierDetail | null {
    return response.data?.["Carrier find manager Id"]?.[0] ?? null;
  }

  extractStoredProcedureResult(
    response:
      | CarrierCreateResponse
      | CarrierUpdateResponse
      | CarrierDeleteResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidCarrierList(response: CarrierFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Carrier find All"])
    );
  }

  isValidCarrierSearchList(response: CarrierSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Carrier find All"])
    );
  }

  isValidCarrierManagerList(response: CarrierFindManagerAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Carrier find manager All"])
    );
  }

  isValidCarrierDetail(response: CarrierFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Carrier find manager Id"]) &&
      response.data["Carrier find manager Id"].length > 0
    );
  }
}

export const carrierServiceApi = new CarrierServiceApi();

export interface GetCarriersPageParams {
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

export async function getCarriersPage(
  params: GetCarriersPageParams = {},
): Promise<{ items: UICarrier[]; total: number }> {
  if (!params.pe_system_client_id) {
    return { items: [], total: 0 };
  }

  const response = await carrierServiceApi.findManagerAllCarriers({
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

  const carriers = carrierServiceApi.extractManagerAllCarriers(response);
  const filteredTotal = Number(response.recordId);

  return {
    items: transformCarrierList(carriers),
    total:
      Number.isFinite(filteredTotal) && filteredTotal >= 0
        ? filteredTotal
        : (response.quantity ?? carriers.length),
  };
}

export async function getCarrierById(
  id: number,
  params: {
    pe_system_client_id?: number;
    pe_organization_id?: string;
    pe_user_id?: string;
    pe_user_name?: string;
    pe_user_role?: string;
    pe_person_id?: number;
  } = {},
): Promise<UICarrier | undefined> {
  if (!params.pe_system_client_id) return undefined;

  const response = await carrierServiceApi.findCarrierById({
    pe_carrier_id: id,
    pe_system_client_id: params.pe_system_client_id,
    pe_organization_id: params.pe_organization_id,
    pe_user_id: params.pe_user_id,
    pe_user_name: params.pe_user_name,
    pe_user_role: params.pe_user_role,
    pe_person_id: params.pe_person_id,
  });
  const carrier = carrierServiceApi.extractCarrierById(response);
  return transformCarrier(carrier) ?? undefined;
}
