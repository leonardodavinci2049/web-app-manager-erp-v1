"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { brandServiceApi } from "@/services/api-main/brand";
import type { ActionState } from "@/types/action-types";

const logger = createLogger("updateBrandAction");

export async function updateBrandAction(
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

    const brand = formData.get("brand") as string;
    const imagePath = formData.get("image_path") as string;
    const notes = formData.get("notes") as string;

    const rawData = {
      pe_brand_id: Number(brandId),
      pe_brand: brand || "",
      pe_inactive: formData.get("inactive")
        ? Number(formData.get("inactive"))
        : 0,
      pe_image_path: imagePath || "",
      pe_notes: notes || "",
      ...apiContext,
    };

    const response = await brandServiceApi.updateBrand(rawData);
    const result = brandServiceApi.extractStoredProcedureResult(response);

    if (result?.sp_error_id !== 0) {
      return {
        success: false,
        message: result?.sp_message || "Erro ao atualizar marca",
      };
    }

    return {
      success: true,
      message: "Marca atualizada com sucesso!",
    };
  } catch (error) {
    logger.error("Erro ao atualizar marca:", error);
    return {
      success: false,
      message: "Erro ao atualizar marca. Tente novamente.",
    };
  }
}
