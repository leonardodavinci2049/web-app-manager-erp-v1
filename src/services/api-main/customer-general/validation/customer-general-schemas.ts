import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const CustomerFindAllSchema = z.object({
  ...baseContextSchema,
  pe_search: z.string().max(300).optional(),
  pe_qt_registros: z.number().int().positive().optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(0).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const CustomerSearchAllSchema = z.object({
  ...baseContextSchema,
  pe_search: z.string().max(300).optional(),
});

export const CustomerFindManagerAllSchema = z.object({
  ...baseContextSchema,
  pe_search: z.string().max(300).optional(),
  pe_category_id: z.number().int().min(0).optional(),
  pe_client_type: z.number().int().min(0).optional(),
  pe_person_type: z.number().int().min(0).optional(),
  pe_flag_no_image: z.number().int().min(0).optional(),
  pe_flag_approved: z.number().int().min(0).optional(),
  pe_gender_type: z.number().int().min(0).optional(),
  pe_flag_restricted: z.number().int().min(0).optional(),
  pe_flag_enabled: z.number().int().min(0).optional(),
  pe_status_id: z.number().int().min(0).optional(),
  pe_flag_operation_list: z.number().int().min(0).optional(),
  pe_start_date: z.string().optional(),
  pe_end_date: z.string().optional(),
  pe_qt_records: z.number().int().optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(0).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const CustomerFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int().positive(),
});

export const CustomerCreateSchema = z.object({
  ...baseContextSchema,
  pe_name: z.string().max(255).min(1),
  pe_email: z.string().max(255).min(1),
  pe_person_type_id: z.number().int(),
  pe_cnpj: z.string().max(100).optional(),
  pe_company_name: z.string().max(255).optional(),
  pe_cpf: z.string().max(100).optional(),
  pe_phone: z.string().max(100).optional(),
  pe_whatsapp: z.string().max(100).optional(),
  pe_image: z.string().max(500).optional(),
  pe_zip_code: z.string().max(100).optional(),
  pe_address: z.string().max(300).optional(),
  pe_address_number: z.string().max(100).optional(),
  pe_complement: z.string().max(100).optional(),
  pe_neighborhood: z.string().max(300).optional(),
  pe_city: z.string().max(300).optional(),
  pe_state: z.string().max(100).optional(),
  pe_notes: z.string().optional(),
});

export const CustomerFindLatestProductsSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int().positive(),
  pe_limit: z.number().int().positive().optional(),
});

export type CustomerFindAllInput = z.infer<typeof CustomerFindAllSchema>;
export type CustomerSearchAllInput = z.infer<typeof CustomerSearchAllSchema>;
export type CustomerFindManagerAllInput = z.infer<
  typeof CustomerFindManagerAllSchema
>;
export type CustomerFindByIdInput = z.infer<typeof CustomerFindByIdSchema>;
export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>;
export type CustomerFindLatestProductsInput = z.infer<
  typeof CustomerFindLatestProductsSchema
>;
