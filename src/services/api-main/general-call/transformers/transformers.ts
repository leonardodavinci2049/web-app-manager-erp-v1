import type { GeneralTableUpdInlFieldResponse } from "../types/general-call-types";

/**
 * DTO de resultado para consumo direto na aplicação (UI/Server Action).
 */
export interface UIGeneralCallResult {
  success: boolean;
  recordId: number;
  message: string;
}

/**
 * Converte a resposta da API (envelope + stored procedure) em um DTO limpo.
 */
export function transformGeneralCallResult(
  response: GeneralTableUpdInlFieldResponse,
): UIGeneralCallResult {
  const spResponse = response.data?.[0];
  const errorId = spResponse?.sp_error_id ?? response.errorId;

  return {
    success: errorId === 0,
    recordId: spResponse?.sp_return_id ?? response.recordId,
    message: spResponse?.sp_message ?? response.message,
  };
}
