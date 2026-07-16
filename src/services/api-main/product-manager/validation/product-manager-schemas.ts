import { z } from "zod";

const binaryFlagSchema = z.number().int().min(0).max(1).optional();
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
  pe_reference: z.string().max(200).optional(),
  pe_model: z.string().max(200).optional(),
  pe_taxonomy_id: z.number().int().min(0).optional(),
  pe_type_id: z.number().int().min(0).optional(),
  pe_brand_id: z.number().int().min(0).optional(),
  pe_supplier_id: z.number().int().min(0).optional(),
  pe_physical_id: z.number().int().min(0).optional(),
  pe_flag_best_sellers: binaryFlagSchema,
  pe_flag_lowest_selling: binaryFlagSchema,
  pe_flag_stalled_product: binaryFlagSchema,
  pe_flag_latest_arrivals: binaryFlagSchema,
  pe_flag_price_less_than: binaryFlagSchema,
  pe_flag_low_stock: z.number().int().min(0).optional(),
  pe_flag_no_image: binaryFlagSchema,
  pe_flag_no_description: binaryFlagSchema,
  pe_flag_no_sales_copy: binaryFlagSchema,
  pe_flag_promotion: binaryFlagSchema,
  pe_flag_featured: binaryFlagSchema,
  pe_flag_imported: binaryFlagSchema,
  pe_flag_inactive: binaryFlagSchema,
  pe_flag_consignment: binaryFlagSchema,
  pe_flag_discontinued: binaryFlagSchema,
  pe_flag_no_inventory: binaryFlagSchema,
  pe_flag_Website_Off: binaryFlagSchema,
  pe_flag_Premium: binaryFlagSchema,
  pe_flag_stock: binaryFlagSchema,
  pe_flag_service: binaryFlagSchema,
  pe_flag_registration: binaryFlagSchema,
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
