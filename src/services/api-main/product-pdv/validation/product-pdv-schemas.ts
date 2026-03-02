import { z } from "zod";

export const ProductPdvFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_taxonomy_id: z.number().int().optional(),
  pe_type_id: z.number().int().optional(),
  pe_brand_id: z.number().int().optional(),
  pe_flag_stock: z.number().int().min(0).max(1).optional(),
  pe_flag_service: z.number().int().min(0).max(1).optional(),
  pe_records_quantity: z.number().int().positive().optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().optional(),
  pe_order_id: z.number().int().min(1).max(2).optional(),
});

export const ProductPdvFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().optional(),
  pe_type_business: z.number().int().optional(),
});

export const ProductPdvFindSearchSchema = z.object({
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

export type ProductPdvFindAllInput = z.infer<typeof ProductPdvFindAllSchema>;
export type ProductPdvFindByIdInput = z.infer<typeof ProductPdvFindByIdSchema>;
export type ProductPdvFindSearchInput = z.infer<
  typeof ProductPdvFindSearchSchema
>;
