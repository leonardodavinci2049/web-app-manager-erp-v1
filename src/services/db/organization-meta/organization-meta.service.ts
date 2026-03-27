import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/database/dbConnection";
import type { OrganizationMeta } from "@/database/schema";
import {
  AuthValidationError,
  type ModifyResponse,
  type ServiceResponse,
} from "@/database/shared/auth/auth.types";

const ORGANIZATION_META_TABLE = "organizationmeta";

interface OrganizationMetaEntity extends RowDataPacket {
  organizationId: string;
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

function mapOrganizationMetaEntityToDto(
  entity: OrganizationMetaEntity,
): OrganizationMeta {
  return {
    organizationId: entity.organizationId,
    metaKey: entity.metaKey,
    metaValue: entity.metaValue,
  };
}

function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[OrganizationMetaService] Erro em ${operation}:`, error);

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
  console.error(`[OrganizationMetaService] Erro em ${operation}:`, error);

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

async function findOrganizationMetaByOrganizationId(params: {
  organizationId: string;
}): Promise<ServiceResponse<OrganizationMeta[]>> {
  try {
    const organizationId = validateId(params.organizationId, "organizationId");

    const query = `
      SELECT organizationId, metaKey, metaValue
      FROM ${ORGANIZATION_META_TABLE}
      WHERE organizationId = ?
      ORDER BY metaKey ASC
    `;

    const results = await dbService.selectExecute<OrganizationMetaEntity>(
      query,
      [organizationId],
    );

    return {
      success: true,
      data: results.map(mapOrganizationMetaEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<OrganizationMeta[]>(
      error,
      "findOrganizationMetaByOrganizationId",
    );
  }
}

async function findOrganizationMetaByKey(params: {
  organizationId: string;
  metaKey: string;
}): Promise<ServiceResponse<OrganizationMeta>> {
  try {
    const organizationId = validateId(params.organizationId, "organizationId");
    const metaKey = validateMetaKey(params.metaKey);

    const query = `
      SELECT organizationId, metaKey, metaValue
      FROM ${ORGANIZATION_META_TABLE}
      WHERE organizationId = ? AND metaKey = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationMetaEntity>(
      query,
      [organizationId, metaKey],
    );

    if (results.length === 0) {
      return { success: true, data: null, error: null };
    }

    return {
      success: true,
      data: mapOrganizationMetaEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<OrganizationMeta>(error, "findOrganizationMetaByKey");
  }
}

async function createOrganizationMeta(params: {
  organizationId: string;
  metaKey: string;
  metaValue?: string | null;
}): Promise<ModifyResponse> {
  try {
    const organizationId = validateId(params.organizationId, "organizationId");
    const metaKey = validateMetaKey(params.metaKey);
    const metaValue = validateMetaValue(params.metaValue);

    const query = `
      INSERT INTO ${ORGANIZATION_META_TABLE} (organizationId, metaKey, metaValue)
      VALUES (?, ?, ?)
    `;

    const result = await dbService.modifyExecute(query, [
      organizationId,
      metaKey,
      metaValue,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error: result.affectedRows === 0 ? "Metadado não criado" : null,
    };
  } catch (error) {
    return handleModifyError(error, "createOrganizationMeta");
  }
}

async function updateOrganizationMeta(params: {
  organizationId: string;
  metaKey: string;
  metaValue?: string | null;
}): Promise<ModifyResponse> {
  try {
    const organizationId = validateId(params.organizationId, "organizationId");
    const metaKey = validateMetaKey(params.metaKey);
    const metaValue = validateMetaValue(params.metaValue);

    const query = `
      UPDATE ${ORGANIZATION_META_TABLE}
      SET metaValue = ?
      WHERE organizationId = ? AND metaKey = ?
    `;

    const result = await dbService.modifyExecute(query, [
      metaValue,
      organizationId,
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
    return handleModifyError(error, "updateOrganizationMeta");
  }
}

async function deleteOrganizationMeta(params: {
  organizationId: string;
  metaKey: string;
}): Promise<ModifyResponse> {
  try {
    const organizationId = validateId(params.organizationId, "organizationId");
    const metaKey = validateMetaKey(params.metaKey);

    const query = `
      DELETE FROM ${ORGANIZATION_META_TABLE}
      WHERE organizationId = ? AND metaKey = ?
    `;

    const result = await dbService.modifyExecute(query, [
      organizationId,
      metaKey,
    ]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Metadado não encontrado para exclusão"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteOrganizationMeta");
  }
}

export const OrganizationMetaService = {
  findOrganizationMetaByOrganizationId,
  findOrganizationMetaByKey,
  createOrganizationMeta,
  updateOrganizationMeta,
  deleteOrganizationMeta,
} as const;

export default OrganizationMetaService;

export type { ModifyResponse, OrganizationMeta, ServiceResponse };
