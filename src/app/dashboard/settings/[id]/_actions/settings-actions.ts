"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { appConfigServiceApi } from "@/services/api-main/app-config";
import {
  getSettingsConfig,
  hasValidSystemClientId,
} from "../../_utils/settings-data";
import {
  type JsonObject,
  SETTINGS_FIELDS,
} from "../_components/settings-field-definitions";

const logger = createLogger("SettingsActions");
const SETTINGS_PATH = "/dashboard/settings";

const updateSettingsSchema = z.object({
  configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  field: z.enum(SETTINGS_FIELDS),
  value: z.record(z.string(), z.json()),
});

type SettingsActionResult =
  | { success: true; message: string; value: JsonObject }
  | { success: false; message: string };

export async function updateSettingsFieldAction(
  input: unknown,
): Promise<SettingsActionResult> {
  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Revise o objeto JSON antes de salvar." };
  }

  const { apiContext } = await getAuthContext();
  if (!hasValidSystemClientId(apiContext)) {
    return {
      success: false,
      message: "Cliente de sistema inválido. Não foi possível salvar.",
    };
  }

  try {
    const config = await getSettingsConfig(apiContext, parsed.data.configId);
    const value = JSON.stringify(parsed.data.value);

    await appConfigServiceApi.updateAppConfigGeneralField({
      ...apiContext,
      pe_register_id: config.ID,
      pe_field_type: 1,
      pe_field: parsed.data.field,
      pe_value_str: value,
    });

    revalidatePath(SETTINGS_PATH);
    revalidatePath(`${SETTINGS_PATH}/${config.ID}`);
    return {
      success: true,
      message: "Configuração salva com sucesso.",
      value: parsed.data.value,
    };
  } catch (error) {
    logger.error("Failed to update application settings", error);
    return {
      success: false,
      message: "Não foi possível salvar a configuração. Tente novamente.",
    };
  }
}
