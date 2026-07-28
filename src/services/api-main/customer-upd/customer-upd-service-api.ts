import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { CUSTOMER_UPD_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  CustomerUpdAddressRequest,
  CustomerUpdAddressResponse,
  CustomerUpdBusinessRequest,
  CustomerUpdBusinessResponse,
  CustomerUpdFlagRequest,
  CustomerUpdFlagResponse,
  CustomerUpdGeneralRequest,
  CustomerUpdGeneralResponse,
  CustomerUpdInternetRequest,
  CustomerUpdInternetResponse,
  CustomerUpdPersonalRequest,
  CustomerUpdPersonalResponse,
  StoredProcedureResponse,
} from "./types/customer-upd-types";
import { CustomerUpdError } from "./types/customer-upd-types";
import {
  CustomerUpdAddressSchema,
  CustomerUpdBusinessSchema,
  CustomerUpdFlagSchema,
  CustomerUpdGeneralSchema,
  CustomerUpdInternetSchema,
  CustomerUpdPersonalSchema,
} from "./validation/customer-upd-schemas";

const logger = createLogger("CustomerUpdServiceApi");

export class CustomerUpdServiceApi extends BaseApiService {
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

  private checkStoredProcedureError(
    response: { data: StoredProcedureResponse[] },
    context: string,
  ): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new CustomerUpdError(
        spResponse.sp_message || `Erro na operação: ${context}`,
        "CUSTOMER_UPD_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(response: {
    data: StoredProcedureResponse[];
  }): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  async updateGeneral(
    params: CustomerUpdGeneralRequest,
  ): Promise<CustomerUpdGeneralResponse> {
    try {
      const validatedParams = CustomerUpdGeneralSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdGeneralResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_GENERAL,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar informações gerais");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar informações gerais do cliente", error);
      throw error;
    }
  }

  async updatePersonal(
    params: CustomerUpdPersonalRequest,
  ): Promise<CustomerUpdPersonalResponse> {
    try {
      const validatedParams = CustomerUpdPersonalSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdPersonalResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_PERSONAL,
        requestBody,
      );

      this.checkStoredProcedureError(
        response,
        "atualizar informações pessoais",
      );
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar informações pessoais do cliente", error);
      throw error;
    }
  }

  async updateBusiness(
    params: CustomerUpdBusinessRequest,
  ): Promise<CustomerUpdBusinessResponse> {
    try {
      const validatedParams = CustomerUpdBusinessSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdBusinessResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_BUSINESS,
        requestBody,
      );

      this.checkStoredProcedureError(
        response,
        "atualizar informações empresariais",
      );
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar informações empresariais do cliente",
        error,
      );
      throw error;
    }
  }

  async updateAddress(
    params: CustomerUpdAddressRequest,
  ): Promise<CustomerUpdAddressResponse> {
    try {
      const validatedParams = CustomerUpdAddressSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdAddressResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_ADDRESS,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar endereço");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar endereço do cliente", error);
      throw error;
    }
  }

  async updateInternet(
    params: CustomerUpdInternetRequest,
  ): Promise<CustomerUpdInternetResponse> {
    try {
      const validatedParams = CustomerUpdInternetSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdInternetResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_INTERNET,
        requestBody,
      );

      this.checkStoredProcedureError(
        response,
        "atualizar informações de internet",
      );
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar informações de internet do cliente",
        error,
      );
      throw error;
    }
  }

  async updateFlag(
    params: CustomerUpdFlagRequest,
  ): Promise<CustomerUpdFlagResponse> {
    try {
      const validatedParams = CustomerUpdFlagSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerUpdFlagResponse>(
        CUSTOMER_UPD_ENDPOINTS.UPD_FLAG,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar flags");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar flags do cliente", error);
      throw error;
    }
  }
}

export const customerUpdServiceApi = new CustomerUpdServiceApi();
