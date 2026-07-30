"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  getPtypeById,
  PtypeError,
  ptypeServiceApi,
} from "@/services/api-main/ptype";
import type { PtypeActionResult } from "../_components/types/ptype-dashboard-types";

const logger = createLogger("PtypeDashboardActions");
const PTYPE_PATH = "/dashboard/ptype";

const ptypeIdSchema = z.number().int().positive();
const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do tipo.").max(100),
});
const updateSchema = z.object({
  ptypeId: ptypeIdSchema,
  name: z.string().trim().min(1, "Informe o nome do tipo.").max(100),
  notes: z.string().trim().max(2000),
});
const statusSchema = z.object({
  ptypeId: ptypeIdSchema,
  inactive: z.boolean(),
});

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): PtypeActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function getSafeOperationMessage(error: unknown, fallback: string): string {
  if (error instanceof PtypeError && error.code === "PTYPE_OPERATION_ERROR") {
    const message = error.message.trim().slice(0, 300);
    if (message) return message;
  }
  return fallback;
}

async function getExistingPtype(
  ptypeId: number,
): Promise<
  | { apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"] }
  | PtypeActionResult
> {
  const { apiContext } = await getAuthContext();
  const current = await getPtypeById(ptypeId, apiContext);
  if (!current) {
    return safeFailure("Tipo de produto não encontrado.");
  }
  return { apiContext };
}

export async function createPtypeAction(input: {
  name: string;
}): Promise<PtypeActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const slug = slugify(parsed.data.name);
  if (!slug) {
    return safeFailure("Informe um nome que possa gerar um slug válido.");
  }

  try {
    const { apiContext } = await getAuthContext();
    const response = await ptypeServiceApi.createPtype({
      pe_type: parsed.data.name,
      pe_slug: slug,
      ...apiContext,
    });
    const operation = ptypeServiceApi.extractStoredProcedureResult(response);
    const ptypeId = operation?.sp_return_id || response.recordId;

    if (!ptypeId || ptypeId <= 0) {
      return safeFailure(
        "Não foi possível confirmar a criação do tipo de produto.",
      );
    }

    revalidatePath(PTYPE_PATH);
    return {
      success: true,
      message: "Tipo de produto criado com sucesso.",
      ptypeId,
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível criar o tipo de produto.",
      ),
      error,
    );
  }
}

export async function updatePtypeAction(
  input: z.input<typeof updateSchema>,
): Promise<PtypeActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos destacados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const context = await getExistingPtype(parsed.data.ptypeId);
    if ("success" in context) return context;

    await ptypeServiceApi.updatePtype({
      pe_type_id: parsed.data.ptypeId,
      pe_type: parsed.data.name,
      pe_notes: parsed.data.notes,
      ...context.apiContext,
    });

    revalidatePath(PTYPE_PATH);
    return {
      success: true,
      message: "Tipo de produto atualizado com sucesso.",
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível atualizar o tipo de produto.",
      ),
      error,
    );
  }
}

export async function setPtypeStatusAction(
  input: z.input<typeof statusSchema>,
): Promise<PtypeActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Operação de status inválida.");

  try {
    const context = await getExistingPtype(parsed.data.ptypeId);
    if ("success" in context) return context;

    await ptypeServiceApi.updatePtype({
      pe_type_id: parsed.data.ptypeId,
      pe_inactive: parsed.data.inactive ? 1 : 0,
      ...context.apiContext,
    });

    revalidatePath(PTYPE_PATH);
    return {
      success: true,
      message: parsed.data.inactive
        ? "Tipo de produto marcado como inativo."
        : "Tipo de produto marcado como ativo.",
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível alterar o status do tipo de produto.",
      ),
      error,
    );
  }
}

export async function deletePtypeAction(
  ptypeId: number,
): Promise<PtypeActionResult> {
  if (!ptypeIdSchema.safeParse(ptypeId).success) {
    return safeFailure("Tipo de produto inválido.");
  }

  try {
    const context = await getExistingPtype(ptypeId);
    if ("success" in context) return context;

    await ptypeServiceApi.deletePtype({
      pe_type_id: ptypeId,
      ...context.apiContext,
    });

    revalidatePath(PTYPE_PATH);
    return {
      success: true,
      message: "Tipo de produto excluído com sucesso.",
    };
  } catch (error) {
    return safeFailure(
      getSafeOperationMessage(
        error,
        "Não foi possível excluir o tipo de produto.",
      ),
      error,
    );
  }
}
