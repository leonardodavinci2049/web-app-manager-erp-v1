"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { getAuthContext } from "@/server/auth-context";
import { taxonomyRelServiceApi } from "@/services/api-main/taxonomy-rel";
import {
  transformTaxonomyRelProductList,
  type UITaxonomyRelProduct,
} from "@/services/api-main/taxonomy-rel/transformers/transformers";

const logger = createLogger("TaxonomyActions");

/**
 * Server Action - Create taxonomy relationship (category-product)
 */
export async function createTaxonomyRelationship(
  taxonomyId: number,
  productId: number,
) {
  try {
    const { apiContext } = await getAuthContext();

    await taxonomyRelServiceApi.createTaxonomyRelation({
      pe_taxonomy_id: taxonomyId,
      pe_record_id: productId,
      ...apiContext,
    });

    revalidatePath(`/dashboard/product/${productId}`);
    revalidatePath("/dashboard/product/catalog");

    return {
      success: true,
      message: "Categoria adicionada com sucesso",
    };
  } catch (error) {
    logger.error("Error creating taxonomy relationship:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar categoria ao produto",
    };
  }
}

/**
 * Server Action - Delete taxonomy relationship (category-product)
 */
export async function deleteTaxonomyRelationship(
  taxonomyId: number,
  productId: number,
) {
  try {
    const { apiContext } = await getAuthContext();

    await taxonomyRelServiceApi.deleteTaxonomyRelation({
      pe_taxonomy_id: taxonomyId,
      pe_record_id: productId,
      ...apiContext,
    });

    revalidatePath(`/dashboard/product/${productId}`);
    revalidatePath("/dashboard/product/catalog");

    return {
      success: true,
      message: "Categoria removida com sucesso",
    };
  } catch (error) {
    logger.error("Error deleting taxonomy relationship:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao remover categoria do produto",
    };
  }
}

/**
 * Server Action - Fetch product categories (taxonomies)
 */
export async function fetchProductCategories(productId: number) {
  try {
    const { apiContext } = await getAuthContext();

    const response = await taxonomyRelServiceApi.findAllProductsByTaxonomy({
      pe_record_id: productId,
      ...apiContext,
    });

    const rawItems = taxonomyRelServiceApi.extractProducts(response);
    const categories = transformTaxonomyRelProductList(rawItems);

    return {
      success: true,
      data: categories,
      message: "Categorias carregadas com sucesso",
    };
  } catch (error) {
    logger.error("Error fetching product categories:", error);

    return {
      success: false,
      data: [] as UITaxonomyRelProduct[],
      message:
        error instanceof Error
          ? error.message
          : "Erro ao carregar categorias do produto",
    };
  }
}
