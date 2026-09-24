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

const updateGeneralFieldSchema = z.discriminatedUnion("field", [
  z.object({
    configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    field: z.literal("APP_NAME"),
    value: z.string().trim().min(1).max(255),
  }),
  z.object({
    configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    field: z.literal("DOMINIO"),
    value: z.string().trim().min(1).max(255),
  }),
  z.object({
    configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    field: z.enum(["FLAG_MAINTENANCE", "IS_ACTIVE"]),
    value: z.union([z.literal(0), z.literal(1)]),
  }),
]);

const updateNotesSchema = z.object({
  configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  notes: z.string().max(2000),
});

const updateSettingsSchema = z.object({
  configId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  field: z.enum(SETTINGS_FIELDS),
  value: z.record(z.string(), z.json()),
});

type SettingsActionResult =
  | { success: true; message: string; value: JsonObject }
  | { success: false; message: string };

type SettingsScalarActionResult =
  | { success: true; message: string; value: string | number }
  | { success: false; message: string };

async function getAuthorizedConfig(configId: number) {
  const { apiContext } = await getAuthContext();
  if (!hasValidSystemClientId(apiContext)) return null;

  const config = await getSettingsConfig(apiContext, configId);
  return { apiContext, config };
}

function revalidateSettings(configId: number): void {
  revalidatePath(SETTINGS_PATH);
  revalidatePath(`${SETTINGS_PATH}/${configId}`);
}

export async function updateSettingsGeneralFieldAction(
  input: unknown,
): Promise<SettingsScalarActionResult> {
  const parsed = updateGeneralFieldSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Revise o valor antes de salvar." };
  }

  try {
    const authorized = await getAuthorizedConfig(parsed.data.configId);
    if (!authorized) {
      return {
        success: false,
        message: "Configuração não encontrada ou inacessível.",
      };
    }

    const { apiContext, config } = authorized;
    const isStringField =
      parsed.data.field === "APP_NAME" || parsed.data.field === "DOMINIO";

    await appConfigServiceApi.updateAppConfigGeneralField({
      ...apiContext,
      pe_register_id: config.ID,
      pe_field_type: isStringField ? 1 : 2,
      pe_field: parsed.data.field,
      ...(isStringField
        ? { pe_value_str: String(parsed.data.value) }
        : { pe_value_int: Number(parsed.data.value) }),
    });

    revalidateSettings(config.ID);
    return {
      success: true,
      message: "Campo atualizado com sucesso.",
      value: parsed.data.value,
    };
  } catch (error) {
    logger.error("Failed to update application configuration field", error);
    return {
      success: false,
      message: "Não foi possível atualizar o campo. Tente novamente.",
    };
  }
}

export async function updateSettingsNotesAction(
  input: unknown,
): Promise<SettingsScalarActionResult> {
  const parsed = updateNotesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "As anotações devem ter no máximo 2.000 caracteres.",
    };
  }

  try {
    const authorized = await getAuthorizedConfig(parsed.data.configId);
    if (!authorized) {
      return {
        success: false,
        message: "Configuração não encontrada ou inacessível.",
      };
    }

    const { apiContext, config } = authorized;
    await appConfigServiceApi.updateAppConfigGeneralField({
      ...apiContext,
      pe_register_id: config.ID,
      pe_field_type: 1,
      pe_field: "NOTES",
      pe_value_str: parsed.data.notes,
    });

    revalidateSettings(config.ID);
    return {
      success: true,
      message: "Anotações salvas com sucesso.",
      value: parsed.data.notes,
    };
  } catch (error) {
    logger.error("Failed to update application configuration notes", error);
    return {
      success: false,
      message: "Não foi possível salvar as anotações. Tente novamente.",
    };
  }
}

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

    revalidateSettings(config.ID);
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
