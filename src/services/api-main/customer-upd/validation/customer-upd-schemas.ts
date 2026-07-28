import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_customer_id: z.number().int().positive(),
};

export const CustomerUpdGeneralSchema = z.object({
  ...baseContextSchema,
  pe_name: z.string().max(300).min(1),
  pe_phone: z.string().max(100).optional(),
  pe_whatsapp: z.string().max(100).optional(),
  pe_email: z.string().max(100).optional(),
  pe_image_path: z.string().max(500).optional(),
});

export const CustomerUpdPersonalSchema = z.object({
  ...baseContextSchema,
  pe_cpf: z.string().max(100).optional(),
  pe_first_name: z.string().max(300).optional(),
  pe_last_name: z.string().max(100).optional(),
  pe_image_path: z.string().max(100).optional(),
  pe_birth_date: z.string().optional(),
});

export const CustomerUpdBusinessSchema = z.object({
  ...baseContextSchema,
  pe_cnpj: z.string().max(100).min(1),
  pe_company_name: z.string().max(300).min(1),
  pe_state_registration: z.string().max(100).optional(),
  pe_municipal_registration: z.string().max(100).optional(),
  pe_responsible_name: z.string().max(300).optional(),
  pe_main_activity: z.string().max(300).optional(),
});

export const CustomerUpdAddressSchema = z.object({
  ...baseContextSchema,
  pe_zip_code: z.string().max(100).optional(),
  pe_address: z.string().max(300).optional(),
  pe_address_number: z.string().max(100).optional(),
  pe_complement: z.string().max(100).optional(),
  pe_neighborhood: z.string().max(300).optional(),
  pe_city: z.string().max(300).optional(),
  pe_state: z.string().max(100).optional(),
  pe_city_code: z.string().max(100).optional(),
  pe_state_code: z.string().max(100).optional(),
});

export const CustomerUpdInternetSchema = z.object({
  ...baseContextSchema,
  pe_website: z.string().max(500).optional(),
  pe_facebook: z.string().max(500).optional(),
  pe_twitter: z.string().max(500).optional(),
  pe_linkedin: z.string().max(500).optional(),
  pe_instagram: z.string().max(500).optional(),
  pe_tiktok: z.string().max(500).optional(),
  pe_telegram: z.string().max(500).optional(),
});

export const CustomerUpdFlagSchema = z.object({
  ...baseContextSchema,
  pe_client: z.number().int().min(0).max(1).optional(),
  pe_seller: z.number().int().min(0).max(1).optional(),
  pe_supplier: z.number().int().min(0).max(1).optional(),
  pe_professional: z.number().int().min(0).max(1).optional(),
  pe_employee: z.number().int().min(0).max(1).optional(),
  pe_restriction: z.number().int().min(0).max(1).optional(),
});

export type CustomerUpdGeneralInput = z.infer<typeof CustomerUpdGeneralSchema>;
export type CustomerUpdPersonalInput = z.infer<
  typeof CustomerUpdPersonalSchema
>;
export type CustomerUpdBusinessInput = z.infer<
  typeof CustomerUpdBusinessSchema
>;
export type CustomerUpdAddressInput = z.infer<typeof CustomerUpdAddressSchema>;
export type CustomerUpdInternetInput = z.infer<
  typeof CustomerUpdInternetSchema
>;
export type CustomerUpdFlagInput = z.infer<typeof CustomerUpdFlagSchema>;
