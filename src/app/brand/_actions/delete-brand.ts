"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("deleteBrandAction");

export async function deleteBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const brandId = formData.get("brand_id");
    if (!brandId) {
      return {
        success: false,
        message: "ID da marca não fornecido.",
      };
    }

    const response = await brandServiceApi.deleteBrand({
      pe_brand_id: Number(brandId),
      ...apiContext,
    });

    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao deletar marca",
      };
    }

    return {
      success: true,
      message: "Marca removida com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao deletar marca:", error);
    return {
      success: false,
      message: "Erro ao deletar marca. Tente novamente.",
    };
  }
}
