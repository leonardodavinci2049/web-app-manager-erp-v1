import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  ENTRY_ITEM_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  type EntryItemCreateRequest,
  type EntryItemDeleteRequest,
  type EntryItemDetail,
  type EntryItemEntryListItem,
  EntryItemError,
  type EntryItemFindAllRequest,
  type EntryItemFindAllResponse,
  type EntryItemFindByIdRequest,
  type EntryItemFindByIdResponse,
  type EntryItemFindEntryIdRequest,
  type EntryItemFindEntryIdResponse,
  type EntryItemListItem,
  type EntryItemMutationResponse,
  EntryItemNotFoundError,
  type EntryItemProduct,
  type EntryItemProductSearchRequest,
  type EntryItemProductSearchResponse,
  type EntryItemSearchItem,
  type EntryItemSearchRequest,
  type EntryItemSearchResponse,
  type EntryItemUpdateDollarValueRequest,
  type EntryItemUpdateGeneralFieldRequest,
  type EntryItemUpdateMainRequest,
  type EntryItemUpdateNotesRequest,
  type EntryItemUpdateProductCostRequest,
  type EntryItemUpdateProductPriceRequest,
  type EntryItemUpdateTaxCodesRequest,
  type EntryItemUpdateTaxRatesRequest,
  type StoredProcedureResponse,
} from "./types/entry-item-types";
import {
  EntryItemCreateSchema,
  EntryItemDeleteSchema,
  EntryItemFindAllSchema,
  EntryItemFindByIdSchema,
  EntryItemFindEntryIdSchema,
  EntryItemProductSearchSchema,
  EntryItemSearchSchema,
  EntryItemUpdateDollarValueSchema,
  EntryItemUpdateGeneralFieldSchema,
  EntryItemUpdateMainSchema,
  EntryItemUpdateNotesSchema,
  EntryItemUpdateProductCostSchema,
  EntryItemUpdateProductPriceSchema,
  EntryItemUpdateTaxCodesSchema,
  EntryItemUpdateTaxRatesSchema,
} from "./validation/entry-item-schemas";

const logger = createLogger("EntryItemServiceApi");

export class EntryItemServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllEntryItems(
    params: Partial<EntryItemFindAllRequest> = {},
  ): Promise<EntryItemFindAllResponse> {
    try {
      const validatedParams = EntryItemFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_type_id: validatedParams.pe_type_id ?? 0,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id,
        pe_order_id: validatedParams.pe_order_id,
      });

      const response = await this.post<EntryItemFindAllResponse>(
        ENTRY_ITEM_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyEntryItemFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar itens de entrada", error);
      throw error;
    }
  }

  async findEntryItemsByEntryId(
    params: EntryItemFindEntryIdRequest,
  ): Promise<EntryItemFindEntryIdResponse> {
    try {
      const validatedParams = EntryItemFindEntryIdSchema.parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_entry_id: validatedParams.pe_entry_id,
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<EntryItemFindEntryIdResponse>(
        ENTRY_ITEM_ENDPOINTS.FIND_ENTRY_ID,
        requestBody,
      );

      return this.normalizeEmptyEntryItemFindEntryIdResponse(response);
    } catch (error) {
      logger.error("Erro ao listar itens da entrada por ID da entrada", error);
      throw error;
    }
  }

  async findEntryItemById(
    params: EntryItemFindByIdRequest,
  ): Promise<EntryItemFindByIdResponse> {
    try {
      const validatedParams = EntryItemFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemFindByIdResponse>(
        ENTRY_ITEM_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (
        response.statusCode === API_STATUS_CODES.NOT_FOUND ||
        response.statusCode === API_STATUS_CODES.UNPROCESSABLE
      ) {
        throw new EntryItemNotFoundError({
          pe_item_movement_id: validatedParams.pe_item_movement_id,
        });
      }

      if (isApiError(response.statusCode)) {
        throw new EntryItemError(
          response.message || "Erro ao buscar item da entrada por ID",
          "ENTRY_ITEM_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar item da entrada por ID", error);
      throw error;
    }
  }

  async searchEntryItems(
    params: Partial<EntryItemSearchRequest> = {},
  ): Promise<EntryItemSearchResponse> {
    try {
      const validatedParams = EntryItemSearchSchema.partial().parse(params);
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

      const response = await this.post<EntryItemSearchResponse>(
        ENTRY_ITEM_ENDPOINTS.FIND_SEARCH,
        requestBody,
      );

      return this.normalizeEmptyEntryItemSearchResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar itens de entrada", error);
      throw error;
    }
  }

  async searchEntryItemProducts(
    params: Partial<EntryItemProductSearchRequest> = {},
  ): Promise<EntryItemProductSearchResponse> {
    try {
      const validatedParams =
        EntryItemProductSearchSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_supplier_id: validatedParams.pe_supplier_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_limit: validatedParams.pe_limit ?? 100,
      });

      const response = await this.post<EntryItemProductSearchResponse>(
        ENTRY_ITEM_ENDPOINTS.PRODUCT_SEARCH,
        requestBody,
      );

      return this.normalizeEmptyEntryItemProductSearchResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar produtos para o item da entrada", error);
      throw error;
    }
  }

  async createEntryItem(
    params: EntryItemCreateRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar item da entrada", error);
      throw error;
    }
  }

  async deleteEntryItem(
    params: EntryItemDeleteRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir item da entrada", error);
      throw error;
    }
  }

  async updateEntryItemDollarValue(
    params: EntryItemUpdateDollarValueRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateDollarValueSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_DOLLAR_VALUE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar valor do dólar do item da entrada",
        error,
      );
      throw error;
    }
  }

  async updateEntryItemGeneralField(
    params: EntryItemUpdateGeneralFieldRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateGeneralFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_GENERAL_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar campo genérico do item da entrada",
        error,
      );
      throw error;
    }
  }

  async updateEntryItemMain(
    params: EntryItemUpdateMainRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateMainSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_MAIN,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar dados gerais do item da entrada", error);
      throw error;
    }
  }

  async updateEntryItemNotes(
    params: EntryItemUpdateNotesRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateNotesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_NOTES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações do item da entrada", error);
      throw error;
    }
  }

  async updateEntryItemProductCost(
    params: EntryItemUpdateProductCostRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateProductCostSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_PRODUCT_COST,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar custo do item da entrada", error);
      throw error;
    }
  }

  async updateEntryItemProductPrice(
    params: EntryItemUpdateProductPriceRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateProductPriceSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_PRODUCT_PRICE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar preços de venda do produto do item da entrada",
        error,
      );
      throw error;
    }
  }

  async updateEntryItemTaxCodes(
    params: EntryItemUpdateTaxCodesRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateTaxCodesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_TAX_CODES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar códigos fiscais do item da entrada",
        error,
      );
      throw error;
    }
  }

  async updateEntryItemTaxRates(
    params: EntryItemUpdateTaxRatesRequest,
  ): Promise<EntryItemMutationResponse> {
    try {
      const validatedParams = EntryItemUpdateTaxRatesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryItemMutationResponse>(
        ENTRY_ITEM_ENDPOINTS.UPD_TAX_RATES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar valores tributários do item da entrada",
        error,
      );
      throw error;
    }
  }

  private checkStoredProcedureError(response: EntryItemMutationResponse): void {
    const spResponse = response.data?.[0];
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new EntryItemError(
        spResponse.sp_message || "Erro na operação de item da entrada",
        "ENTRY_ITEM_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyEntryItemFindAllResponse(
    response: EntryItemFindAllResponse,
  ): EntryItemFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entryItemFindAll: [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyEntryItemFindEntryIdResponse(
    response: EntryItemFindEntryIdResponse,
  ): EntryItemFindEntryIdResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entryItemFindEntryId: [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyEntryItemSearchResponse(
    response: EntryItemSearchResponse,
  ): EntryItemSearchResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entryItemFindSearch: [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyEntryItemProductSearchResponse(
    response: EntryItemProductSearchResponse,
  ): EntryItemProductSearchResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entryItemProductSearch: [],
        },
      };
    }
    return response;
  }

  extractEntryItems(response: EntryItemFindAllResponse): EntryItemListItem[] {
    return response.data?.entryItemFindAll ?? [];
  }

  extractEntryItemsByEntryId(
    response: EntryItemFindEntryIdResponse,
  ): EntryItemEntryListItem[] {
    return response.data?.entryItemFindEntryId ?? [];
  }

  extractEntryItemDetail(
    response: EntryItemFindByIdResponse,
  ): EntryItemDetail | null {
    return response.data?.entryItemFindId?.[0] ?? null;
  }

  extractSearchEntryItems(
    response: EntryItemSearchResponse,
  ): EntryItemSearchItem[] {
    return response.data?.entryItemFindSearch ?? [];
  }

  extractEntryItemProducts(
    response: EntryItemProductSearchResponse,
  ): EntryItemProduct[] {
    return response.data?.entryItemProductSearch ?? [];
  }

  extractStoredProcedureResult(
    response: EntryItemMutationResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0] ?? null;
  }

  isValidEntryItemList(response: EntryItemFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.entryItemFindAll)
    );
  }

  isValidEntryItemDetail(response: EntryItemFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.entryItemFindId) &&
      response.data.entryItemFindId.length > 0
    );
  }
}

export const entryItemServiceApi = new EntryItemServiceApi();
