import { z } from "zod";
import { FIELD_TYPE } from "../types/general-call-types";

const fieldTypeSchema = z.number().int().min(1).max(4);

/**
 * Schema do endpoint `general-table-upd-inl-field`.
 *
 * Os parâmetros de contexto são `.optional()` pois são injetados em runtime
 * a partir da sessão do usuário. Os parâmetros de valor são nullable; apenas
 * o parâmetro correspondente ao `pe_field_type` deve conter o valor.
 */
export const GeneralTableUpdInlFieldSchema = z
  .object({
    // Parâmetros de contexto (opcionais no schema, obrigatórios na API)
    pe_system_client_id: z.number().int().min(0).optional(),
    pe_organization_id: z.string().max(200).optional(),
    pe_user_id: z.string().max(200).optional(),
    pe_user_name: z.string().max(200).optional(),
    pe_user_role: z.string().max(200).optional(),
    pe_person_id: z.number().optional(),

    // Parâmetros específicos da operação
    pe_table_name: z.string().min(1).max(64),
    pe_primary_key_field: z.string().min(1).max(64),
    pe_register_id: z.number().int().positive(),
    pe_field_type: fieldTypeSchema,
    pe_field: z.string().min(1).max(64),

    // Parâmetros de valor (apenas um deve ser preenchido conforme pe_field_type)
    pe_value_str: z.string().nullable().optional(),
    pe_value_int: z.number().nullable().optional(),
    pe_value_numeric: z.number().nullable().optional(),
    pe_value_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const {
      pe_field_type,
      pe_value_str,
      pe_value_int,
      pe_value_numeric,
      pe_value_date,
    } = data;

    if (pe_field_type === FIELD_TYPE.STRING && pe_value_str == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_str"],
        message:
          "pe_value_str é obrigatório quando pe_field_type = 1 (string).",
      });
    }
    if (pe_field_type === FIELD_TYPE.BIGINT && pe_value_int == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_int"],
        message:
          "pe_value_int é obrigatório quando pe_field_type = 2 (bigint).",
      });
    }
    if (pe_field_type === FIELD_TYPE.DECIMAL && pe_value_numeric == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_numeric"],
        message:
          "pe_value_numeric é obrigatório quando pe_field_type = 3 (decimal).",
      });
    }
    if (pe_field_type === FIELD_TYPE.DATE && pe_value_date == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pe_value_date"],
        message: "pe_value_date é obrigatório quando pe_field_type = 4 (date).",
      });
    }
  });

export type GeneralTableUpdInlFieldInput = z.infer<
  typeof GeneralTableUpdInlFieldSchema
>;
