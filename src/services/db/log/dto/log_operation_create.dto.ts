export interface LogOperationCreateDto {
  PE_ORGANIZATION_ID: string;
  PE_USER_ID: string;
  PE_MODULE_ID: number;
  PE_RECORD_ID: number;
  PE_LOG: string;
  PE_NOTE: string;
}

/**
 * Valida o DTO para criar log de operação
 */
export function validateLogOperationCreateDto(
  data: unknown,
): LogOperationCreateDto {
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new Error("Dados inválidos fornecidos");
  }

  const dto = (data as Record<string, unknown>) || {};

  // Validação de PE_ORGANIZATION_ID obrigatório
  if (!dto.PE_ORGANIZATION_ID || typeof dto.PE_ORGANIZATION_ID !== "string") {
    throw new Error("PE_ORGANIZATION_ID é obrigatório e deve ser uma string");
  }
  if (dto.PE_ORGANIZATION_ID.length > 200) {
    throw new Error("PE_ORGANIZATION_ID não pode exceder 200 caracteres");
  }

  // Validação de PE_USER_ID obrigatório
  if (!dto.PE_USER_ID || typeof dto.PE_USER_ID !== "string") {
    throw new Error("PE_USER_ID é obrigatório e deve ser uma string");
  }
  if (dto.PE_USER_ID.length > 200) {
    throw new Error("PE_USER_ID não pode exceder 200 caracteres");
  }

  // Validação de campos numéricos (INT) obrigatórios
  if (
    dto.PE_MODULE_ID === undefined ||
    dto.PE_MODULE_ID === null ||
    typeof dto.PE_MODULE_ID !== "number"
  ) {
    throw new Error("PE_MODULE_ID é obrigatório e deve ser um número");
  }

  if (
    dto.PE_RECORD_ID === undefined ||
    dto.PE_RECORD_ID === null ||
    typeof dto.PE_RECORD_ID !== "number"
  ) {
    throw new Error("PE_RECORD_ID é obrigatório e deve ser um número");
  }

  // Validação de PE_LOG obrigatório
  if (!dto.PE_LOG || typeof dto.PE_LOG !== "string") {
    throw new Error("PE_LOG é obrigatório e deve ser uma string");
  }
  if (dto.PE_LOG.length > 500) {
    throw new Error("PE_LOG não pode exceder 500 caracteres");
  }

  // Validação de PE_NOTE obrigatório
  if (!dto.PE_NOTE || typeof dto.PE_NOTE !== "string") {
    throw new Error("PE_NOTE é obrigatório e deve ser uma string");
  }
  if (dto.PE_NOTE.length > 999) {
    throw new Error("PE_NOTE não pode exceder 999 caracteres");
  }

  return {
    PE_ORGANIZATION_ID: String(dto.PE_ORGANIZATION_ID).trim(),
    PE_USER_ID: String(dto.PE_USER_ID).trim(),
    PE_MODULE_ID: Number(dto.PE_MODULE_ID),
    PE_RECORD_ID: Number(dto.PE_RECORD_ID),
    PE_LOG: String(dto.PE_LOG).trim(),
    PE_NOTE: String(dto.PE_NOTE).trim(),
  };
}
