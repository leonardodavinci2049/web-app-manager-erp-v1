import { z } from "zod";

export const UpdateProductBrandInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_brand_id: z.number().int().positive(),
});

export const UpdateProductDescriptionInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_product_description: z.string().min(1),
});

export const UpdateProductNameInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_product_name: z.string().max(300).min(1),
});

export const UpdateProductImagePathInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_path_imagem: z.string().max(300).min(1),
});

export const UpdateProductShortDescriptionInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_descricao_curta: z.string().max(300).min(1),
});

export const UpdateProductStockMinInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_stock_min: z.number().int().min(0),
});

export const UpdateProductStockInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_stock: z.number().int().min(0),
});

export const UpdateProductTypeInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_type_id: z.number().int().positive(),
});

export const UpdateProductVariousInlineSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_product_id: z.number().int().positive(),
  pe_termo: z.string().max(300).min(1),
});

export type UpdateProductBrandInlineInput = z.infer<
  typeof UpdateProductBrandInlineSchema
>;
export type UpdateProductDescriptionInlineInput = z.infer<
  typeof UpdateProductDescriptionInlineSchema
>;
export type UpdateProductNameInlineInput = z.infer<
  typeof UpdateProductNameInlineSchema
>;
export type UpdateProductImagePathInlineInput = z.infer<
  typeof UpdateProductImagePathInlineSchema
>;
export type UpdateProductShortDescriptionInlineInput = z.infer<
  typeof UpdateProductShortDescriptionInlineSchema
>;
export type UpdateProductStockMinInlineInput = z.infer<
  typeof UpdateProductStockMinInlineSchema
>;
export type UpdateProductStockInlineInput = z.infer<
  typeof UpdateProductStockInlineSchema
>;
export type UpdateProductTypeInlineInput = z.infer<
  typeof UpdateProductTypeInlineSchema
>;
export type UpdateProductVariousInlineInput = z.infer<
  typeof UpdateProductVariousInlineSchema
>;
