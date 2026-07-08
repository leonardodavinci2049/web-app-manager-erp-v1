"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { taxonomyInlineServiceApi } from "@/services/api-main/taxonomy-inline";

const logger = createLogger("CategoryUpdateActions");
const CATEGORY_LIST_PATH = "/dashboard/category/category-list";
const CATEGORY_OVERVIEWS_PATH = "/dashboard/category/category-overviews";

function revalidateCategoryPaths(): void {
  revalidatePath(CATEGORY_LIST_PATH);
  revalidatePath(CATEGORY_OVERVIEWS_PATH);
}

/**
 * Server Action: Update category name
 * @param categoryId - Category ID to update
 * @param name - New category name
 * @returns Success status and error message if any
 */
export async function updateCategoryName(
  categoryId: number,
  name: string,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "ID da categoria inválido",
      };
    }

    if (!name?.trim()) {
      return {
        success: false,
        error: "Nome da categoria não pode ser vazio",
      };
    }

    const { apiContext } = await getAuthContext();

    const response = await taxonomyInlineServiceApi.updateTaxonomyNameInline({
      pe_taxonomy_id: categoryId,
      pe_taxonomy_name: name.trim(),
      ...apiContext,
    });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Nome da categoria atualizado com sucesso";

    logger.info("Category name updated successfully:", { categoryId, name });

    revalidateCategoryPaths();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Error updating category name:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar nome da categoria";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update category parent ID
 * @param categoryId - Category ID to update
 * @param parentId - New parent category ID (0 for root)
 * @returns Success status and error message if any
 */
export async function updateCategoryParent(
  categoryId: number,
  parentId: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "ID da categoria inválido",
      };
    }

    if (parentId < 0) {
      return {
        success: false,
        error: "ID da categoria pai inválido",
      };
    }

    // Prevent circular reference (category cannot be its own parent)
    if (categoryId === parentId) {
      return {
        success: false,
        error: "Uma categoria não pode ser pai dela mesma",
      };
    }

    const { apiContext } = await getAuthContext();

    const response =
      await taxonomyInlineServiceApi.updateTaxonomyParentIdInline({
        pe_taxonomy_id: categoryId,
        pe_parent_id: parentId,
        ...apiContext,
      });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Categoria pai atualizada com sucesso";

    logger.info("Category parent updated successfully:", {
      categoryId,
      parentId,
    });

    revalidateCategoryPaths();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Error updating category parent:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar categoria pai";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update category order
 * @param categoryId - Category ID to update
 * @param parentId - Parent category ID
 * @param order - New order value
 * @returns Success status and error message if any
 */
export async function updateCategoryOrder(
  categoryId: number,
  parentId: number,
  order: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "ID da categoria inválido",
      };
    }

    if (parentId < 0) {
      return {
        success: false,
        error: "ID da categoria pai inválido",
      };
    }

    if (order < 1) {
      return {
        success: false,
        error: "Ordem deve ser maior que zero",
      };
    }

    const { apiContext } = await getAuthContext();

    const response = await taxonomyInlineServiceApi.updateTaxonomyOrderInline({
      pe_taxonomy_id: categoryId,
      pe_order: order,
      ...apiContext,
    });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Ordem da categoria atualizada com sucesso";

    logger.info("Category order updated successfully:", { categoryId, order });

    revalidateCategoryPaths();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Error updating category order:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar ordem da categoria";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update category status
 * @param categoryId - Category ID to update
 * @param status - New status value (0 = active, 1 = inactive)
 * @returns Success status and error message if any
 */
export async function updateCategoryStatus(
  categoryId: number,
  status: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "ID da categoria inválido",
      };
    }

    if (status !== 0 && status !== 1) {
      return {
        success: false,
        error: "Status deve ser 0 (ativo) ou 1 (inativo)",
      };
    }

    const { apiContext } = await getAuthContext();

    const response =
      await taxonomyInlineServiceApi.updateTaxonomyInactiveInline({
        pe_taxonomy_id: categoryId,
        pe_inactive: status,
        ...apiContext,
      });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Status da categoria atualizado com sucesso";

    logger.info("Category status updated successfully:", {
      categoryId,
      status,
    });

    revalidateCategoryPaths();

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    logger.error("Error updating category status:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar status da categoria";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
