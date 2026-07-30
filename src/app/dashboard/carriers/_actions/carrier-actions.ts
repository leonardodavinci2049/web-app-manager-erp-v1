"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CarrierError,
  CarrierNotFoundError,
  carrierServiceApi,
  getCarrierById,
} from "@/services/api-main/carrier";
import type {
  CarrierActionResult,
  CarrierFormValues,
} from "../_components/types/carrier-dashboard-types";

const logger = createLogger("CarrierDashboardActions");
const CARRIER_PATH = "/dashboard/carriers";
const carrierIdSchema = z.number().int().positive();
const formSchema = z.object({
  typePersonId: z.number().int().min(0),
  name: z.string().trim().min(1, "Informe o nome da transportadora.").max(300),
  phone: z.string().trim().max(100),
  whatsapp: z.string().trim().max(100),
  email: z
    .string()
    .trim()
    .max(100)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Informe um e-mail válido.",
    ),
  website: z.string().trim().max(300),
  cnpj: z.string().trim().max(100),
  companyName: z.string().trim().max(300),
  responsibleName: z.string().trim().max(300),
  cpf: z.string().trim().max(100),
  imagePath: z.string().trim().max(300),
  notes: z.string().trim().max(2000),
});
const updateSchema = formSchema.extend({ carrierId: carrierIdSchema });

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): CarrierActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function safeOperationMessage(error: unknown, fallback: string): string {
  if (
    error instanceof CarrierError &&
    error.code === "CARRIER_OPERATION_ERROR"
  ) {
    const message = error.message.trim().slice(0, 300);
    if (message) return message;
  }
  return fallback;
}

async function getExistingCarrier(
  carrierId: number,
): Promise<
  | { apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"] }
  | CarrierActionResult
> {
  const { apiContext } = await getAuthContext();
  try {
    const carrier = await getCarrierById(carrierId, apiContext);
    if (!carrier) return safeFailure("Transportadora não encontrada.");
    return { apiContext };
  } catch (error) {
    if (error instanceof CarrierNotFoundError)
      return safeFailure("Transportadora não encontrada.");
    throw error;
  }
}

function revalidateCarrier(carrierId?: number): void {
  revalidatePath(CARRIER_PATH);
  if (carrierId) revalidatePath(`${CARRIER_PATH}/${carrierId}`);
}

function toPayload(values: CarrierFormValues) {
  return {
    pe_type_person_id:
      values.typePersonId > 0 ? values.typePersonId : undefined,
    pe_phone: values.phone,
    pe_whatsapp: values.whatsapp,
    pe_email: values.email,
    pe_website: values.website,
    pe_cnpj: values.cnpj,
    pe_company_name: values.companyName,
    pe_responsible_name: values.responsibleName,
    pe_cpf: values.cpf,
    pe_image_path: values.imagePath,
  };
}

export async function createCarrierAction(
  input: CarrierFormValues,
): Promise<CarrierActionResult> {
  const parsed = formSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos informados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const { apiContext } = await getAuthContext();
    const response = await carrierServiceApi.createCarrier({
      pe_name: parsed.data.name,
      ...toPayload(parsed.data),
      ...apiContext,
    });
    const operation = carrierServiceApi.extractStoredProcedureResult(response);
    const carrierId = operation?.sp_return_id || response.recordId;
    if (!carrierId || carrierId <= 0) {
      return safeFailure(
        "Não foi possível confirmar a criação da transportadora.",
      );
    }

    let message = "Transportadora criada com sucesso.";
    if (parsed.data.notes) {
      try {
        await carrierServiceApi.updateCarrier({
          pe_carrier_id: carrierId,
          pe_notes: parsed.data.notes,
          ...apiContext,
        });
      } catch (error) {
        logger.error(
          "Transportadora criada, mas não foi possível salvar observações",
          error,
        );
        message =
          "Transportadora criada, mas as observações não foram salvas. Revise o cadastro.";
      }
    }

    revalidateCarrier(carrierId);
    return { success: true, message, carrierId };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível criar a transportadora."),
      error,
    );
  }
}

export async function updateCarrierAction(
  input: CarrierFormValues & { carrierId: number },
): Promise<CarrierActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      "Revise os campos destacados.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  try {
    const context = await getExistingCarrier(parsed.data.carrierId);
    if ("success" in context) return context;

    await carrierServiceApi.updateCarrier({
      pe_carrier_id: parsed.data.carrierId,
      pe_carrier_name: parsed.data.name,
      ...toPayload(parsed.data),
      pe_notes: parsed.data.notes || undefined,
      ...context.apiContext,
    });

    revalidateCarrier(parsed.data.carrierId);
    return { success: true, message: "Transportadora atualizada com sucesso." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar a transportadora.",
      ),
      error,
    );
  }
}

export async function deleteCarrierAction(
  carrierId: number,
): Promise<CarrierActionResult> {
  if (!carrierIdSchema.safeParse(carrierId).success)
    return safeFailure("Transportadora inválida.");

  try {
    const context = await getExistingCarrier(carrierId);
    if ("success" in context) return context;
    await carrierServiceApi.deleteCarrier({
      pe_carrier_id: carrierId,
      ...context.apiContext,
    });
    revalidateCarrier(carrierId);
    return { success: true, message: "Transportadora excluída com sucesso." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível excluir a transportadora."),
      error,
    );
  }
}
