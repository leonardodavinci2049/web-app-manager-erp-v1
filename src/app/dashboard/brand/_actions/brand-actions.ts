"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { BrandActionResult } from "../_components/types/brand-dashboard-types";

const logger = createLogger("BrandDashboardActions");
const BRAND_PATH = "/dashboard/brand";

const createSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca.").max(100),
});

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): BrandActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

/** Cria uma marca pela página de listagem e devolve o novo ID. */
export async function createBrandAction(input: {
  name: string;
}): Promise<BrandActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const { apiContext } = await getAuthContext();
    const response = await brandServiceApi.createBrand({
      pe_brand: parsed.data.name,
      ...apiContext,
    });
    const result = brandServiceApi.extractStoredProcedureResult(response);
    const brandId = result?.sp_return_id || response.recordId;

    if (!brandId || brandId <= 0) {
      return safeFailure(
        "Não foi possível confirmar a criação da marca. Tente novamente.",
      );
    }

    revalidatePath(BRAND_PATH);
    return { success: true, message: "Marca criada com sucesso.", brandId };
  } catch (error) {
    return safeFailure("Não foi possível criar a marca.", error);
  }
}
