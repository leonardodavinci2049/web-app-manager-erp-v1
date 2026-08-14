"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CustomerInlineError,
  customerInlineServiceApi,
} from "@/services/api-main/customer-inline";
import {
  CustomerUpdError,
  customerUpdServiceApi,
} from "@/services/api-main/customer-upd";
import {
  FIELD_TYPE,
  GeneralCallError,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import { getSellerById, SellerNotFoundError } from "@/services/api-main/seller";
import type { SellerActionResult } from "../_components/types/seller-detail-types";

const logger = createLogger("SellerDetailActions");
const SELLER_PATH = "/dashboard/seller";
const SELLER_TABLE_NAME = "tbl_pessoa";
const SELLER_PRIMARY_KEY_FIELD = "ID_TBL_PESSOA";
const SELLER_INACTIVE_FIELD = "INATIVO";
const SELLER_EMAIL_MARKETING_FIELD = "EMAIL_MKT";
const SELLER_FREE_SHIPPING_FIELD = "FLAG_FRETE_GRATIS";
const sellerIdSchema = z.number().int().positive();
const optionalText = (max: number) => z.string().trim().max(max);
const optionalEmail = optionalText(255).refine(
  (value) => value === "" || z.email().safeParse(value).success,
  "Informe um e-mail válido.",
);

const generalSchema = z.object({
  sellerId: sellerIdSchema,
  name: optionalText(300).min(1, "Informe o nome do vendedor."),
  email: optionalEmail,
  phone: optionalText(100),
  whatsapp: optionalText(100),
  imagePath: optionalText(500),
});
const notesSchema = z.object({
  sellerId: sellerIdSchema,
  notes: optionalText(2000),
});
const personalSchema = z.object({
  sellerId: sellerIdSchema,
  cpf: optionalText(100),
  firstName: optionalText(300),
  lastName: optionalText(100),
  imagePath: optionalText(100),
  birthDate: z
    .string()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Informe uma data válida.",
    ),
});
const businessSchema = z.object({
  sellerId: sellerIdSchema,
  cnpj: optionalText(100).min(1, "Informe o CNPJ."),
  companyName: optionalText(300).min(1, "Informe a razão social."),
  stateRegistration: optionalText(100),
  municipalRegistration: optionalText(100),
  responsibleName: optionalText(300),
  mainActivity: optionalText(300),
});
const addressSchema = z.object({
  sellerId: sellerIdSchema,
  zipCode: optionalText(100),
  address: optionalText(300),
  addressNumber: optionalText(100),
  complement: optionalText(100),
  neighborhood: optionalText(300),
  city: optionalText(300),
  state: optionalText(100),
  cityCode: optionalText(100),
  stateCode: optionalText(100),
});
const internetSchema = z.object({
  sellerId: sellerIdSchema,
  website: optionalText(500),
  facebook: optionalText(500),
  twitter: optionalText(500),
  linkedin: optionalText(500),
  instagram: optionalText(500),
  tiktok: optionalText(500),
  telegram: optionalText(500),
});
const inactiveSchema = z.object({
  sellerId: sellerIdSchema,
  inactive: z.boolean(),
});
const emailMarketingSchema = z.object({
  sellerId: sellerIdSchema,
  enabled: z.boolean(),
});
const freeShippingSchema = z.object({
  sellerId: sellerIdSchema,
  enabled: z.boolean(),
});
const personTypeSchema = z.object({
  sellerId: sellerIdSchema,
  personTypeId: z.number().int().min(1).max(2),
});

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): SellerActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function safeOperationMessage(error: unknown, fallback: string): string {
  if (
    (error instanceof CustomerUpdError &&
      error.code === "CUSTOMER_UPD_OPERATION_ERROR") ||
    (error instanceof CustomerInlineError &&
      error.code === "CUSTOMER_INLINE_OPERATION_ERROR") ||
    (error instanceof GeneralCallError &&
      error.code === "GENERAL_CALL_OPERATION_ERROR")
  ) {
    const message = error.message.trim().slice(0, 300);
    if (message) return message;
  }
  return fallback;
}

async function getExistingSeller(
  sellerId: number,
): Promise<
  | { apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"] }
  | SellerActionResult
> {
  const { apiContext } = await getAuthContext();
  try {
    const seller = await getSellerById(sellerId, apiContext);
    if (!seller?.isSeller) return safeFailure("Vendedor não encontrado.");
    return { apiContext };
  } catch (error) {
    if (error instanceof SellerNotFoundError)
      return safeFailure("Vendedor não encontrado.");
    throw error;
  }
}

function revalidateSeller(sellerId?: number): void {
  revalidatePath(SELLER_PATH);
  if (sellerId) revalidatePath(`${SELLER_PATH}/${sellerId}`);
}

export async function updateSellerGeneralAction(
  input: z.input<typeof generalSchema>,
): Promise<SellerActionResult> {
  const parsed = generalSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados gerais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateGeneral({
      pe_customer_id: parsed.data.sellerId,
      pe_name: parsed.data.name,
      pe_email: parsed.data.email,
      pe_phone: parsed.data.phone,
      pe_whatsapp: parsed.data.whatsapp,
      pe_image_path: parsed.data.imagePath,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Dados gerais atualizados." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar os dados gerais.",
      ),
      error,
    );
  }
}

export async function updateSellerNotesAction(
  input: z.input<typeof notesSchema>,
): Promise<SellerActionResult> {
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise as anotações.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerInlineServiceApi.updateNotes({
      pe_customer_id: parsed.data.sellerId,
      pe_notes: parsed.data.notes,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Anotações atualizadas." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível atualizar as anotações."),
      error,
    );
  }
}

export async function updateSellerPersonalAction(
  input: z.input<typeof personalSchema>,
): Promise<SellerActionResult> {
  const parsed = personalSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados pessoais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updatePersonal({
      pe_customer_id: parsed.data.sellerId,
      pe_cpf: parsed.data.cpf,
      pe_first_name: parsed.data.firstName,
      pe_last_name: parsed.data.lastName,
      pe_image_path: parsed.data.imagePath,
      pe_birth_date: parsed.data.birthDate,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Dados pessoais atualizados." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar os dados pessoais.",
      ),
      error,
    );
  }
}

export async function updateSellerBusinessAction(
  input: z.input<typeof businessSchema>,
): Promise<SellerActionResult> {
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados empresariais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateBusiness({
      pe_customer_id: parsed.data.sellerId,
      pe_cnpj: parsed.data.cnpj,
      pe_company_name: parsed.data.companyName,
      pe_state_registration: parsed.data.stateRegistration,
      pe_municipal_registration: parsed.data.municipalRegistration,
      pe_responsible_name: parsed.data.responsibleName,
      pe_main_activity: parsed.data.mainActivity,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Dados empresariais atualizados." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar os dados empresariais.",
      ),
      error,
    );
  }
}

export async function updateSellerAddressAction(
  input: z.input<typeof addressSchema>,
): Promise<SellerActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise o endereço.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateAddress({
      pe_customer_id: parsed.data.sellerId,
      pe_zip_code: parsed.data.zipCode,
      pe_address: parsed.data.address,
      pe_address_number: parsed.data.addressNumber,
      pe_complement: parsed.data.complement,
      pe_neighborhood: parsed.data.neighborhood,
      pe_city: parsed.data.city,
      pe_state: parsed.data.state,
      pe_city_code: parsed.data.cityCode,
      pe_state_code: parsed.data.stateCode,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Endereço atualizado." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível atualizar o endereço."),
      error,
    );
  }
}

export async function updateSellerInternetAction(
  input: z.input<typeof internetSchema>,
): Promise<SellerActionResult> {
  const parsed = internetSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados de presença digital.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateInternet({
      pe_customer_id: parsed.data.sellerId,
      pe_website: parsed.data.website,
      pe_facebook: parsed.data.facebook,
      pe_twitter: parsed.data.twitter,
      pe_linkedin: parsed.data.linkedin,
      pe_instagram: parsed.data.instagram,
      pe_tiktok: parsed.data.tiktok,
      pe_telegram: parsed.data.telegram,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Presença digital atualizada." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar a presença digital.",
      ),
      error,
    );
  }
}

export async function updateSellerInactiveAction(
  input: z.input<typeof inactiveSchema>,
): Promise<SellerActionResult> {
  const parsed = inactiveSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Status do cadastro inválido.");

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await generalCallServiceApi.updateTableInlineField({
      ...context.apiContext,
      pe_table_name: SELLER_TABLE_NAME,
      pe_primary_key_field: SELLER_PRIMARY_KEY_FIELD,
      pe_register_id: parsed.data.sellerId,
      pe_field_type: FIELD_TYPE.BIGINT,
      pe_field: SELLER_INACTIVE_FIELD,
      pe_value_int: parsed.data.inactive ? 1 : 0,
    });
    revalidateSeller(parsed.data.sellerId);
    return {
      success: true,
      message: parsed.data.inactive
        ? "Cadastro inativado."
        : "Cadastro ativado.",
    };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível alterar o status do cadastro.",
      ),
      error,
    );
  }
}

export async function updateSellerEmailMarketingAction(
  input: z.input<typeof emailMarketingSchema>,
): Promise<SellerActionResult> {
  const parsed = emailMarketingSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Opção de publicidade inválida.");

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await generalCallServiceApi.updateTableInlineField({
      ...context.apiContext,
      pe_table_name: SELLER_TABLE_NAME,
      pe_primary_key_field: SELLER_PRIMARY_KEY_FIELD,
      pe_register_id: parsed.data.sellerId,
      pe_field_type: FIELD_TYPE.BIGINT,
      pe_field: SELLER_EMAIL_MARKETING_FIELD,
      pe_value_int: parsed.data.enabled ? 1 : 0,
    });
    revalidateSeller(parsed.data.sellerId);
    return {
      success: true,
      message: parsed.data.enabled
        ? "Envio de publicidade ativado."
        : "Envio de publicidade desativado.",
    };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível alterar a opção de publicidade.",
      ),
      error,
    );
  }
}

export async function updateSellerFreeShippingAction(
  input: z.input<typeof freeShippingSchema>,
): Promise<SellerActionResult> {
  const parsed = freeShippingSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Tipo de frete inválido.");

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await generalCallServiceApi.updateTableInlineField({
      ...context.apiContext,
      pe_table_name: SELLER_TABLE_NAME,
      pe_primary_key_field: SELLER_PRIMARY_KEY_FIELD,
      pe_register_id: parsed.data.sellerId,
      pe_field_type: FIELD_TYPE.BIGINT,
      pe_field: SELLER_FREE_SHIPPING_FIELD,
      pe_value_int: parsed.data.enabled ? 1 : 0,
    });
    revalidateSeller(parsed.data.sellerId);
    return {
      success: true,
      message: parsed.data.enabled
        ? "Frete grátis ativado."
        : "Frete padrão ativado.",
    };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível alterar o tipo de frete."),
      error,
    );
  }
}

export async function updateSellerTypePersonAction(
  input: z.input<typeof personTypeSchema>,
): Promise<SellerActionResult> {
  const parsed = personTypeSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Tipo de pessoa inválido.");

  try {
    const context = await getExistingSeller(parsed.data.sellerId);
    if ("success" in context) return context;
    await customerInlineServiceApi.updateTypePerson({
      pe_customer_id: parsed.data.sellerId,
      pe_person_type_id: parsed.data.personTypeId,
      ...context.apiContext,
    });
    revalidateSeller(parsed.data.sellerId);
    return { success: true, message: "Tipo de pessoa atualizado." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar o tipo de pessoa.",
      ),
      error,
    );
  }
}
