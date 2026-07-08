"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("createBrandAction");

export async function createBrandAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { apiContext } = await getAuthContext();

    const brandName = (formData.get("brand") as string) || "";
    const imagePath = formData.get("image_path") as string;
    const notes = formData.get("notes") as string;

    const rawData = {
      pe_brand: brandName,
      pe_image_path: imagePath || "",
      pe_notes: notes || "",
      ...apiContext,
    };

    const response = await brandServiceApi.createBrand(rawData);
    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao criar marca",
      };
    }

    return {
      success: true,
      message: "Marca criada com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao criar marca:", error);
    return {
      success: false,
      message: "Erro ao criar marca. Tente novamente.",
    };
  }
}
