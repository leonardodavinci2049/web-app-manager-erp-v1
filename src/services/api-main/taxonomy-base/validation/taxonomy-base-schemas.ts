import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
};

export const TaxonomyFindAllSchema = z.object({
  ...baseContextSchema,
  pe_parent_id: z.number().int().optional(),
  pe_search: z.string().max(300).optional(),
  pe_flag_inactive: z.number().int().min(0).max(1).optional(),
  pe_records_quantity: z.number().int().positive().optional(),
  pe_page_id: z.number().int().min(0).optional(),
  pe_column_id: z.number().int().optional(),
  pe_order_id: z.number().int().optional(),
});

export const TaxonomyFindByIdSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
});

export const TaxonomyFindMenuSchema = z.object({
  ...baseContextSchema,
  pe_type_id: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0),
});

export const TaxonomyCreateSchema = z.object({
  ...baseContextSchema,
  pe_type_id: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0),
  pe_taxonomy_name: z.string().max(100).min(1),
  pe_slug: z.string().max(300).min(1),
  pe_level: z.number().int().optional(),
});

export const TaxonomyUpdateSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
  pe_parent_id: z.number().int().min(0),
  pe_taxonomy_name: z.string().max(100).min(1),
  pe_slug: z.string().max(300).min(1),
  pe_image_path: z.string().max(300).optional(),
  pe_sort_order: z.number().int().optional(),
  pe_meta_title: z.string().max(300).optional(),
  pe_meta_description: z.string().max(500).optional(),
  pe_inactive: z.number().int().min(0).max(1).optional(),
  pe_info: z.string().optional(),
});

export const TaxonomyDeleteSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
});

export const TaxonomyUpdateMetadataSchema = z.object({
  ...baseContextSchema,
  pe_taxonomy_id: z.number().int().positive(),
  pe_meta_title: z.string().max(300).optional(),
  pe_meta_description: z.string().max(500).optional(),
  pe_meta_keywords: z.string().max(500).optional(),
});

export type TaxonomyFindAllInput = z.infer<typeof TaxonomyFindAllSchema>;
export type TaxonomyFindByIdInput = z.infer<typeof TaxonomyFindByIdSchema>;
export type TaxonomyFindMenuInput = z.infer<typeof TaxonomyFindMenuSchema>;
export type TaxonomyCreateInput = z.infer<typeof TaxonomyCreateSchema>;
export type TaxonomyUpdateInput = z.infer<typeof TaxonomyUpdateSchema>;
export type TaxonomyDeleteInput = z.infer<typeof TaxonomyDeleteSchema>;
export type TaxonomyUpdateMetadataInput = z.infer<
  typeof TaxonomyUpdateMetadataSchema
>;
