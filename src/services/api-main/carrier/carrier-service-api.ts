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
  CarrierListItem,
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
      pe_system_client_id: serverEnvs.SYSTEM_CLIENT_ID,
      pe_organization_id: serverEnvs.ORGANIZATION_ID,
    };
  }

  async findAllCarriers(
    params: Partial<CarrierFindAllRequest> = {},
  ): Promise<CarrierFindAllResponse> {
    try {
      const validatedParams = CarrierFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
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

  async findCarrierById(
    params: CarrierFindByIdRequest,
  ): Promise<CarrierFindByIdResponse> {
    try {
      const validatedParams = CarrierFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CarrierFindByIdResponse>(
        CARRIER_ENDPOINTS.FIND_BY_ID,
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

  extractCarriers(response: CarrierFindAllResponse): CarrierListItem[] {
    return response.data?.["Carrier find All"] ?? [];
  }

  extractCarrierById(response: CarrierFindByIdResponse): CarrierDetail | null {
    return response.data?.["Carrier find Id"]?.[0] ?? null;
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

  isValidCarrierDetail(response: CarrierFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Carrier find Id"]) &&
      response.data["Carrier find Id"].length > 0
    );
  }
}

export const carrierServiceApi = new CarrierServiceApi();
