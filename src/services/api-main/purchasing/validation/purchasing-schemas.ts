import { z } from "zod";

const binaryFlagSchema = z.number().int().min(0).max(1).optional();
const ternaryFlagSchema = z.number().int().min(0).max(2).optional();

export const PurchasingFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_taxonomy_id: z.number().int().min(0).optional(),
  pe_type_id: z.number().int().min(0).optional(),
  pe_brand_id: z.number().int().min(0).optional(),
  pe_supplier_id: z.number().int().min(0).optional(),
  pe_flag_sales_list: z.number().int().min(0).max(3).optional(),
  pe_flag_stock_list: z.number().int().min(0).max(3).optional(),
  pe_flag_advanced: ternaryFlagSchema,
  pe_flag_imported: ternaryFlagSchema,
  pe_flag_premium: binaryFlagSchema,
  pe_criticality_level: z.number().int().min(0).max(4).optional(),
  pe_flag_various_lists: z.number().int().min(0).optional(),
  pe_qt_records: z.number().int().min(1).max(1000).optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().min(1).max(3).optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const PurchasingFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type_business: z.number().int().optional(),
  pe_product_id: z.number().int().positive(),
});

export type PurchasingFindAllInput = z.infer<typeof PurchasingFindAllSchema>;
export type PurchasingFindByIdInput = z.infer<typeof PurchasingFindByIdSchema>;
