"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { getProductManagerById } from "@/services/api-main/product-manager/product-manager-service-api";
import {
  getTaxonomyById,
  getTaxonomyMenu,
  taxonomyBaseServiceApi,
} from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import { taxonomyInlineServiceApi } from "@/services/api-main/taxonomy-inline";
import { taxonomyRelServiceApi } from "@/services/api-main/taxonomy-rel";
import type { CategoryActionResult } from "../_components/category-types";

const logger = createLogger("CategoryDashboardActions");
const CATEGORY_PATH = "/dashboard/category";
const PRODUCT_TAXONOMY_TYPE_ID = 1;

const categoryIdSchema = z.number().int().positive();
const categoryFormSchema = z.object({
  id: categoryIdSchema,
  parentId: z.number().int().min(0),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(1).max(300),
  order: z.number().int().min(1),
  metaTitle: z.string().trim().max(300),
  metaDescription: z.string().trim().max(500),
  notes: z.string().trim().max(2000),
  imagePath: z.string().trim().max(500),
  inactive: z.boolean(),
});

function safeFailure(message: string, error?: unknown): CategoryActionResult {
  if (error) logger.error(message, error);
  return { success: false, message };
}

function revalidateCategoryDashboard(): void {
  revalidatePath(CATEGORY_PATH);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategoryName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

async function getCategoryContext() {
  const authContext = await getAuthContext();
  const categories = await getTaxonomyMenu(
    PRODUCT_TAXONOMY_TYPE_ID,
    0,
    authContext.apiContext,
  );
  return { ...authContext, categories };
}

export async function createCategoryAction(input: {
  name: string;
  parentId: number;
}): Promise<CategoryActionResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(100),
      parentId: z.number().int().min(0),
    })
    .safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos informados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const { apiContext, categories } = await getCategoryContext();
    const parent = categories.find(
      (category) => category.id === parsed.data.parentId,
    );
    if (parsed.data.parentId !== 0 && !parent)
      return safeFailure("A categoria pai selecionada não existe.");
    const normalizedName = normalizeCategoryName(parsed.data.name);
    if (
      categories.some(
        (category) =>
          category.parentId === parsed.data.parentId &&
          normalizeCategoryName(category.name) === normalizedName,
      )
    )
      return safeFailure("Já existe uma categoria com este nome neste nível.");
    const level = parent ? parent.level + 1 : 1;
    if (level > 3)
      return safeFailure("Subgrupos são o terceiro e último nível permitido.");

    const response = await taxonomyBaseServiceApi.createTaxonomy({
      pe_type_id: PRODUCT_TAXONOMY_TYPE_ID,
      pe_parent_id: parsed.data.parentId,
      pe_taxonomy_name: parsed.data.name,
      pe_slug: slugify(parsed.data.name),
      pe_level: level,
      ...apiContext,
    });
    const result =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    revalidateCategoryDashboard();
    return {
      success: true,
      message: result?.sp_message || "Categoria criada com sucesso.",
      categoryId: result?.sp_return_id || response.recordId,
    };
  } catch (error) {
    return safeFailure("Não foi possível criar a categoria.", error);
  }
}

export async function updateCategoryAction(
  input: z.input<typeof categoryFormSchema>,
): Promise<CategoryActionResult> {
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const { apiContext, categories } = await getCategoryContext();
    const current = categories.find(
      (category) => category.id === parsed.data.id,
    );
    if (!current) return safeFailure("Categoria não encontrada.");
    if (current.parentId !== parsed.data.parentId)
      return safeFailure("Use a ação Mover para alterar a categoria pai.");

    const response = await taxonomyBaseServiceApi.updateTaxonomy({
      pe_taxonomy_id: parsed.data.id,
      pe_parent_id: parsed.data.parentId,
      pe_taxonomy_name: parsed.data.name,
      pe_slug: parsed.data.slug,
      pe_image_path: parsed.data.imagePath,
      pe_sort_order: parsed.data.order,
      pe_meta_title: parsed.data.metaTitle,
      pe_meta_description: parsed.data.metaDescription,
      pe_inactive: parsed.data.inactive ? 1 : 0,
      pe_info: parsed.data.notes,
      ...apiContext,
    });
    const result =
      taxonomyBaseServiceApi.extractStoredProcedureResult(response);
    revalidateCategoryDashboard();
    return {
      success: true,
      message: result?.sp_message || "Categoria atualizada com sucesso.",
    };
  } catch (error) {
    return safeFailure("Não foi possível atualizar a categoria.", error);
  }
}

export async function moveCategoryAction(input: {
  categoryId: number;
  parentId: number;
}): Promise<CategoryActionResult> {
  const parsed = z
    .object({ categoryId: categoryIdSchema, parentId: z.number().int().min(0) })
    .safeParse(input);
  if (!parsed.success) return safeFailure("Destino inválido.");

  try {
    const { apiContext, categories } = await getCategoryContext();
    const category = categories.find(
      (item) => item.id === parsed.data.categoryId,
    );
    const parent = categories.find((item) => item.id === parsed.data.parentId);
    if (!category) return safeFailure("Categoria não encontrada.");
    if (category.id === parsed.data.parentId)
      return safeFailure("Uma categoria não pode ser pai dela mesma.");
    if (category.level === 1 && parsed.data.parentId !== 0)
      return safeFailure("Famílias devem permanecer na raiz.");
    if (category.level > 1 && (!parent || parent.level !== category.level - 1))
      return safeFailure("O destino não pertence ao nível permitido.");

    let ancestor = parent;
    const visited = new Set<number>();
    while (ancestor && !visited.has(ancestor.id)) {
      if (ancestor.id === category.id)
        return safeFailure("O destino criaria um ciclo na hierarquia.");
      visited.add(ancestor.id);
      ancestor = categories.find((item) => item.id === ancestor?.parentId);
    }

    await taxonomyInlineServiceApi.updateTaxonomyParentIdInline({
      pe_taxonomy_id: category.id,
      pe_parent_id: parsed.data.parentId,
      ...apiContext,
    });
    revalidateCategoryDashboard();
    return { success: true, message: "Categoria movida com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível mover a categoria.", error);
  }
}

export async function toggleCategoryStatusAction(
  categoryId: number,
): Promise<CategoryActionResult> {
  if (!categoryIdSchema.safeParse(categoryId).success)
    return safeFailure("Categoria inválida.");
  try {
    const { apiContext } = await getAuthContext();
    const category = await getTaxonomyById(categoryId, apiContext);
    if (!category) return safeFailure("Categoria não encontrada.");
    await taxonomyInlineServiceApi.updateTaxonomyInactiveInline({
      pe_taxonomy_id: categoryId,
      pe_inactive: category.inactive ? 0 : 1,
      ...apiContext,
    });
    revalidateCategoryDashboard();
    return {
      success: true,
      message: category.inactive
        ? "Categoria ativada."
        : "Categoria inativada.",
    };
  } catch (error) {
    return safeFailure("Não foi possível alterar o status.", error);
  }
}

export async function deleteCategoryAction(
  categoryId: number,
): Promise<CategoryActionResult> {
  if (!categoryIdSchema.safeParse(categoryId).success)
    return safeFailure("Categoria inválida.");
  try {
    const { apiContext, categories } = await getCategoryContext();
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return safeFailure("Categoria não encontrada.");
    if (categories.some((item) => item.parentId === categoryId))
      return safeFailure(
        "Remova ou mova as categorias filhas antes de excluir.",
      );
    if ((category.productCount ?? 0) > 0)
      return safeFailure(
        "Desvincule os produtos antes de excluir a categoria.",
      );

    await taxonomyBaseServiceApi.deleteTaxonomy({
      pe_taxonomy_id: categoryId,
      ...apiContext,
    });
    revalidateCategoryDashboard();
    return { success: true, message: "Categoria excluída com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível excluir a categoria.", error);
  }
}

export async function linkProductAction(input: {
  categoryId: number;
  productId: number;
}): Promise<CategoryActionResult> {
  const parsed = z
    .object({
      categoryId: categoryIdSchema,
      productId: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success) return safeFailure("Categoria ou produto inválido.");
  try {
    const { apiContext, categories } = await getCategoryContext();
    if (!categories.some((item) => item.id === parsed.data.categoryId))
      return safeFailure("Categoria não encontrada.");
    const product = await getProductManagerById(
      parsed.data.productId,
      apiContext,
    );
    if (!product) return safeFailure("Produto não encontrado.");
    if (
      product.relatedCategories.some(
        (item) => item.taxonomyId === parsed.data.categoryId,
      )
    )
      return safeFailure("Este produto já está vinculado à categoria.");

    await taxonomyRelServiceApi.createTaxonomyRelation({
      pe_taxonomy_id: parsed.data.categoryId,
      pe_record_id: parsed.data.productId,
      ...apiContext,
    });
    revalidateCategoryDashboard();
    return { success: true, message: "Produto vinculado com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível vincular o produto.", error);
  }
}

export async function unlinkProductAction(input: {
  categoryId: number;
  productId: number;
}): Promise<CategoryActionResult> {
  const parsed = z
    .object({
      categoryId: categoryIdSchema,
      productId: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success) return safeFailure("Categoria ou produto inválido.");
  try {
    const { apiContext, categories } = await getCategoryContext();
    if (!categories.some((item) => item.id === parsed.data.categoryId))
      return safeFailure("Categoria não encontrada.");
    const product = await getProductManagerById(
      parsed.data.productId,
      apiContext,
    );
    if (!product) return safeFailure("Produto não encontrado.");
    if (
      !product.relatedCategories.some(
        (item) => item.taxonomyId === parsed.data.categoryId,
      )
    )
      return safeFailure(
        "O produto não possui vínculo direto com esta categoria.",
      );

    await taxonomyRelServiceApi.deleteTaxonomyRelation({
      pe_taxonomy_id: parsed.data.categoryId,
      pe_record_id: parsed.data.productId,
      ...apiContext,
    });
    revalidateCategoryDashboard();
    return { success: true, message: "Vínculo removido com sucesso." };
  } catch (error) {
    return safeFailure("Não foi possível remover o vínculo.", error);
  }
}
