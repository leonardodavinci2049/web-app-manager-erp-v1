import { z } from "zod";

const baseContextSchema = {
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
};

export const UpdateProductCharacteristicsSchema = z.object({
  ...baseContextSchema,
  pe_weight_gr: z.number().optional(),
  pe_length_mm: z.number().optional(),
  pe_width_mm: z.number().optional(),
  pe_height_mm: z.number().optional(),
  pe_diameter_mm: z.number().optional(),
  pe_warranty_period_days: z.number().int().optional(),
  pe_warranty_period_months: z.number().int().optional(),
});

export const UpdateProductFlagsSchema = z.object({
  ...baseContextSchema,
  pe_inactive_flag: z.number().int().min(0).max(1).optional(),
  pe_imported_flag: z.number().int().min(0).max(1).optional(),
  pe_physical_control_flag: z.number().int().min(0).max(1).optional(),
  pe_stock_control_flag: z.number().int().min(0).max(1).optional(),
  pe_featured_flag: z.number().int().min(0).max(1).optional(),
  pe_promotion_flag: z.number().int().min(0).max(1).optional(),
  pe_discontinued_flag: z.number().int().min(0).max(1).optional(),
  pe_service_flag: z.number().int().min(0).max(1).optional(),
  pe_website_off_flag: z.number().int().min(0).max(1).optional(),
});

export const UpdateProductGeneralSchema = z.object({
  ...baseContextSchema,
  pe_product_name: z.string().max(255).optional(),
  pe_ref: z.string().max(100).optional(),
  pe_model: z.string().max(100).optional(),
  pe_label: z.string().max(100).optional(),
  pe_tab_description: z.string().max(200).optional(),
});

export const UpdateProductMetadataSchema = z.object({
  ...baseContextSchema,
  pe_meta_title: z.string().max(100).optional(),
  pe_meta_description: z.string().max(200).optional(),
});

export const UpdateProductPriceSchema = z.object({
  ...baseContextSchema,
  pe_wholesale_price: z.number().optional(),
  pe_corporate_price: z.number().optional(),
  pe_retail_price: z.number().optional(),
});

export const UpdateProductTaxValuesSchema = z.object({
  ...baseContextSchema,
  pe_cfop: z.string().max(100).optional(),
  pe_cst: z.string().max(100).optional(),
  pe_ean: z.string().max(100).optional(),
  pe_nbm: z.string().max(100).optional(),
  pe_ncm: z.number().optional(),
  pe_ppb: z.number().optional(),
  pe_temp: z.number().optional(),
});

export type UpdateProductCharacteristicsInput = z.infer<
  typeof UpdateProductCharacteristicsSchema
>;
export type UpdateProductFlagsInput = z.infer<typeof UpdateProductFlagsSchema>;
export type UpdateProductGeneralInput = z.infer<
  typeof UpdateProductGeneralSchema
>;
export type UpdateProductMetadataInput = z.infer<
  typeof UpdateProductMetadataSchema
>;
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>;
export type UpdateProductTaxValuesInput = z.infer<
  typeof UpdateProductTaxValuesSchema
>;
