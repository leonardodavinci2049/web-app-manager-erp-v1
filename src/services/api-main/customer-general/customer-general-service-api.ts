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
import {
  transformCustomerDetail,
  transformCustomerLatestProductList,
  transformCustomerManagerList,
  transformSellerInfo,
  type UICustomerDetail,
  type UICustomerLatestProduct,
  type UICustomerListItem,
  type UISellerInfo,
} from "./transformers/transformers";

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
  CustomerFindManagerAllRequest,
  CustomerFindManagerAllResponse,
  CustomerFindManagerIdRequest,
  CustomerFindManagerIdResponse,
  CustomerFindPdvIdRequest,
  CustomerFindPdvIdResponse,
  CustomerLatestProduct,
  CustomerListItem,
  CustomerManagerDetail,
  CustomerManagerListItem,
  CustomerPersonListItem,
  CustomerSearchAllRequest,
  CustomerSearchAllResponse,
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
  CustomerFindManagerAllSchema,
  CustomerFindManagerIdSchema,
  CustomerFindPdvIdSchema,
  CustomerSearchAllSchema,
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
    };
  }

  async findAllCustomers(
    params: Partial<CustomerFindAllRequest> = {},
  ): Promise<CustomerFindAllResponse> {
    try {
      const validatedParams = CustomerFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
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

  async searchAllCustomers(
    params: Partial<CustomerSearchAllRequest> = {},
  ): Promise<CustomerSearchAllResponse> {
    try {
      const validatedParams = CustomerSearchAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
      });

      const response = await this.post<CustomerSearchAllResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.SEARCH_ALL,
        requestBody,
      );

      return this.normalizeEmptySearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar clientes", error);
      throw error;
    }
  }

  async findManagerAllCustomers(
    params: Partial<CustomerFindManagerAllRequest> = {},
  ): Promise<CustomerFindManagerAllResponse> {
    try {
      const validatedParams =
        CustomerFindManagerAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_category_id: validatedParams.pe_category_id ?? 0,
        pe_client_type: validatedParams.pe_client_type ?? 0,
        pe_person_type: validatedParams.pe_person_type ?? 0,
        pe_flag_no_image: validatedParams.pe_flag_no_image ?? 0,
        pe_flag_approved: validatedParams.pe_flag_approved ?? 0,
        pe_gender_type: validatedParams.pe_gender_type ?? 0,
        pe_flag_restricted: validatedParams.pe_flag_restricted ?? 0,
        pe_flag_enabled: validatedParams.pe_flag_enabled ?? 0,
        pe_status_id: validatedParams.pe_status_id ?? 0,
        pe_flag_operation_list: validatedParams.pe_flag_operation_list ?? 0,
        pe_start_date: validatedParams.pe_start_date ?? "",
        pe_end_date: validatedParams.pe_end_date ?? "",
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id ?? 2,
        pe_order_id: validatedParams.pe_order_id ?? 2,
      });

      const response = await this.post<CustomerFindManagerAllResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_MANAGER_ALL,
        requestBody,
      );

      return this.normalizeEmptyFindManagerAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar clientes (manager)", error);
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

  async findCustomerByManagerId(
    params: CustomerFindManagerIdRequest,
  ): Promise<CustomerFindManagerIdResponse> {
    try {
      const validatedParams = CustomerFindManagerIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerFindManagerIdResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_MANAGER_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new CustomerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new CustomerError(
          response.message || "Erro ao buscar cliente por ID no manager",
          "CUSTOMER_FIND_MANAGER_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar cliente por ID no manager", error);
      throw error;
    }
  }

  async findCustomerByPdvId(
    params: CustomerFindPdvIdRequest,
  ): Promise<CustomerFindPdvIdResponse> {
    try {
      const validatedParams = CustomerFindPdvIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<CustomerFindPdvIdResponse>(
        CUSTOMER_GENERAL_ENDPOINTS.FIND_PDV_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new CustomerNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new CustomerError(
          response.message || "Erro ao buscar cliente por ID no PDV",
          "CUSTOMER_FIND_PDV_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar cliente por ID no PDV", error);
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
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
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

  private normalizeEmptySearchAllResponse(
    response: CustomerSearchAllResponse,
  ): CustomerSearchAllResponse {
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

  private normalizeEmptyFindManagerAllResponse(
    response: CustomerFindManagerAllResponse,
  ): CustomerFindManagerAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Customer find manager All": [],
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

  extractSearchCustomers(
    response: CustomerSearchAllResponse,
  ): CustomerPersonListItem[] {
    return response.data?.["Customer find All"] ?? [];
  }

  extractManagerAllCustomers(
    response: CustomerFindManagerAllResponse,
  ): CustomerManagerListItem[] {
    return response.data?.["Customer find manager All"] ?? [];
  }

  extractCustomerById(
    response: CustomerFindByIdResponse,
  ): CustomerDetail | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractCustomerByManagerId(
    response: CustomerFindManagerIdResponse,
  ): CustomerManagerDetail | null {
    return response.data?.["Customer Information"]?.[0] ?? null;
  }

  extractSellerInfo(
    response: CustomerFindByIdResponse | CustomerFindManagerIdResponse,
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

  isValidCustomerSearchList(response: CustomerSearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Customer find All"])
    );
  }

  isValidCustomerManagerList(
    response: CustomerFindManagerAllResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      !!response.data &&
      Array.isArray(response.data["Customer find manager All"])
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

interface CustomerApiContext {
  pe_system_client_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
}

export interface GetCustomersPageParams extends CustomerApiContext {
  search?: string;
  categoryId?: number;
  clientType?: number;
  personType?: number;
  noImage?: number;
  approved?: number;
  gender?: number;
  restricted?: number;
  enabled?: number;
  statusId?: number;
  operation?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  columnId?: number;
  orderId?: number;
}

export interface UICustomerDetailsBundle {
  customer: UICustomerDetail;
  seller?: UISellerInfo;
}

export async function getCustomersPage(
  params: GetCustomersPageParams = {},
): Promise<{ items: UICustomerListItem[]; total: number }> {
  if (!params.pe_system_client_id) return { items: [], total: 0 };

  const response = await customerGeneralServiceApi.findManagerAllCustomers({
    pe_search: params.search ?? "",
    pe_category_id: params.categoryId ?? 0,
    pe_client_type: params.clientType ?? 0,
    pe_person_type: params.personType ?? 0,
    pe_flag_no_image: params.noImage ?? 0,
    pe_flag_approved: params.approved ?? 0,
    pe_gender_type: params.gender ?? 0,
    pe_flag_restricted: params.restricted ?? 0,
    pe_flag_enabled: params.enabled ?? 0,
    pe_status_id: params.statusId ?? 0,
    pe_flag_operation_list: params.operation ?? 0,
    pe_start_date: params.startDate ?? "",
    pe_end_date: params.endDate ?? "",
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
  const customers =
    customerGeneralServiceApi.extractManagerAllCustomers(response);
  const normalizedTotal = Number(response.recordId);

  return {
    items: transformCustomerManagerList(customers),
    total:
      Number.isFinite(normalizedTotal) && normalizedTotal >= 0
        ? normalizedTotal
        : (response.quantity ?? customers.length),
  };
}

export async function getCustomerById(
  id: number,
  params: CustomerApiContext = {},
): Promise<UICustomerDetailsBundle | undefined> {
  if (!params.pe_system_client_id) return undefined;

  const response = await customerGeneralServiceApi.findCustomerByManagerId({
    pe_customer_id: id,
    ...params,
  });
  const customer =
    customerGeneralServiceApi.extractCustomerByManagerId(response);
  if (!customer) return undefined;
  const seller = customerGeneralServiceApi.extractSellerInfo(response);

  return {
    customer: transformCustomerDetail(customer),
    seller: seller ? transformSellerInfo(seller) : undefined,
  };
}

export async function getCustomerLatestProducts(
  customerId: number,
  params: CustomerApiContext = {},
  limit = 10,
): Promise<UICustomerLatestProduct[]> {
  if (!params.pe_system_client_id) return [];

  const response = await customerGeneralServiceApi.findLatestProducts({
    pe_customer_id: customerId,
    pe_limit: limit,
    ...params,
  });
  return transformCustomerLatestProductList(
    customerGeneralServiceApi.extractLatestProducts(response),
  );
}
