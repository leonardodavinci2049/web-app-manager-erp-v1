/**
 * Schema de validação para operações de categoria
 *
 * Este arquivo centraliza todas as validações relacionadas a categorias/taxonomias,
 * incluindo schemas para criação, atualização e busca.
 * Segue os padrões do projeto com validação dupla (client + server).
 */

import { z } from "zod";

/**
 * Schema para validação do formulário de criação de categoria
 * Contém apenas campos essenciais para criação conforme API Reference
 */
export const CreateCategoryFormSchema = z.object({
  // Campo obrigatório: Nome da categoria
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres")
    .trim(),

  // Campo obrigatório: ID da categoria pai (0 = raiz)
  parentId: z
    .number()
    .int()
    .min(0, "ID da categoria pai deve ser maior ou igual a 0"),
});

/**
 * Schema para validação de Server Action (FormData)
 * Usado para validar dados vindos do Next.js Form component
 */
export const CreateCategoryServerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  parentId: z.coerce.number().int().min(0),
});

/**
 * Tipo inferido do schema de validação do formulário
 */
export type CreateCategoryFormData = z.infer<typeof CreateCategoryFormSchema>;

/**
 * Tipo inferido do schema de validação do servidor
 */
export type CreateCategoryServerData = z.infer<
  typeof CreateCategoryServerSchema
>;

/**
 * Função para gerar slug automaticamente baseado no nome
 * @param name Nome da categoria
 * @returns Slug formatado
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Substituir espaços por hífens
    .replace(/[^a-z0-9-]/g, "") // Remover caracteres especiais
    .replace(/-+/g, "-") // Remover hífens duplicados
    .replace(/^-|-$/g, ""); // Remover hífens do início e fim
}

/**
 * Função para calcular o nível baseado na categoria pai
 * @param parentId ID da categoria pai
 * @param categories Lista de categorias disponíveis
 * @returns Nível calculado
 */
export function calculateLevelFromParent(
  parentId: number,
  categories: Array<{ ID_TAXONOMY: number; LEVEL?: number | null }>,
): number {
  if (parentId === 0) {
    return 1; // Categoria raiz
  }

  const parent = categories.find((cat) => cat.ID_TAXONOMY === parentId);
  if (!parent?.LEVEL) {
    return 1; // Fallback para categoria raiz
  }

  return Math.min(parent.LEVEL + 1, 5); // Máximo 5 níveis
}
