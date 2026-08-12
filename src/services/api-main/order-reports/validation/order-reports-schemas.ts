import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const OrderReportsFindAllSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_customer_id: z.number().int().optional(),
  pe_seller_id: z.number().int().optional(),
  pe_order_status_id: z.number().int().optional(),
  pe_financial_status_id: z.number().int().optional(),
  pe_location_id: z.number().int().optional(),
  pe_initial_date: z.string().optional(),
  pe_final_date: z.string().optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const OrderReportsFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_type_business: z.number().int().optional(),
});

export type OrderReportsFindAllInput = z.infer<
  typeof OrderReportsFindAllSchema
>;
export type OrderReportsFindByIdInput = z.infer<
  typeof OrderReportsFindByIdSchema
>;
