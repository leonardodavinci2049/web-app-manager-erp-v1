"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { CACHE_TAGS } from "@/lib/cache-config";
import { createLogger } from "@/lib/logger";
import { taxonomyInlineServiceApi } from "@/services/api-main/taxonomy-inline";

const logger = createLogger("CategoryUpdateActions");

async function getSessionContext() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: 1,
    },
  };
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

    if (!name || !name.trim()) {
      return {
        success: false,
        error: "Nome da categoria não pode ser vazio",
      };
    }

    const ctx = await getSessionContext();
    if (!ctx) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await taxonomyInlineServiceApi.updateTaxonomyNameInline({
      pe_taxonomy_id: categoryId,
      pe_taxonomy_name: name.trim(),
      ...ctx.apiContext,
    });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Nome da categoria atualizado com sucesso";

    logger.info("Category name updated successfully:", { categoryId, name });

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(categoryId)), "hours");

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

    const ctx = await getSessionContext();
    if (!ctx) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const response =
      await taxonomyInlineServiceApi.updateTaxonomyParentIdInline({
        pe_taxonomy_id: categoryId,
        pe_parent_id: parentId,
        ...ctx.apiContext,
      });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Categoria pai atualizada com sucesso";

    logger.info("Category parent updated successfully:", {
      categoryId,
      parentId,
    });

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(categoryId)), "hours");

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

    const ctx = await getSessionContext();
    if (!ctx) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await taxonomyInlineServiceApi.updateTaxonomyOrderInline({
      pe_taxonomy_id: categoryId,
      pe_order: order,
      ...ctx.apiContext,
    });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Ordem da categoria atualizada com sucesso";

    logger.info("Category order updated successfully:", { categoryId, order });

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(categoryId)), "hours");

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

    const ctx = await getSessionContext();
    if (!ctx) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const response =
      await taxonomyInlineServiceApi.updateTaxonomyInactiveInline({
        pe_taxonomy_id: categoryId,
        pe_inactive: status,
        ...ctx.apiContext,
      });

    const spResponse =
      taxonomyInlineServiceApi.extractStoredProcedureResult(response);
    const successMessage =
      spResponse?.sp_message || "Status da categoria atualizado com sucesso";

    logger.info("Category status updated successfully:", {
      categoryId,
      status,
    });

    revalidateTag(CACHE_TAGS.taxonomies, "seconds");
    revalidateTag(CACHE_TAGS.taxonomiesMenu, "hours");
    revalidateTag(CACHE_TAGS.taxonomy(String(categoryId)), "hours");

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
