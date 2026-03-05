import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const TaxonomyRelFindAllProductsSchema = z.object({
  ...baseContextSchema,
  pe_record_id: z.number().int().positive(),
});

export const TaxonomyRelCreateSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
  pe_record_id: z.number().int().positive(),
});

export const TaxonomyRelDeleteSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
  pe_record_id: z.number().int().positive(),
});

export type TaxonomyRelFindAllProductsInput = z.infer<
  typeof TaxonomyRelFindAllProductsSchema
>;
export type TaxonomyRelCreateInput = z.infer<typeof TaxonomyRelCreateSchema>;
export type TaxonomyRelDeleteInput = z.infer<typeof TaxonomyRelDeleteSchema>;
