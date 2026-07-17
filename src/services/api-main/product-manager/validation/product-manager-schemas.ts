import { z } from "zod";

const binaryFlagSchema = z.number().int().min(0).max(1).optional();
const ternaryFlagSchema = z.number().int().min(0).max(2).optional();
const disabledOrIsoDateSchema = z
  .string()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Must be empty or use the YYYY-MM-DD format",
  )
  .optional();

export const ProductManagerFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_ean: z.string().max(200).optional(),
  pe_taxonomy_id: z.number().int().min(0).optional(),
  pe_type_id: z.number().int().min(0).optional(),
  pe_brand_id: z.number().int().min(0).optional(),
  pe_supplier_id: z.number().int().min(0).optional(),
  pe_physical_id: z.number().int().min(0).optional(),
  pe_flag_sales_list: z.number().int().min(0).max(3).optional(),
  pe_flag_stock_list: z.number().int().min(0).max(3).optional(),
  pe_flag_no_image: binaryFlagSchema,
  pe_flag_no_description: binaryFlagSchema,
  pe_flag_no_sales_copy: binaryFlagSchema,
  pe_flag_advanced: z.number().int().min(0).max(2).optional(),
  pe_flag_imported: ternaryFlagSchema,
  pe_flag_inactive: ternaryFlagSchema,
  pe_flag_premium: binaryFlagSchema,
  pe_flag_various_lists: z.number().int().min(0).max(6).optional(),
  pe_flag_operation_list: binaryFlagSchema,
  pe_start_date: disabledOrIsoDateSchema,
  pe_end_date: disabledOrIsoDateSchema,
  pe_records_quantity: z.number().int().min(1).max(1000).optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(1).max(3).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const ProductManagerFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().optional(),
  pe_type_business: z.number().int().optional(),
});

export const ProductManagerFindSearchSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_customer_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_flag_stock: z.number().int().min(0).max(1).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export type ProductManagerFindAllInput = z.infer<
  typeof ProductManagerFindAllSchema
>;
export type ProductManagerFindByIdInput = z.infer<
  typeof ProductManagerFindByIdSchema
>;
export type ProductManagerFindSearchInput = z.infer<
  typeof ProductManagerFindSearchSchema
>;
