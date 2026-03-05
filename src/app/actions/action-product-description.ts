"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { productInlineServiceApi } from "@/services/api-main/product-inline";

const logger = createLogger("ProductDescriptionActions");

/**
 * Update product description (ANOTACOES field)
 * @param productId - Product ID
 * @param description - New description text
 * @returns Success status and message
 */
export async function updateProductDescription(
  productId: number,
  description: string,
): Promise<{ success: boolean; message: string }> {
  try {
    if (!productId || productId <= 0) {
      return {
        success: false,
        message: "ID do produto inválido",
      };
    }

    const { apiContext } = await getAuthContext();

    logger.info("Iniciando atualização de descrição", {
      productId,
      descriptionLength: description.length,
    });

    await productInlineServiceApi.updateProductDescriptionInline({
      pe_product_id: productId,
      pe_product_description: description,
      ...apiContext,
    });

    logger.info(`Descrição do produto ${productId} atualizada com sucesso`);

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
      message: "Descrição atualizada com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao atualizar descrição do produto", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar descrição",
    };
  }
}
