import { z } from "zod";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const APP_CONFIG_UPDATABLE_FIELDS = [
  "APP_NAME",
  "DOMINIO",
  "PATH_IMAGEM",
  "GENERAL_CONFIG_JSON",
  "COMPANY_INFO_JSON",
  "COMPANY_ABOUT_JSON",
  "COMPANY_ADDRESS_JSON",
  "COMPANY_SEO_JSON",
  "COMPANY_FAQ_JSON",
  "COMPANY_LINKS_JSON",
  "PAYMENT_METHOD_JSON",
  "HOME_INFO_JSON",
  "HOME_BRAND_JSON",
  "HOME_CATEGORY_JSON",
  "HOME_SECTION_JSON",
  "HOME_MENU_JSON",
  "HOME_HERO_JSON",
  "FLAG_MAINTENANCE",
  "IS_ACTIVE",
  "NOTES",
] as const;

const AppConfigRequestContextSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
});

const AppConfigRequiredContextSchema = AppConfigRequestContextSchema.extend({
  pe_system_client_id: z.number().int().positive(),
  pe_organization_id: z.string().min(1).max(200),
  pe_user_id: z.string().min(1).max(200),
  pe_user_name: z.string().min(1).max(200),
  pe_user_role: z.string().min(1).max(200),
});

export const AppConfigFindAllSchema = AppConfigRequiredContextSchema.extend({
  pe_limit: z.number().int(),
  pe_search: z.string().max(100).nullable().optional(),
});

export const AppConfigFindByIdSchema = AppConfigRequiredContextSchema.extend({
  pe_config_id: z.number().int().nonnegative().default(0),
});

export const AppMenuFindByTypeSchema = AppConfigRequestContextSchema.extend({
  pe_customer_id: z.number().int().min(0).optional(),
  pe_type: z.string().min(1).max(100),
});

export const AppConfigUpdateGeneralFieldSchema =
  AppConfigRequiredContextSchema.extend({
    pe_register_id: z.number().int().positive(),
    pe_field_type: z.number().int().min(1).max(4),
    pe_field: z.enum(APP_CONFIG_UPDATABLE_FIELDS),
    pe_value_str: z.string().nullable().optional(),
    pe_value_int: z.number().int().nullable().optional(),
    pe_value_numeric: z.number().nullable().optional(),
    pe_value_date: z.string().regex(ISO_DATE_REGEX).nullable().optional(),
  });

export type AppConfigFindAllInput = z.infer<typeof AppConfigFindAllSchema>;
export type AppConfigFindByIdInput = z.infer<typeof AppConfigFindByIdSchema>;
export type AppMenuFindByTypeInput = z.infer<typeof AppMenuFindByTypeSchema>;
export type AppConfigUpdateGeneralFieldInput = z.infer<
  typeof AppConfigUpdateGeneralFieldSchema
>;
