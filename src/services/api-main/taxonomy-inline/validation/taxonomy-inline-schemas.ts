import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_taxonomy_id: z.number().int().positive(),
};

export const UpdateTaxonomyImagePathInlineSchema = z.object({
  ...baseContextSchema,
  pe_image_path: z.string().max(300).min(1),
});

export const UpdateTaxonomyInactiveInlineSchema = z.object({
  ...baseContextSchema,
  pe_inactive: z.number().int(),
});

export const UpdateTaxonomyNameInlineSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_name: z.string().max(300).min(1),
});

export const UpdateTaxonomyNotesInlineSchema = z.object({
  ...baseContextSchema,
  pe_notes: z.string().max(500).optional(),
});

export const UpdateTaxonomyOrderInlineSchema = z.object({
  ...baseContextSchema,
  pe_order: z.number().int(),
});

export const UpdateTaxonomyParentIdInlineSchema = z.object({
  ...baseContextSchema,
  pe_parent_id: z.number().int().optional(),
});

export const UpdateTaxonomyQtProductsInlineSchema = z.object({
  ...baseContextSchema,
  pe_qt_products: z.number().int(),
});

export const UpdateTaxonomySlugInlineSchema = z.object({
  ...baseContextSchema,
  pe_slug: z.string().max(300).min(1),
});

export type UpdateTaxonomyImagePathInlineInput = z.infer<
  typeof UpdateTaxonomyImagePathInlineSchema
>;
export type UpdateTaxonomyInactiveInlineInput = z.infer<
  typeof UpdateTaxonomyInactiveInlineSchema
>;
export type UpdateTaxonomyNameInlineInput = z.infer<
  typeof UpdateTaxonomyNameInlineSchema
>;
export type UpdateTaxonomyNotesInlineInput = z.infer<
  typeof UpdateTaxonomyNotesInlineSchema
>;
export type UpdateTaxonomyOrderInlineInput = z.infer<
  typeof UpdateTaxonomyOrderInlineSchema
>;
export type UpdateTaxonomyParentIdInlineInput = z.infer<
  typeof UpdateTaxonomyParentIdInlineSchema
>;
export type UpdateTaxonomyQtProductsInlineInput = z.infer<
  typeof UpdateTaxonomyQtProductsInlineSchema
>;
export type UpdateTaxonomySlugInlineInput = z.infer<
  typeof UpdateTaxonomySlugInlineSchema
>;
