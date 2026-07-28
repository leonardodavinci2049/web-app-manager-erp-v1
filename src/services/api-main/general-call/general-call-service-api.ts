import "server-only";

import { serverEnvs } from "@/core/config/envs.server";
import { GENERAL_CALL_ENDPOINTS } from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";
import {
  transformGeneralCallResult,
  type UIGeneralCallResult,
} from "./transformers/transformers";
import type {
  GeneralTableUpdInlFieldRequest,
  GeneralTableUpdInlFieldResponse,
  StoredProcedureResponse,
} from "./types/general-call-types";
import { GeneralCallError } from "./types/general-call-types";
import { GeneralTableUpdInlFieldSchema } from "./validation/general-call-schemas";

const logger = createLogger("GeneralCallServiceApi");

export class GeneralCallServiceApi extends BaseApiService {
  private buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: serverEnvs.APP_ID,
      pe_store_id: serverEnvs.STORE_ID,
      ...additionalData,
    };
  }

  /**
   * Atualiza dinamicamente um único campo de um único registro em uma tabela.
   *
   * O valor deve ser informado no parâmetro correspondente ao `pe_field_type`;
   * os demais parâmetros de valor são enviados como `null`.
   */
  async updateTableInlineField(
    params: GeneralTableUpdInlFieldRequest,
  ): Promise<GeneralTableUpdInlFieldResponse> {
    try {
      const validatedParams = GeneralTableUpdInlFieldSchema.parse(params);
      const requestBody = this.buildBasePayload({
        pe_system_client_id: validatedParams.pe_system_client_id,
        pe_organization_id: validatedParams.pe_organization_id,
        pe_user_id: validatedParams.pe_user_id,
        pe_user_name: validatedParams.pe_user_name,
        pe_user_role: validatedParams.pe_user_role,
        pe_person_id: validatedParams.pe_person_id,
        pe_table_name: validatedParams.pe_table_name,
        pe_primary_key_field: validatedParams.pe_primary_key_field,
        pe_register_id: validatedParams.pe_register_id,
        pe_field_type: validatedParams.pe_field_type,
        pe_field: validatedParams.pe_field,
        pe_value_str: validatedParams.pe_value_str ?? null,
        pe_value_int: validatedParams.pe_value_int ?? null,
        pe_value_numeric: validatedParams.pe_value_numeric ?? null,
        pe_value_date: validatedParams.pe_value_date ?? null,
      });

      const response = await this.post<GeneralTableUpdInlFieldResponse>(
        GENERAL_CALL_ENDPOINTS.UPDATE_TABLE_INL_FIELD,
        requestBody,
      );

      this.checkStoredProcedureError(response);
      return response;
    } catch (error) {
      logger.error("Erro ao atualizar campo inline de tabela", error);
      throw error;
    }
  }

  private checkStoredProcedureError(
    response: GeneralTableUpdInlFieldResponse,
  ): void {
    const spResponse = response.data?.[0] as
      | StoredProcedureResponse
      | undefined;
    if (spResponse && spResponse.sp_error_id !== 0) {
      throw new GeneralCallError(
        spResponse.sp_message || "Erro na operação de atualização inline",
        "GENERAL_CALL_OPERATION_ERROR",
        spResponse.sp_error_id,
      );
    }
  }

  extractStoredProcedureResult(
    response: GeneralTableUpdInlFieldResponse,
  ): StoredProcedureResponse | null {
    return (response.data?.[0] as StoredProcedureResponse) ?? null;
  }
}

export const generalCallServiceApi = new GeneralCallServiceApi();

/**
 * Atualiza um campo inline de tabela e retorna um DTO pronto para consumo
 * na aplicação (Server Actions / Server Components).
 */
export async function updateTableInlineField(
  params: GeneralTableUpdInlFieldRequest,
): Promise<UIGeneralCallResult> {
  const response = await generalCallServiceApi.updateTableInlineField(params);
  return transformGeneralCallResult(response);
}
