import { z } from "zod";

export const SellerSearchAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
});

export const SellerFindManagerAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_category_id: z.number().int().min(0).optional(),
  pe_flag_no_image: z.number().int().min(0).optional(),
  pe_status_id: z.number().int().min(0).optional(),
  pe_qt_records: z.number().int().optional(),
  pe_page_id: z.number().int().optional(),
  pe_column_id: z.number().int().optional(),
  pe_order_id: z.number().int().optional(),
});

export const SellerFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_seller_id: z.number().int().positive(),
});

export type SellerSearchAllInput = z.infer<typeof SellerSearchAllSchema>;
export type SellerFindManagerAllInput = z.infer<
  typeof SellerFindManagerAllSchema
>;
export type SellerFindByIdInput = z.infer<typeof SellerFindByIdSchema>;
