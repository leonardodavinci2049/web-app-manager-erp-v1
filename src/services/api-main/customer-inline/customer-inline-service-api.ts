import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { CUSTOMER_INLINE_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  CustomerInlineEmailRequest,
  CustomerInlineEmailResponse,
  CustomerInlineFieldRequest,
  CustomerInlineFieldResponse,
  CustomerInlineNameRequest,
  CustomerInlineNameResponse,
  CustomerInlineNotesRequest,
  CustomerInlineNotesResponse,
  CustomerInlinePhoneRequest,
  CustomerInlinePhoneResponse,
  CustomerInlineSellerIdRequest,
  CustomerInlineSellerIdResponse,
  CustomerInlineTypeCustomerRequest,
  CustomerInlineTypeCustomerResponse,
  CustomerInlineTypePersonRequest,
  CustomerInlineTypePersonResponse,
  CustomerInlineWhatsappRequest,
  CustomerInlineWhatsappResponse,
  StoredProcedureResponse,
} from "./types/customer-inline-types";
import { CustomerInlineError } from "./types/customer-inline-types";
import {
  CustomerInlineEmailSchema,
  CustomerInlineFieldSchema,
  CustomerInlineNameSchema,
  CustomerInlineNotesSchema,
  CustomerInlinePhoneSchema,
  CustomerInlineSellerIdSchema,
  CustomerInlineTypeCustomerSchema,
  CustomerInlineTypePersonSchema,
  CustomerInlineWhatsappSchema,
} from "./validation/customer-inline-schemas";

const logger = createLogger("CustomerInlineServiceApi");

export class CustomerInlineServiceApi extends BaseApiService {
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
      throw new CustomerInlineError(
        spResponse.sp_message || `Erro na operação: ${context}`,
        "CUSTOMER_INLINE_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(response: {
    data: StoredProcedureResponse[];
  }): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  async updateField(
    params: CustomerInlineFieldRequest,
  ): Promise<CustomerInlineFieldResponse> {
    try {
      const validatedParams = CustomerInlineFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineFieldResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar campo inline");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar campo inline do cliente", error);
      throw error;
    }
  }

  async updateEmail(
    params: CustomerInlineEmailRequest,
  ): Promise<CustomerInlineEmailResponse> {
    try {
      const validatedParams = CustomerInlineEmailSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineEmailResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_EMAIL,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar email");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar email do cliente", error);
      throw error;
    }
  }

  async updateName(
    params: CustomerInlineNameRequest,
  ): Promise<CustomerInlineNameResponse> {
    try {
      const validatedParams = CustomerInlineNameSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineNameResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_NAME,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar nome");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar nome do cliente", error);
      throw error;
    }
  }

  async updateNotes(
    params: CustomerInlineNotesRequest,
  ): Promise<CustomerInlineNotesResponse> {
    try {
      const validatedParams = CustomerInlineNotesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineNotesResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_NOTES,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar anotações");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações do cliente", error);
      throw error;
    }
  }

  async updatePhone(
    params: CustomerInlinePhoneRequest,
  ): Promise<CustomerInlinePhoneResponse> {
    try {
      const validatedParams = CustomerInlinePhoneSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlinePhoneResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_PHONE,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar telefone");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar telefone do cliente", error);
      throw error;
    }
  }

  async updateSellerId(
    params: CustomerInlineSellerIdRequest,
  ): Promise<CustomerInlineSellerIdResponse> {
    try {
      const validatedParams = CustomerInlineSellerIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineSellerIdResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_SELLER_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar vendedor");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar vendedor do cliente", error);
      throw error;
    }
  }

  async updateTypeCustomer(
    params: CustomerInlineTypeCustomerRequest,
  ): Promise<CustomerInlineTypeCustomerResponse> {
    try {
      const validatedParams = CustomerInlineTypeCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineTypeCustomerResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_TYPE_CUSTOMER,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar tipo de cliente");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar tipo de cliente", error);
      throw error;
    }
  }

  async updateTypePerson(
    params: CustomerInlineTypePersonRequest,
  ): Promise<CustomerInlineTypePersonResponse> {
    try {
      const validatedParams = CustomerInlineTypePersonSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineTypePersonResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_TYPE_PERSON,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar tipo de pessoa");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar tipo de pessoa do cliente", error);
      throw error;
    }
  }

  async updateWhatsapp(
    params: CustomerInlineWhatsappRequest,
  ): Promise<CustomerInlineWhatsappResponse> {
    try {
      const validatedParams = CustomerInlineWhatsappSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerInlineWhatsappResponse>(
        CUSTOMER_INLINE_ENDPOINTS.UPD_WHATSAPP,
        requestBody,
      );

      this.checkStoredProcedureError(response, "atualizar WhatsApp");
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar WhatsApp do cliente", error);
      throw error;
    }
  }
}

export const customerInlineServiceApi = new CustomerInlineServiceApi();
