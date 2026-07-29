import { z } from "zod";

export const PtypeCreateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type: z.string().max(100).min(1),
  pe_slug: z.string().max(300).min(1),
});

export const PtypeFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const PtypeSearchAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(100).optional(),
});

export const PtypeFindManagerAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(100).optional(),
  pe_status_id: z.number().int().min(0).optional(),
  pe_qt_records: z.number().int().optional(),
  pe_page_id: z.number().int().optional(),
  pe_column_id: z.number().int().optional(),
  pe_order_id: z.number().int().optional(),
});

export const PtypeFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type_id: z.number().int().positive(),
});

export const PtypeUpdateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type_id: z.number().int().positive(),
  pe_type: z.string().max(100).optional(),
  pe_slug: z.string().max(100).optional(),
  pe_notes: z.string().optional(),
  pe_inactive: z.number().int().min(0).max(1).optional(),
});

export const PtypeDeleteSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type_id: z.number().int().positive(),
});

export type PtypeCreateInput = z.infer<typeof PtypeCreateSchema>;
export type PtypeFindAllInput = z.infer<typeof PtypeFindAllSchema>;
export type PtypeSearchAllInput = z.infer<typeof PtypeSearchAllSchema>;
export type PtypeFindManagerAllInput = z.infer<
  typeof PtypeFindManagerAllSchema
>;
export type PtypeFindByIdInput = z.infer<typeof PtypeFindByIdSchema>;
export type PtypeUpdateInput = z.infer<typeof PtypeUpdateSchema>;
export type PtypeDeleteInput = z.infer<typeof PtypeDeleteSchema>;
