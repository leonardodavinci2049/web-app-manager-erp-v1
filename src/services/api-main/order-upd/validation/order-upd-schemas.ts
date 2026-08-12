import { z } from "zod";

const inlineFieldTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_order_id: z.number().int(),
};

export const OrderUpdInlineFieldSchema = z
  .object({
    pe_system_client_id: z.number().int().min(0).optional(),
    pe_organization_id: z.string().max(200).optional(),
    pe_user_id: z.string().max(200).optional(),
    pe_user_name: z.string().max(200).optional(),
    pe_user_role: z.string().max(200).optional(),
    pe_person_id: z.number().optional(),
    pe_register_id: z.number().int().positive(),
    pe_field_type: inlineFieldTypeSchema,
    pe_field: z.string().max(200).min(1),
    pe_value_str: z.string().optional(),
    pe_value_int: z.number().int().optional(),
    pe_value_numeric: z.number().optional(),
    pe_value_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.pe_field_type === 1 && typeof data.pe_value_str !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_str"],
        message: "pe_value_str é obrigatório quando pe_field_type = 1",
      });
    }

    if (data.pe_field_type === 2 && typeof data.pe_value_int !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_int"],
        message: "pe_value_int é obrigatório quando pe_field_type = 2",
      });
    }

    if (data.pe_field_type === 3 && typeof data.pe_value_numeric !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_numeric"],
        message: "pe_value_numeric é obrigatório quando pe_field_type = 3",
      });
    }

    if (data.pe_field_type === 4 && typeof data.pe_value_date !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_date"],
        message: "pe_value_date é obrigatório quando pe_field_type = 4",
      });
    }
  });

export const OrderUpdCustomerSchema = z.object({
  ...baseContextSchema,
  pe_customer_id: z.number().int(),
});

export const OrderUpdDiscountSchema = z.object({
  ...baseContextSchema,
  pe_discount_value: z.number(),
});

export const OrderUpdFreteSchema = z.object({
  ...baseContextSchema,
  pe_shipping_type_id: z.number().int().positive(),
});

export const OrderUpdNotesSchema = z.object({
  ...baseContextSchema,
  pe_notes: z.string().max(500).optional(),
});

export const OrderUpdPgMethodSchema = z.object({
  ...baseContextSchema,
  pe_pg_method_id: z.number().int(),
});

export const OrderUpdSellerSchema = z.object({
  ...baseContextSchema,
  pe_seller_id: z.number().int(),
});

export const OrderUpdStatusSchema = z.object({
  ...baseContextSchema,
  pe_status_id: z.number().int(),
});

export type OrderUpdCustomerInput = z.infer<typeof OrderUpdCustomerSchema>;
export type OrderUpdInlineFieldInput = z.infer<
  typeof OrderUpdInlineFieldSchema
>;
export type OrderUpdDiscountInput = z.infer<typeof OrderUpdDiscountSchema>;
export type OrderUpdFreteInput = z.infer<typeof OrderUpdFreteSchema>;
export type OrderUpdNotesInput = z.infer<typeof OrderUpdNotesSchema>;
export type OrderUpdPgMethodInput = z.infer<typeof OrderUpdPgMethodSchema>;
export type OrderUpdSellerInput = z.infer<typeof OrderUpdSellerSchema>;
export type OrderUpdStatusInput = z.infer<typeof OrderUpdStatusSchema>;
