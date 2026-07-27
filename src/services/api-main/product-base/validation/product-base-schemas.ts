import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const ProductFindAllSchema = z.object({
  ...baseContextSchema,
  pe_search: z.string().max(300).optional(),
  pe_taxonomy_id: z.number().int().optional(),
  pe_type_id: z.number().int().optional(),
  pe_brand_id: z.number().int().optional(),
  pe_flag_stock: z.number().int().min(0).max(1).optional(),
  pe_flag_service: z.number().int().min(0).max(1).optional(),
  pe_records_quantity: z.number().int().positive().optional(),
  pe_page_id: z.number().int().optional(),
  pe_column_id: z.number().int().optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const ProductSearchAllSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int().optional(),
  pe_search: z.string().max(300).min(1),
  pe_flag_stock: z.number().int().min(0).max(1).optional(),
  pe_records_quantity: z.number().int().positive().optional(),
});

export const ProductFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_product_id: z.number().int().positive(),
});

export const ProductCreateSchema = z.object({
  ...baseContextSchema,
  pe_product_name: z.string().trim().max(300).min(6),
  pe_tab_description: z.string().max(500).optional(),
  pe_label: z.string().max(100).optional(),
  pe_ref: z.string().max(100).optional(),
  pe_model: z.string().max(100).optional(),
  pe_product_type_id: z.number().int().nonnegative().default(0),
  pe_brand_id: z.number().int().nonnegative().default(0),
  pe_supplier_id: z.number().int().nonnegative().default(0),
  pe_family_id: z.number().int().nonnegative().default(0),
  pe_group_id: z.number().int().nonnegative().default(0),
  pe_subgroup_id: z.number().int().nonnegative().default(0),
  pe_weight_gr: z.number().int().nonnegative().default(0),
  pe_length_mm: z.number().int().nonnegative().default(0),
  pe_width_mm: z.number().int().nonnegative().default(0),
  pe_height_mm: z.number().int().nonnegative().default(0),
  pe_diameter_mm: z.number().int().nonnegative().default(0),
  pe_warranty_period_days: z.number().int().nonnegative().default(0),
  pe_wholesale_price: z.number().finite().positive(),
  pe_retail_price: z.number().finite().positive(),
  pe_corporate_price: z.number().finite().positive(),
  pe_stock_quantity: z.number().int().nonnegative().default(0),
  pe_service_flag: z.number().int().nonnegative().default(0),
  pe_physical_control_flag: z.number().int().nonnegative().default(0),
  pe_stock_control_flag: z.number().int().nonnegative().default(1),
  pe_consigned_flag: z.number().int().nonnegative().default(0),
  pe_website_off_flag: z.number().int().nonnegative().default(0),
  pe_imported_flag: z.number().int().nonnegative().default(2),
  pe_additional_info: z.string().default(""),
});

export type ProductFindAllInput = z.infer<typeof ProductFindAllSchema>;
export type ProductSearchAllInput = z.infer<typeof ProductSearchAllSchema>;
export type ProductFindByIdInput = z.infer<typeof ProductFindByIdSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
