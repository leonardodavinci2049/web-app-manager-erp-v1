import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const OrderOperCreateSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int().optional(),
  pe_seller_id: z.number().int().optional(),
  pe_business_type: z.number().int().optional(),
  pe_payment_form_id: z.number().int().optional(),
  pe_location_id: z.number().int().optional(),
  pe_notes: z.string().optional(),
});

export const OrderOperAddItemSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_customer_id: z.number().int().optional(),
  pe_seller_id: z.number().int().optional(),
  pe_payment_form_id: z.number().int().optional(),
  pe_product_id: z.number().int().optional(),
  pe_product_quantity: z.number().int().optional(),
  pe_business_type: z.number().int().optional(),
  pe_notes: z.string().optional(),
});

export const OrderOperCloseSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().positive(),
});

export const OrderOperReverseSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().positive(),
});

export const OrderOperSendingByEmailSchema = z.object({
  ...baseContextSchema,
  pe_order_id: z.number().int().optional(),
  pe_seller_id: z.number().int().optional(),
  pe_business_type: z.number().int().optional(),
});

export type OrderOperCreateInput = z.infer<typeof OrderOperCreateSchema>;
export type OrderOperAddItemInput = z.infer<typeof OrderOperAddItemSchema>;
export type OrderOperCloseInput = z.infer<typeof OrderOperCloseSchema>;
export type OrderOperReverseInput = z.infer<typeof OrderOperReverseSchema>;
export type OrderOperSendingByEmailInput = z.infer<
  typeof OrderOperSendingByEmailSchema
>;
