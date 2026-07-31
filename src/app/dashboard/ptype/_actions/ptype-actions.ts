"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { PtypeError, ptypeServiceApi } from "@/services/api-main/ptype";
import type { PtypeActionResult } from "../_components/types/ptype-dashboard-types";

const logger = createLogger("PtypeDashboardActions");
const PTYPE_PATH = "/dashboard/ptype";

const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do tipo.").max(100),
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

/** Cria um tipo de produto pela página de listagem e devolve o novo ID. */
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
