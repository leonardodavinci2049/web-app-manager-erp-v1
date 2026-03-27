export interface LogOperationFindAllDto {
  PE_ORGANIZATION_ID?: string;
  PE_USER_ID?: string;
  PE_SEARCH_USER?: string;
  PE_LIMIT?: number;
}

/**
 * Valida o DTO para selecionar todos os logs de operação
 */
export function validateLogOperationFindAllDto(
  data: unknown,
): LogOperationFindAllDto {
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new Error("Dados inválidos fornecidos");
  }

  const dto = (data as Record<string, unknown>) || {};

  // Validação de campos numéricos (INT)
  if (dto.PE_LIMIT !== undefined && dto.PE_LIMIT !== null) {
    if (typeof dto.PE_LIMIT !== "number") {
      throw new Error("PE_LIMIT deve ser um número");
    }
  }

  // Campos opcionais de string
  if (dto.PE_ORGANIZATION_ID !== undefined && dto.PE_ORGANIZATION_ID !== null) {
    if (typeof dto.PE_ORGANIZATION_ID !== "string") {
      throw new Error("PE_ORGANIZATION_ID deve ser uma string");
    }
    if (dto.PE_ORGANIZATION_ID.length > 191) {
      throw new Error("PE_ORGANIZATION_ID não pode exceder 191 caracteres");
    }
  }

  if (dto.PE_USER_ID !== undefined && dto.PE_USER_ID !== null) {
    if (typeof dto.PE_USER_ID !== "string") {
      throw new Error("PE_USER_ID deve ser uma string");
    }
    if (dto.PE_USER_ID.length > 191) {
      throw new Error("PE_USER_ID não pode exceder 191 caracteres");
    }
  }

  if (dto.PE_SEARCH_USER !== undefined && dto.PE_SEARCH_USER !== null) {
    if (typeof dto.PE_SEARCH_USER !== "string") {
      throw new Error("PE_SEARCH_USER deve ser uma string");
    }
    if (dto.PE_SEARCH_USER.length > 191) {
      throw new Error("PE_SEARCH_USER não pode exceder 191 caracteres");
    }
  }

  return {
    PE_ORGANIZATION_ID:
      typeof dto.PE_ORGANIZATION_ID === "string"
        ? dto.PE_ORGANIZATION_ID.trim()
        : undefined,
    PE_USER_ID:
      typeof dto.PE_USER_ID === "string" ? dto.PE_USER_ID.trim() : undefined,
    PE_SEARCH_USER:
      typeof dto.PE_SEARCH_USER === "string"
        ? dto.PE_SEARCH_USER.trim()
        : undefined,
    PE_LIMIT:
      dto.PE_LIMIT !== undefined && dto.PE_LIMIT !== null
        ? Number(dto.PE_LIMIT)
        : undefined,
  };
}
