import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const OrderSalesFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_type_business: z.number().int().optional(),
});

export const OrderSalesFindTipoFreteSchema = z.object(baseContextSchema);

export const OrderSalesDashboardSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_id_customer: z.number().int().optional(),
  pe_id_seller: z.number().int().optional(),
  pe_type_business: z.number().int().optional(),
});

export type OrderSalesFindByIdInput = z.infer<typeof OrderSalesFindByIdSchema>;
export type OrderSalesFindTipoFreteInput = z.infer<
  typeof OrderSalesFindTipoFreteSchema
>;
export type OrderSalesDashboardInput = z.infer<
  typeof OrderSalesDashboardSchema
>;
