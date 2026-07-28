import { z } from "zod";

const requestContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

const customerRegisterSchema = {
  pe_customer_id: z.number().int().positive(),
};

const inlineFieldTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const CustomerInlineFieldSchema = z
  .object({
    ...requestContextSchema,
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

export const CustomerInlineEmailSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_email: z.string().max(200).optional(),
});

export const CustomerInlineNameSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_name: z.string().max(200).min(1),
});

export const CustomerInlineNotesSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_notes: z.string().optional(),
});

export const CustomerInlinePhoneSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_phone: z.string().max(200).optional(),
});

export const CustomerInlineSellerIdSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_seller_id: z.number().int().positive(),
});

export const CustomerInlineTypeCustomerSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_customer_type_id: z.number().int(),
});

export const CustomerInlineTypePersonSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_person_type_id: z.number().int(),
});

export const CustomerInlineWhatsappSchema = z.object({
  ...requestContextSchema,
  ...customerRegisterSchema,
  pe_whatsapp: z.string().max(200).min(1),
});

export type CustomerInlineFieldInput = z.infer<
  typeof CustomerInlineFieldSchema
>;

export type CustomerInlineEmailInput = z.infer<
  typeof CustomerInlineEmailSchema
>;
export type CustomerInlineNameInput = z.infer<typeof CustomerInlineNameSchema>;
export type CustomerInlineNotesInput = z.infer<
  typeof CustomerInlineNotesSchema
>;
export type CustomerInlinePhoneInput = z.infer<
  typeof CustomerInlinePhoneSchema
>;
export type CustomerInlineSellerIdInput = z.infer<
  typeof CustomerInlineSellerIdSchema
>;
export type CustomerInlineTypeCustomerInput = z.infer<
  typeof CustomerInlineTypeCustomerSchema
>;
export type CustomerInlineTypePersonInput = z.infer<
  typeof CustomerInlineTypePersonSchema
>;
export type CustomerInlineWhatsappInput = z.infer<
  typeof CustomerInlineWhatsappSchema
>;
