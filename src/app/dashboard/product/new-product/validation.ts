/**
 * Schema de validação para criação de novo produto
 */

import { z } from "zod";

/**
 * Schema para validação do formulário de criação de produto
 */
export const CreateProductFormSchema = z.object({
  // Campos obrigatórios
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome não pode ter mais de 200 caracteres")
    .trim(),

  // Slug agora é opcional - será gerado automaticamente no servidor
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(100, "Slug não pode ter mais de 100 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    )
    .trim()
    .optional(),

  // Campos opcionais
  reference: z
    .string()
    .max(50, "Referência não pode ter mais de 50 caracteres")
    .optional(),

  model: z
    .string()
    .max(100, "Modelo não pode ter mais de 100 caracteres")
    .optional(),

  description: z
    .string()
    .max(1000, "Descrição não pode ter mais de 1000 caracteres")
    .optional(),

  tags: z
    .string()
    .max(200, "Etiquetas não podem ter mais de 200 caracteres")
    .optional(),

  brandId: z
    .number()
    .int()
    .min(0, "ID da marca deve ser maior ou igual a 0")
    .optional(),

  retailPrice: z
    .number()
    .min(0, "Preço deve ser maior ou igual a 0")
    .optional(),

  stock: z
    .number()
    .int()
    .min(0, "Estoque deve ser maior ou igual a 0")
    .optional(),

  businessType: z
    .number()
    .int()
    .min(1, "Tipo de negócio deve ser um valor válido"),

  additionalInfo: z
    .string()
    .max(500, "Informações adicionais não podem ter mais de 500 caracteres")
    .optional(),
});

/**
 * Tipo inferido do schema de validação
 */
export type CreateProductFormData = z.infer<typeof CreateProductFormSchema>;

/**

/**
 * Função para validar e formatar preço
 * @param value Valor do preço como string ou número
 * @returns Preço formatado como número
 */
export function formatPrice(value: string | number): number {
  if (typeof value === "number") {
    return Math.max(0, value);
  }

  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleaned = value.replace(/[^\d.,]/g, "");

  // Substitui vírgula por ponto para conversão
  const normalized = cleaned.replace(",", ".");

  const parsed = Number.parseFloat(normalized);

  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Função para validar e formatar quantidade de estoque
 * @param value Valor do estoque como string ou número
 * @returns Quantidade formatada como número inteiro
 */
export function formatStock(value: string | number): number {
  if (typeof value === "number") {
    return Math.max(0, Math.floor(value));
  }

  // Remove caracteres não numéricos
  const cleaned = value.replace(/[^\d]/g, "");

  const parsed = Number.parseInt(cleaned, 10);

  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Função para limpar e formatar tags
 * @param tags String com tags separadas por vírgula
 * @returns Tags formatadas e limpas
 */
export function formatTags(tags: string): string {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .join(", ");
}
