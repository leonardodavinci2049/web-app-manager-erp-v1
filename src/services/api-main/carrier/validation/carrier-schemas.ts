import { z } from "zod";

export const CarrierFindAllSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_search: z.string().max(300).optional(),
  pe_limit: z.number().int().positive().optional(),
});

export const CarrierFindByIdSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_carrier_id: z.number().int().positive(),
});

export const CarrierCreateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_type_person_id: z.number().int().optional(),
  pe_name: z.string().max(300).optional(),
  pe_phone: z.string().max(100).optional(),
  pe_whatsapp: z.string().max(100).optional(),
  pe_email: z.string().max(100).optional(),
  pe_website: z.string().max(300).optional(),
  pe_cnpj: z.string().max(100).optional(),
  pe_company_name: z.string().max(300).optional(),
  pe_responsible_name: z.string().max(300).optional(),
  pe_cpf: z.string().max(100).optional(),
  pe_image_path: z.string().max(300).optional(),
});

export const CarrierUpdateSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_carrier_id: z.number().int().positive(),
  pe_type_person_id: z.number().int().optional(),
  pe_carrier_name: z.string().max(300).optional(),
  pe_phone: z.string().max(100).optional(),
  pe_whatsapp: z.string().max(100).optional(),
  pe_email: z.string().max(100).optional(),
  pe_website: z.string().max(300).optional(),
  pe_cnpj: z.string().max(100).optional(),
  pe_company_name: z.string().max(300).optional(),
  pe_responsible_name: z.string().max(300).optional(),
  pe_cpf: z.string().max(100).optional(),
  pe_image_path: z.string().max(300).optional(),
  pe_notes: z.string().optional(),
});

export const CarrierDeleteSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_carrier_id: z.number().int().positive(),
});

export type CarrierFindAllInput = z.infer<typeof CarrierFindAllSchema>;
export type CarrierFindByIdInput = z.infer<typeof CarrierFindByIdSchema>;
export type CarrierCreateInput = z.infer<typeof CarrierCreateSchema>;
export type CarrierUpdateInput = z.infer<typeof CarrierUpdateSchema>;
export type CarrierDeleteInput = z.infer<typeof CarrierDeleteSchema>;
