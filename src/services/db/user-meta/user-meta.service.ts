import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";
import type { UserMeta } from "@/database/schema";
import {
  AuthValidationError,
  type ModifyResponse,
  type ServiceResponse,
} from "@/database/shared/auth/auth.types";

const USER_META_TABLE = "usermeta";

interface UserMetaEntity extends RowDataPacket {
  userId: string;
  metaKey: string;
  metaValue: string | null;
}

const IdSchema = z
  .string()
  .trim()
  .min(1, "ID é obrigatório")
  .max(128, "ID muito longo");

const MetaKeySchema = z
  .string()
  .trim()
  .min(1, "Chave é obrigatória")
  .max(191, "Chave muito longa");

const MetaValueSchema = z
  .string()
  .max(65535, "Valor muito longo")
  .nullable()
  .optional();

function validateId(id: string, fieldName: string): string {
  const result = IdSchema.safeParse(id);

  if (!result.success) {
    throw new AuthValidationError(
      `${fieldName}: ${result.error.issues[0].message}`,
      fieldName,
    );
  }

  return result.data;
}

function validateMetaKey(metaKey: string): string {
  const result = MetaKeySchema.safeParse(metaKey);

  if (!result.success) {
    throw new AuthValidationError(
      `metaKey: ${result.error.issues[0].message}`,
      "metaKey",
    );
  }

  return result.data;
}

function validateMetaValue(metaValue?: string | null): string | null {
  const normalizedValue = metaValue ?? null;
  const result = MetaValueSchema.safeParse(normalizedValue);

  if (!result.success) {
    throw new AuthValidationError(
      `metaValue: ${result.error.issues[0].message}`,
      "metaValue",
    );
  }

  return result.data ?? null;
}

function mapUserMetaEntityToDto(entity: UserMetaEntity): UserMeta {
  return {
    userId: entity.userId,
    metaKey: entity.metaKey,
    metaValue: entity.metaValue,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[UserMetaService] Erro em ${operation}:`, error);

  if (error instanceof AuthValidationError) {
    return { success: false, data: null, error: error.message };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      data: null,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    return {
      success: false,
      data: null,
      error: "Erro ao processar a consulta no banco de dados",
    };
  }

  return {
    success: false,
    data: null,
    error: "Ocorreu um erro interno inesperado",
  };
}

function handleModifyError(error: unknown, operation: string): ModifyResponse {
  console.error(`[UserMetaService] Erro em ${operation}:`, error);

  if (error instanceof AuthValidationError) {
    return { success: false, affectedRows: 0, error: error.message };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      affectedRows: 0,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao processar a consulta no banco de dados",
    };
  }

  return {
    success: false,
    affectedRows: 0,
    error: "Erro ao realizar operação de modificação",
  };
}

async function findUserMetaByUserId(params: {
  userId: string;
}): Promise<ServiceResponse<UserMeta[]>> {
  try {
    const userId = validateId(params.userId, "userId");

    const query = `
      SELECT userId, metaKey, metaValue
      FROM ${USER_META_TABLE}
      WHERE userId = ?
      ORDER BY metaKey ASC
    `;

    const results = await dbService.selectExecute<UserMetaEntity>(query, [
      userId,
    ]);

    return {
      success: true,
      data: results.map(mapUserMetaEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<UserMeta[]>(error, "findUserMetaByUserId");
  }
}

async function findUserMetaByKey(params: {
  userId: string;
  metaKey: string;
}): Promise<ServiceResponse<UserMeta>> {
  try {
    const userId = validateId(params.userId, "userId");
    const metaKey = validateMetaKey(params.metaKey);

    const query = `
      SELECT userId, metaKey, metaValue
      FROM ${USER_META_TABLE}
      WHERE userId = ? AND metaKey = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<UserMetaEntity>(query, [
      userId,
      metaKey,
    ]);

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return {
      success: true,
      data: mapUserMetaEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<UserMeta>(error, "findUserMetaByKey");
  }
}

async function createUserMeta(params: {
  userId: string;
  metaKey: string;
  metaValue?: string | null;
}): Promise<ModifyResponse> {
  try {
    const userId = validateId(params.userId, "userId");
    const metaKey = validateMetaKey(params.metaKey);
    const metaValue = validateMetaValue(params.metaValue);

    const query = `
      INSERT INTO ${USER_META_TABLE} (userId, metaKey, metaValue)
      VALUES (?, ?, ?)
    `;

    const result = await dbService.modifyExecute(query, [
      userId,
      metaKey,
      metaValue,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error: result.affectedRows === 0 ? "Metadado não criado" : null,
    };
  } catch (error) {
    return handleModifyError(error, "createUserMeta");
  }
}

async function updateUserMeta(params: {
  userId: string;
  metaKey: string;
  metaValue?: string | null;
}): Promise<ModifyResponse> {
  try {
    const userId = validateId(params.userId, "userId");
    const metaKey = validateMetaKey(params.metaKey);
    const metaValue = validateMetaValue(params.metaValue);

    const query = `
      UPDATE ${USER_META_TABLE}
      SET metaValue = ?
      WHERE userId = ? AND metaKey = ?
    `;

    const result = await dbService.modifyExecute(query, [
      metaValue,
      userId,
      metaKey,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Metadado não encontrado para atualização"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "updateUserMeta");
  }
}

async function deleteUserMeta(params: {
  userId: string;
  metaKey: string;
}): Promise<ModifyResponse> {
  try {
    const userId = validateId(params.userId, "userId");
    const metaKey = validateMetaKey(params.metaKey);

    const query = `
      DELETE FROM ${USER_META_TABLE}
      WHERE userId = ? AND metaKey = ?
    `;

    const result = await dbService.modifyExecute(query, [userId, metaKey]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Metadado não encontrado para exclusão"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteUserMeta");
  }
}

export const UserMetaService = {
  findUserMetaByUserId,
  findUserMetaByKey,
  createUserMeta,
  updateUserMeta,
  deleteUserMeta,
} as const;

export default UserMetaService;

export type { ModifyResponse, ServiceResponse, UserMeta };
