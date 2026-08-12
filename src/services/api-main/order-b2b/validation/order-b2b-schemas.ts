import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const OrderFindBudgetCustomerIdSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export const OrderFindDashboardCustomerIdSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int(),
  pe_customer_id: z.number().int(),
});

export const OrderItemFindQtSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export const OrderFindLatestSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export const OrderStatisticsCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export type OrderFindBudgetCustomerIdInput = z.infer<
  typeof OrderFindBudgetCustomerIdSchema
>;
export type OrderFindDashboardCustomerIdInput = z.infer<
  typeof OrderFindDashboardCustomerIdSchema
>;
export type OrderItemFindQtInput = z.infer<typeof OrderItemFindQtSchema>;
export type OrderFindLatestInput = z.infer<typeof OrderFindLatestSchema>;
export type OrderStatisticsCustomerInput = z.infer<
  typeof OrderStatisticsCustomerSchema
>;
