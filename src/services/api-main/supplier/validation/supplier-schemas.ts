import { z } from "zod";

export const SupplierFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const SupplierFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_id: z.number().int().positive(),
});

export const SupplierCreateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_name: z.string().max(100).min(1),
  pe_slug: z.string().max(300).min(1),
});

export const SupplierUpdateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_id: z.number().int().positive(),
  pe_supplier: z.string().max(100).optional(),
  pe_notes: z.string().optional(),
  pe_inactive: z.number().int().min(0).max(1).optional(),
});

export const SupplierDeleteSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_id: z.number().int().positive(),
});

export const SupplierRelCreateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_id: z.number().int().positive(),
  pe_product_id: z.number().int().positive(),
  pe_supplier_code: z.string().max(200).min(1),
});

export const SupplierRelDeleteSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_supplier_id: z.number().int().positive(),
  pe_product_id: z.number().int().positive(),
});

export const SupplierRelFindProdAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export type SupplierFindAllInput = z.infer<typeof SupplierFindAllSchema>;
export type SupplierFindByIdInput = z.infer<typeof SupplierFindByIdSchema>;
export type SupplierCreateInput = z.infer<typeof SupplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof SupplierUpdateSchema>;
export type SupplierDeleteInput = z.infer<typeof SupplierDeleteSchema>;
export type SupplierRelCreateInput = z.infer<typeof SupplierRelCreateSchema>;
export type SupplierRelDeleteInput = z.infer<typeof SupplierRelDeleteSchema>;
export type SupplierRelFindProdAllInput = z.infer<
  typeof SupplierRelFindProdAllSchema
>;
