import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import {
  API_STATUS_CODES,
  ENTRY_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  type EntryCreateRequest,
  type EntryDeleteRequest,
  type EntryDetail,
  EntryError,
  type EntryFindAllRequest,
  type EntryFindAllResponse,
  type EntryFindByIdRequest,
  type EntryFindByIdResponse,
  type EntryListItem,
  type EntryMutationResponse,
  EntryNotFoundError,
  type EntryProcessInventoryRequest,
  type EntrySearchAllRequest,
  type EntrySearchAllResponse,
  type EntrySearchItem,
  type EntrySummary,
  type EntryUpdateCarrierRequest,
  type EntryUpdateGeneralFieldRequest,
  type EntryUpdateMainRequest,
  type EntryUpdateNotesRequest,
  type EntryUpdateSupplierRequest,
  type EntryUpdateTaxRatesRequest,
  type StoredProcedureResponse,
} from "./types/entry-types";
import {
  EntryCreateSchema,
  EntryDeleteSchema,
  EntryFindAllSchema,
  EntryFindByIdSchema,
  EntryProcessInventorySchema,
  EntrySearchAllSchema,
  EntryUpdateCarrierSchema,
  EntryUpdateGeneralFieldSchema,
  EntryUpdateMainSchema,
  EntryUpdateNotesSchema,
  EntryUpdateSupplierSchema,
  EntryUpdateTaxRatesSchema,
} from "./validation/entry-schemas";

const logger = createLogger("EntryServiceApi");

export class EntryServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  async findAllEntries(
    params: Partial<EntryFindAllRequest> = {},
  ): Promise<EntryFindAllResponse> {
    try {
      const validatedParams = EntryFindAllSchema.partial().parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_search: validatedParams.pe_search ?? "",
        pe_flag_operation_list: validatedParams.pe_flag_operation_list ?? 0,
        pe_start_date: validatedParams.pe_start_date ?? null,
        pe_end_date: validatedParams.pe_end_date ?? null,
        pe_qt_records: validatedParams.pe_qt_records ?? 100,
        pe_page_id: validatedParams.pe_page_id ?? 0,
        pe_column_id: validatedParams.pe_column_id,
        pe_order_id: validatedParams.pe_order_id,
      });

      const response = await this.post<EntryFindAllResponse>(
        ENTRY_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return this.normalizeEmptyEntryFindAllResponse(response);
    } catch (error) {
      logger.error("Erro ao listar entradas", error);
      throw error;
    }
  }

  async findEntryById(
    params: EntryFindByIdRequest,
  ): Promise<EntryFindByIdResponse> {
    try {
      const validatedParams = EntryFindByIdSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryFindByIdResponse>(
        ENTRY_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (
        response.statusCode === API_STATUS_CODES.NOT_FOUND ||
        response.statusCode === API_STATUS_CODES.UNPROCESSABLE
      ) {
        throw new EntryNotFoundError({
          pe_entry_id: validatedParams.pe_entry_id,
        });
      }

      if (isApiError(response.statusCode)) {
        throw new EntryError(
          response.message || "Erro ao buscar entrada por ID",
          "ENTRY_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro ao buscar entrada por ID", error);
      throw error;
    }
  }

  async searchEntries(
    params: Partial<EntrySearchAllRequest> = {},
  ): Promise<EntrySearchAllResponse> {
    try {
      const validatedParams = EntrySearchAllSchema.partial().parse(params);
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

      const response = await this.post<EntrySearchAllResponse>(
        ENTRY_ENDPOINTS.FIND_SEARCH,
        requestBody,
      );

      return this.normalizeEmptyEntrySearchAllResponse(response);
    } catch (error) {
      logger.error("Erro ao pesquisar entradas", error);
      throw error;
    }
  }

  async createEntry(
    params: EntryCreateRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryCreateSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.CREATE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao criar entrada", error);
      throw error;
    }
  }

  async deleteEntry(
    params: EntryDeleteRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryDeleteSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.DELETE,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao excluir entrada", error);
      throw error;
    }
  }

  async processEntryInventory(
    params: EntryProcessInventoryRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryProcessInventorySchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.PROCESS_INVENTORY,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao processar estoque e inventário da entrada", error);
      throw error;
    }
  }

  async updateEntryCarrier(
    params: EntryUpdateCarrierRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateCarrierSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_CARRIER_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar transportadora da entrada", error);
      throw error;
    }
  }

  async updateEntryGeneralField(
    params: EntryUpdateGeneralFieldRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateGeneralFieldSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_GENERAL_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error(
        "Erro ao atualizar campo genérico do item de entrada",
        error,
      );
      throw error;
    }
  }

  async updateEntryMain(
    params: EntryUpdateMainRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateMainSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_MAIN,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar dados principais da entrada", error);
      throw error;
    }
  }

  async updateEntryNotes(
    params: EntryUpdateNotesRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateNotesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_NOTES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar anotações da entrada", error);
      throw error;
    }
  }

  async updateEntrySupplier(
    params: EntryUpdateSupplierRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateSupplierSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_SUPPLIER_ID,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar fornecedor da entrada", error);
      throw error;
    }
  }

  async updateEntryTaxRates(
    params: EntryUpdateTaxRatesRequest,
  ): Promise<EntryMutationResponse> {
    try {
      const validatedParams = EntryUpdateTaxRatesSchema.parse(params);
      const requestBody = this.buildBasePayload(validatedParams);

      const response = await this.post<EntryMutationResponse>(
        ENTRY_ENDPOINTS.UPD_TAX_RATES,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar valores tributários da entrada", error);
      throw error;
    }
  }

  private checkStoredProcedureError(response: EntryMutationResponse): void {
    const spResponse = response.data?.[0];
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new EntryError(
        spResponse.sp_message || "Erro na operação de entrada",
        "ENTRY_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  private normalizeEmptyEntryFindAllResponse(
    response: EntryFindAllResponse,
  ): EntryFindAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entryFindAll: [],
        },
      };
    }
    return response;
  }

  private normalizeEmptyEntrySearchAllResponse(
    response: EntrySearchAllResponse,
  ): EntrySearchAllResponse {
    if (
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          entrySearch: [],
        },
      };
    }
    return response;
  }

  extractEntries(response: EntryFindAllResponse): EntryListItem[] {
    return response.data?.entryFindAll ?? [];
  }

  extractSearchEntries(response: EntrySearchAllResponse): EntrySearchItem[] {
    return response.data?.entrySearch ?? [];
  }

  extractEntryDetail(response: EntryFindByIdResponse): EntryDetail | null {
    return response.data?.entryData?.[0] ?? null;
  }

  extractEntrySummary(response: EntryFindByIdResponse): EntrySummary | null {
    return response.data?.entrySummary?.[0] ?? null;
  }

  extractStoredProcedureResult(
    response: EntryMutationResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0] ?? null;
  }

  isValidEntryList(response: EntryFindAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.entryFindAll)
    );
  }

  isValidEntrySearchList(response: EntrySearchAllResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.entrySearch)
    );
  }

  isValidEntryDetail(response: EntryFindByIdResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      Array.isArray(response.data?.entryData) &&
      response.data.entryData.length > 0
    );
  }
}

export const entryServiceApi = new EntryServiceApi();
