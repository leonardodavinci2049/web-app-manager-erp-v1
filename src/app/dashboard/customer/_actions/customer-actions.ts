"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import {
  CustomerError,
  CustomerNotFoundError,
  customerGeneralServiceApi,
  getCustomerById,
} from "@/services/api-main/customer-general";
import {
  CustomerInlineError,
  customerInlineServiceApi,
} from "@/services/api-main/customer-inline";
import {
  CustomerUpdError,
  customerUpdServiceApi,
} from "@/services/api-main/customer-upd";
import type {
  CustomerActionResult,
  CustomerCreateValues,
} from "../_components/types/customer-dashboard-types";

const logger = createLogger("CustomerDashboardActions");
const CUSTOMER_PATH = "/dashboard/customer";
const customerIdSchema = z.number().int().positive();
const optionalText = (max: number) => z.string().trim().max(max);
const optionalEmail = optionalText(255).refine(
  (value) => value === "" || z.email().safeParse(value).success,
  "Informe um e-mail válido.",
);

const createSchema = z.object({
  name: optionalText(255).min(1, "Informe o nome do cliente."),
  email: optionalEmail.min(1, "Informe o e-mail do cliente."),
  personTypeId: z.number().int().min(1).max(2),
  cnpj: optionalText(100),
  companyName: optionalText(255),
  cpf: optionalText(100),
  phone: optionalText(100),
  whatsapp: optionalText(100),
  image: optionalText(500),
  zipCode: optionalText(100),
  address: optionalText(300),
  addressNumber: optionalText(100),
  complement: optionalText(100),
  neighborhood: optionalText(300),
  city: optionalText(300),
  state: optionalText(2),
  notes: optionalText(2000),
});

const generalSchema = z.object({
  customerId: customerIdSchema,
  name: optionalText(300).min(1, "Informe o nome do cliente."),
  email: optionalEmail,
  phone: optionalText(100),
  whatsapp: optionalText(100),
  imagePath: optionalText(500),
});
const notesSchema = z.object({
  customerId: customerIdSchema,
  notes: optionalText(2000),
});
const personalSchema = z.object({
  customerId: customerIdSchema,
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
  customerId: customerIdSchema,
  cnpj: optionalText(100).min(1, "Informe o CNPJ."),
  companyName: optionalText(300).min(1, "Informe a razão social."),
  stateRegistration: optionalText(100),
  municipalRegistration: optionalText(100),
  responsibleName: optionalText(300),
  mainActivity: optionalText(300),
});
const addressSchema = z.object({
  customerId: customerIdSchema,
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
  customerId: customerIdSchema,
  website: optionalText(500),
  facebook: optionalText(500),
  twitter: optionalText(500),
  linkedin: optionalText(500),
  instagram: optionalText(500),
  tiktok: optionalText(500),
  telegram: optionalText(500),
});
const restrictionSchema = z.object({
  customerId: customerIdSchema,
  restricted: z.boolean(),
});
const personTypeSchema = z.object({
  customerId: customerIdSchema,
  personTypeId: z.number().int().min(1).max(2),
});
const customerTypeSchema = z.object({
  customerId: customerIdSchema,
  customerTypeId: z.number().int().min(1).max(3),
});

function safeFailure(
  message: string,
  error?: unknown,
  fieldErrors?: Record<string, string[]>,
): CustomerActionResult {
  if (error) logger.error(message, error);
  return { success: false, message, fieldErrors };
}

function safeOperationMessage(error: unknown, fallback: string): string {
  if (
    (error instanceof CustomerError &&
      error.code === "CUSTOMER_OPERATION_ERROR") ||
    (error instanceof CustomerUpdError &&
      error.code === "CUSTOMER_UPD_OPERATION_ERROR") ||
    (error instanceof CustomerInlineError &&
      error.code === "CUSTOMER_INLINE_OPERATION_ERROR")
  ) {
    const message = error.message.trim().slice(0, 300);
    if (message) return message;
  }
  return fallback;
}

async function getExistingCustomer(
  customerId: number,
): Promise<
  | { apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"] }
  | CustomerActionResult
> {
  const { apiContext } = await getAuthContext();
  try {
    const customer = await getCustomerById(customerId, apiContext);
    if (!customer) return safeFailure("Cliente não encontrado.");
    return { apiContext };
  } catch (error) {
    if (error instanceof CustomerNotFoundError)
      return safeFailure("Cliente não encontrado.");
    throw error;
  }
}

function revalidateCustomer(customerId?: number): void {
  revalidatePath(CUSTOMER_PATH);
  if (customerId) revalidatePath(`${CUSTOMER_PATH}/${customerId}`);
}

export async function createCustomerAction(
  input: CustomerCreateValues,
): Promise<CustomerActionResult> {
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
    const response = await customerGeneralServiceApi.createCustomer({
      pe_name: parsed.data.name,
      pe_email: parsed.data.email,
      pe_person_type_id: parsed.data.personTypeId,
      pe_cnpj: parsed.data.cnpj,
      pe_company_name: parsed.data.companyName,
      pe_cpf: parsed.data.cpf,
      pe_phone: parsed.data.phone,
      pe_whatsapp: parsed.data.whatsapp,
      pe_image: parsed.data.image,
      pe_zip_code: parsed.data.zipCode,
      pe_address: parsed.data.address,
      pe_address_number: parsed.data.addressNumber,
      pe_complement: parsed.data.complement,
      pe_neighborhood: parsed.data.neighborhood,
      pe_city: parsed.data.city,
      pe_state: parsed.data.state,
      pe_notes: parsed.data.notes,
      ...apiContext,
    });
    const operation =
      customerGeneralServiceApi.extractStoredProcedureResult(response);
    const customerId = operation?.sp_return_id || Number(response.recordId);
    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      return safeFailure("Não foi possível confirmar a criação do cliente.");
    }

    revalidateCustomer(customerId);
    return {
      success: true,
      message: "Cliente criado com sucesso.",
      customerId,
    };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível criar o cliente."),
      error,
    );
  }
}

export async function updateCustomerGeneralAction(
  input: z.input<typeof generalSchema>,
): Promise<CustomerActionResult> {
  const parsed = generalSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados gerais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateGeneral({
      pe_customer_id: parsed.data.customerId,
      pe_name: parsed.data.name,
      pe_email: parsed.data.email,
      pe_phone: parsed.data.phone,
      pe_whatsapp: parsed.data.whatsapp,
      pe_image_path: parsed.data.imagePath,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
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

export async function updateCustomerNotesAction(
  input: z.input<typeof notesSchema>,
): Promise<CustomerActionResult> {
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise as anotações.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerInlineServiceApi.updateNotes({
      pe_customer_id: parsed.data.customerId,
      pe_notes: parsed.data.notes,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
    return { success: true, message: "Anotações atualizadas." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível atualizar as anotações."),
      error,
    );
  }
}

export async function updateCustomerPersonalAction(
  input: z.input<typeof personalSchema>,
): Promise<CustomerActionResult> {
  const parsed = personalSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados pessoais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updatePersonal({
      pe_customer_id: parsed.data.customerId,
      pe_cpf: parsed.data.cpf,
      pe_first_name: parsed.data.firstName,
      pe_last_name: parsed.data.lastName,
      pe_image_path: parsed.data.imagePath,
      pe_birth_date: parsed.data.birthDate,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
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

export async function updateCustomerBusinessAction(
  input: z.input<typeof businessSchema>,
): Promise<CustomerActionResult> {
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados empresariais.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateBusiness({
      pe_customer_id: parsed.data.customerId,
      pe_cnpj: parsed.data.cnpj,
      pe_company_name: parsed.data.companyName,
      pe_state_registration: parsed.data.stateRegistration,
      pe_municipal_registration: parsed.data.municipalRegistration,
      pe_responsible_name: parsed.data.responsibleName,
      pe_main_activity: parsed.data.mainActivity,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
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

export async function updateCustomerAddressAction(
  input: z.input<typeof addressSchema>,
): Promise<CustomerActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise o endereço.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateAddress({
      pe_customer_id: parsed.data.customerId,
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
    revalidateCustomer(parsed.data.customerId);
    return { success: true, message: "Endereço atualizado." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(error, "Não foi possível atualizar o endereço."),
      error,
    );
  }
}

export async function updateCustomerInternetAction(
  input: z.input<typeof internetSchema>,
): Promise<CustomerActionResult> {
  const parsed = internetSchema.safeParse(input);
  if (!parsed.success)
    return safeFailure(
      "Revise os dados de presença digital.",
      undefined,
      z.flattenError(parsed.error).fieldErrors,
    );

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateInternet({
      pe_customer_id: parsed.data.customerId,
      pe_website: parsed.data.website,
      pe_facebook: parsed.data.facebook,
      pe_twitter: parsed.data.twitter,
      pe_linkedin: parsed.data.linkedin,
      pe_instagram: parsed.data.instagram,
      pe_tiktok: parsed.data.tiktok,
      pe_telegram: parsed.data.telegram,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
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

export async function updateCustomerRestrictionAction(
  input: z.input<typeof restrictionSchema>,
): Promise<CustomerActionResult> {
  const parsed = restrictionSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Operação de restrição inválida.");

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerUpdServiceApi.updateFlag({
      pe_customer_id: parsed.data.customerId,
      pe_restriction: parsed.data.restricted ? 1 : 0,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
    return {
      success: true,
      message: parsed.data.restricted
        ? "Cliente marcado com restrição."
        : "Restrição removida do cliente.",
    };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível alterar a restrição do cliente.",
      ),
      error,
    );
  }
}

export async function updateCustomerTypePersonAction(
  input: z.input<typeof personTypeSchema>,
): Promise<CustomerActionResult> {
  const parsed = personTypeSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Tipo de pessoa inválido.");

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerInlineServiceApi.updateTypePerson({
      pe_customer_id: parsed.data.customerId,
      pe_person_type_id: parsed.data.personTypeId,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
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

export async function updateCustomerTypeCustomerAction(
  input: z.input<typeof customerTypeSchema>,
): Promise<CustomerActionResult> {
  const parsed = customerTypeSchema.safeParse(input);
  if (!parsed.success) return safeFailure("Tipo de cliente inválido.");

  try {
    const context = await getExistingCustomer(parsed.data.customerId);
    if ("success" in context) return context;
    await customerInlineServiceApi.updateTypeCustomer({
      pe_customer_id: parsed.data.customerId,
      pe_customer_type_id: parsed.data.customerTypeId,
      ...context.apiContext,
    });
    revalidateCustomer(parsed.data.customerId);
    return { success: true, message: "Tipo de cliente atualizado." };
  } catch (error) {
    return safeFailure(
      safeOperationMessage(
        error,
        "Não foi possível atualizar o tipo de cliente.",
      ),
      error,
    );
  }
}
