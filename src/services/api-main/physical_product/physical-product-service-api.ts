import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  isApiError,
  PHYSICAL_PRODUCT_ENDPOINTS,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  OrderItemCustomerEntity,
  OrderItemFindAllCustomerRequest,
  OrderItemFindAllCustomerResponse,
  OrderItemFindIdCustomerRequest,
  OrderItemFindIdCustomerResponse,
  PhysicalProductEntity,
  PhysicalProductFindAllRequest,
  PhysicalProductFindAllResponse,
  PhysicalProductWarrantyEntity,
  PhysicalProductWarrantyIdCustomerRequest,
  PhysicalProductWarrantyIdCustomerResponse,
  PhysicalProductWarrantyIdRequest,
  PhysicalProductWarrantyIdResponse,
  PhysicalProductWarrantyMovCustomerRequest,
  PhysicalProductWarrantyMovCustomerResponse,
  PhysicalProductWarrantyMovRequest,
  PhysicalProductWarrantyMovResponse,
  PhysicalProductWarrantySearchRequest,
  PhysicalProductWarrantySearchResponse,
  PhysicalProductWarrantyWithProductEntity,
} from "./types/physical-product-types";
import {
  PhysicalProductError,
  PhysicalProductNotFoundError,
} from "./types/physical-product-types";
import {
  OrderItemFindAllCustomerSchema,
  OrderItemFindIdCustomerSchema,
  PhysicalProductFindAllSchema,
  PhysicalProductWarrantyIdCustomerSchema,
  PhysicalProductWarrantyIdSchema,
  PhysicalProductWarrantyMovCustomerSchema,
  PhysicalProductWarrantyMovSchema,
  PhysicalProductWarrantySearchSchema,
} from "./validation/physical-product-schemas";

const logger = createLogger("PhysicalProductServiceApi");

type PhysicalProductResponse = { statusCode: number; message: string };

export class PhysicalProductServiceApi extends BaseApiService {
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

  private handleApiError(
    response: PhysicalProductResponse,
    params: Record<string, unknown>,
    errorLabel: string,
    errorCode: string,
  ): void {
    if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
      throw new PhysicalProductNotFoundError(params);
    }

    if (isApiError(response.statusCode)) {
      throw new PhysicalProductError(
        response.message || `Erro ao buscar ${errorLabel}`,
        errorCode,
        response.statusCode,
      );
    }
  }

  async findAll(
    params: PhysicalProductFindAllRequest = {},
  ): Promise<PhysicalProductFindAllResponse> {
    try {
      const validatedParams = PhysicalProductFindAllSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PhysicalProductFindAllResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.PHYSICAL_PRODUCT_FIND_ALL,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "produtos físicos",
        "PHYSICAL_PRODUCT_FIND_ALL_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar produtos físicos", error);
      throw error;
    }
  }

  async findOrderItemsByCustomer(
    params: OrderItemFindAllCustomerRequest,
  ): Promise<OrderItemFindAllCustomerResponse> {
    try {
      const validatedParams = OrderItemFindAllCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemFindAllCustomerResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.ORDER_ITEM_FIND_ALL_CUSTOMER,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "itens de pedido do cliente",
        "PHYSICAL_PRODUCT_ORDER_ITEM_FIND_ALL_CUSTOMER_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar itens de pedido do cliente", error);
      throw error;
    }
  }

  async findOrderItemByCustomer(
    params: OrderItemFindIdCustomerRequest,
  ): Promise<OrderItemFindIdCustomerResponse> {
    try {
      const validatedParams = OrderItemFindIdCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<OrderItemFindIdCustomerResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.ORDER_ITEM_FIND_ID_CUSTOMER,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "item de pedido do cliente",
        "PHYSICAL_PRODUCT_ORDER_ITEM_FIND_ID_CUSTOMER_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar item de pedido do cliente", error);
      throw error;
    }
  }

  async findWarrantyByPhysicalId(
    params: PhysicalProductWarrantyIdRequest,
  ): Promise<PhysicalProductWarrantyIdResponse> {
    try {
      const validatedParams = PhysicalProductWarrantyIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PhysicalProductWarrantyIdResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.WARRANTY_ID,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "garantia do produto físico",
        "PHYSICAL_PRODUCT_WARRANTY_ID_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar garantia do produto físico", error);
      throw error;
    }
  }

  async findWarrantyByPhysicalIdAndCustomer(
    params: PhysicalProductWarrantyIdCustomerRequest,
  ): Promise<PhysicalProductWarrantyIdCustomerResponse> {
    try {
      const validatedParams =
        PhysicalProductWarrantyIdCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response =
        await this.post<PhysicalProductWarrantyIdCustomerResponse>(
          PHYSICAL_PRODUCT_ENDPOINTS.WARRANTY_ID_CUSTOMER,
          requestBody,
        );

      this.handleApiError(
        response,
        validatedParams,
        "garantia do produto físico por cliente",
        "PHYSICAL_PRODUCT_WARRANTY_ID_CUSTOMER_ERROR",
      );

      return response;
    } catch (error) {
      logger.error(
        "Erro ao buscar garantia do produto físico por cliente",
        error,
      );
      throw error;
    }
  }

  async findWarrantiesByMovement(
    params: PhysicalProductWarrantyMovRequest,
  ): Promise<PhysicalProductWarrantyMovResponse> {
    try {
      const validatedParams = PhysicalProductWarrantyMovSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PhysicalProductWarrantyMovResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.WARRANTY_MOV,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "garantias por movimento",
        "PHYSICAL_PRODUCT_WARRANTY_MOV_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar garantias por movimento", error);
      throw error;
    }
  }

  async findWarrantiesByMovementAndCustomer(
    params: PhysicalProductWarrantyMovCustomerRequest,
  ): Promise<PhysicalProductWarrantyMovCustomerResponse> {
    try {
      const validatedParams =
        PhysicalProductWarrantyMovCustomerSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response =
        await this.post<PhysicalProductWarrantyMovCustomerResponse>(
          PHYSICAL_PRODUCT_ENDPOINTS.WARRANTY_MOV_CUSTOMER,
          requestBody,
        );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        return {
          ...response,
          data: {
            "warranty find id": [],
          },
        };
      }

      this.handleApiError(
        response,
        validatedParams,
        "garantias por movimento e cliente",
        "PHYSICAL_PRODUCT_WARRANTY_MOV_CUSTOMER_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao buscar garantias por movimento e cliente", error);
      throw error;
    }
  }

  async searchWarranties(
    params: PhysicalProductWarrantySearchRequest,
  ): Promise<PhysicalProductWarrantySearchResponse> {
    try {
      const validatedParams = PhysicalProductWarrantySearchSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<PhysicalProductWarrantySearchResponse>(
        PHYSICAL_PRODUCT_ENDPOINTS.WARRANTY_SEARCH,
        requestBody,
      );

      this.handleApiError(
        response,
        validatedParams,
        "garantias de produtos físicos",
        "PHYSICAL_PRODUCT_WARRANTY_SEARCH_ERROR",
      );

      return response;
    } catch (error) {
      logger.error("Erro ao pesquisar garantias de produtos físicos", error);
      throw error;
    }
  }

  extractPhysicalProducts(
    response: PhysicalProductFindAllResponse,
  ): PhysicalProductEntity[] {
    return response.data?.["Physical Product find all"] ?? [];
  }

  extractOrderItemsByCustomer(
    response: OrderItemFindAllCustomerResponse,
  ): OrderItemCustomerEntity[] {
    return response.data?.["Order Item find all"] ?? [];
  }

  extractOrderItemByCustomer(
    response: OrderItemFindIdCustomerResponse,
  ): OrderItemCustomerEntity | null {
    return response.data?.["Order Item find Id "]?.[0] ?? null;
  }

  extractWarrantyByPhysicalId(
    response: PhysicalProductWarrantyIdResponse,
  ): PhysicalProductWarrantyWithProductEntity | null {
    return response.data?.["warranty find id customer"]?.[0] ?? null;
  }

  extractWarrantyByPhysicalIdAndCustomer(
    response: PhysicalProductWarrantyIdCustomerResponse,
  ): PhysicalProductWarrantyWithProductEntity | null {
    return response.data?.["Warranty mov customer"]?.[0] ?? null;
  }

  extractWarrantiesByMovement(
    response: PhysicalProductWarrantyMovResponse,
  ): PhysicalProductWarrantyWithProductEntity[] {
    return response.data?.["Warranty mov"] ?? [];
  }

  extractWarrantiesByMovementAndCustomer(
    response: PhysicalProductWarrantyMovCustomerResponse,
  ): PhysicalProductWarrantyWithProductEntity[] {
    return response.data?.["warranty find id"] ?? [];
  }

  extractWarrantySearch(
    response: PhysicalProductWarrantySearchResponse,
  ): PhysicalProductWarrantyEntity[] {
    return response.data?.["Warranty search"] ?? [];
  }
}

export const physicalProductServiceApi = new PhysicalProductServiceApi();
