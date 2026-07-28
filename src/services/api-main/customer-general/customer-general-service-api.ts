import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  CUSTOMER_GENERAL_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  CustomerCreateRequest,
  CustomerCreateResponse,
  CustomerDetail,
  CustomerFindAllRequest,
  CustomerFindAllResponse,
  CustomerFindByIdRequest,
  CustomerFindByIdResponse,
  CustomerFindLatestProductsRequest,
  CustomerFindLatestProductsResponse,
  CustomerLatestProduct,
  CustomerListItem,
  StoredProcedureResponse,
} from "./types/customer-general-types";
import {
  CustomerError,
  CustomerNotFoundError,
} from "./types/customer-general-types";
import {
  CustomerCreateSchema,
  CustomerFindAllSchema,
  CustomerFindByIdSchema,
  CustomerFindLatestProductsSchema,
} from "./validation/customer-general-schemas";

const logger = createLogger("CustomerGeneralServiceApi");

export class CustomerGeneralServiceApi extends BaseApiService {
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

  async findAllCustomers(
    params: Partial<CustomerFindAllRequest> = {},
  ): Promise<CustomerFindAllResponse> {
    try {
      const validatedParams = CustomerFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_qt_registros: validatedParams.pe_qt_registros ?? 50,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 1,
        pe_order_id: validatedParams.pe_order_id ?? 1,
      });

      // console.debug("Buscando clientes com payload:", requestBody);

      const response = await this.post<CustomerFindAllResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_ALL,
        requestBody,
      );
      /* 
      console.log(
        "Clientes encontrados:\n%s",
        JSON.stringify(response, null, 2),
      ); */

      return this.normalizeEmptyFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar todos os clientes", error);
      throw error;
    }
  }

  async findCustomerById(
    params: CustomerFindByIdRequest,
  ): Promise<CustomerFindByIdResponse> {
    try {
      const validatedParams = CustomerFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerFindByIdResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new CustomerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new CustomerError(
          response.message || "Erro ao buscar cliente por ID",
          "CUSTOMER_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar cliente por ID", error);
      throw error;
    }
  }

  async createCustomer(
    params: CustomerCreateRequest,
  ): Promise<CustomerCreateResponse> {
    try {
      const validatedParams = CustomerCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerCreateResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      if (error instanceof CustomerError) {
        throw error;
      }
      logger.error("Erro ao criar cliente", error);
      throw error;
    }
  }

  async findLatestProducts(
    params: CustomerFindLatestProductsRequest,
  ): Promise<CustomerFindLatestProductsResponse> {
    try {
      const validatedParams = CustomerFindLatestProductsSchema.parse(params);
      const requestBody = this.buildBasePayload({
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_customer_id: validatedParams.pe_customer_id,
        pe_limit: validatedParams.pe_limit ?? 10,
      });

      const response = await this.post<CustomerFindLatestProductsResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_LATEST_PRODUCTS,
        requestBody,
      );

      return this.normalizeEmptyLatestProductsResponse(response);
    } catch (error) {
      logger.error("Erro ao buscar últimos produtos do cliente", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: CustomerCreateResponse): void {
    const spResponse = response.data?.[0] as StoredProcedureResponse;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new CustomerError(
        spResponse.sp_message || "Erro na operação de cliente",
        "CUSTOMER_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyFindAllResponse(
    response: CustomerFindAllResponse,
  ): CustomerFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Customer find All": [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyLatestProductsResponse(
    response: CustomerFindLatestProductsResponse,
  ): CustomerFindLatestProductsResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Customer Latest Products": [],
        },
      };
    }
    return response;
  }

  extractCustomers(response: CustomerFindAllResponse): CustomerListItem[] {
    return response.data?.["Customer find All"] ?? [];
  }

  extractCustomerById(
    response: CustomerFindByIdResponse,
  ): CustomerDetail | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractSellerInfo(
    response: CustomerFindByIdResponse,
  ): import("./types/customer-general-types").SellerInfo | null {
    return response.data?.["Seller Information"]?.[0] ?? null;
  }

  extractLatestProducts(
    response: CustomerFindLatestProductsResponse,
  ): CustomerLatestProduct[] {
    return response.data?.["Customer Latest Products"] ?? [];
  }

  extractStoredProcedureResult(
    response: CustomerCreateResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }

  isValidCustomerList(response: CustomerFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Customer find All"])
    );
  }

  isValidCustomerDetail(response: CustomerFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Customer Information"]) &&
      response.data["Customer Information"].length > 0
    );
  }
}

export const customerGeneralServiceApi = new CustomerGeneralServiceApi();
