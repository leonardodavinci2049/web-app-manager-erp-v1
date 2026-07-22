import { z } from "zod";

export const detailFormSchema = z.object({
  name: z.string().trim().min(2, "Informe ao menos 2 caracteres.").max(100),
  slug: z.string().trim().min(1, "Informe o slug.").max(300),
  order: z.number().int().min(1, "A ordem deve ser maior que zero."),
  metaTitle: z.string().max(300),
  metaDescription: z.string().max(500),
  notes: z.string().max(2000),
});

export type DetailFormValues = z.infer<typeof detailFormSchema>;
