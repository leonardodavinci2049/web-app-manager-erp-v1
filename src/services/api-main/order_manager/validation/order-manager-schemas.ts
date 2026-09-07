import { z } from "zod";

const dateStringSchema = z
  .string()
  .max(300)
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Deve estar no formato YYYY-MM-DD");

export const OrdersManagerFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_order_id: z.number().int().min(0).optional(),
  pe_customer_id: z.number().int().min(0).optional(),
  pe_seller_id: z.number().int().min(0).optional(),
  pe_order_status_id: z.number().int().min(0).optional(),
  pe_financial_status_id: z.number().int().min(0).optional(),
  pe_delivery_status_id: z.number().int().min(0).optional(),
  pe_location_id: z.number().int().min(0).optional(),
  pe_start_date: dateStringSchema,
  pe_end_date: dateStringSchema,
  pe_records_per_page: z.number().int().min(1).max(1000).optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_sort_column_id: z.number().int().min(1).max(3).optional(),
  pe_sort_order_id: z.number().int().min(1).max(2).optional(),
});

export const OrdersManagerFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_order_id: z.number().int().positive(),
});

export type OrdersManagerFindAllInput = z.infer<
  typeof OrdersManagerFindAllSchema
>;
export type OrdersManagerFindByIdInput = z.infer<
  typeof OrdersManagerFindByIdSchema
>;
