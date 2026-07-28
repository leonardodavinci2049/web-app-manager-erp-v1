import { z } from "zod";

export const CheckTermSchema = z.object({
  pe_system_client_id: z.number().int().min(0).optional(),
  pe_organization_id: z.string().max(200).optional(),
  pe_user_id: z.string().max(200).optional(),
  pe_user_name: z.string().max(200).optional(),
  pe_user_role: z.string().max(200).optional(),
  pe_person_id: z.number().optional(),
  pe_parent_id: z.number().optional(),
  pe_term: z.string().min(3),
});

export type CheckTermInput = z.infer<typeof CheckTermSchema>;
