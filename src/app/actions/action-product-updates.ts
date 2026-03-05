"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { productInlineServiceApi } from "@/services/api-main/product-inline";
import { productUpdateServiceApi } from "@/services/api-main/product-update";

const logger = createLogger("ProductUpdateActions");

/**
 * Server Action: Update product name
 * @param productId - Product ID to update
 * @param name - New product name
 * @returns Success status and error message if any
 */
export async function updateProductName(
  productId: number,
  name: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!name || !name.trim()) {
      return {
        success: false,
        error: "Nome do produto não pode ser vazio",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductNameInline({
      pe_product_id: productId,
      pe_product_name: name.trim(),
      ...apiContext,
    });

    logger.info("Product name updated successfully:", { productId, name });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product name:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar nome do produto";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product short description
 * @param productId - Product ID to update
 * @param shortDescription - New short description
 * @returns Success status and error message if any
 */
export async function updateProductShortDescription(
  productId: number,
  shortDescription: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!shortDescription || !shortDescription.trim()) {
      return {
        success: false,
        error: "Descrição curta não pode ser vazia",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductShortDescriptionInline({
      pe_product_id: productId,
      pe_descricao_curta: shortDescription.trim(),
      ...apiContext,
    });

    logger.info("Product short description updated successfully:", {
      productId,
    });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product short description:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar descrição curta";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product full description
 * @param productId - Product ID to update
 * @param description - New full description
 * @returns Success status and error message if any
 */
export async function updateProductDescription(
  productId: number,
  description: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!description || !description.trim()) {
      return {
        success: false,
        error: "Descrição não pode ser vazia",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductDescriptionInline({
      pe_product_id: productId,
      pe_product_description: description.trim(),
      ...apiContext,
    });

    logger.info("Product description updated successfully:", { productId });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product description:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar descrição completa";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product image path
 * @param productId - Product ID to update
 * @param imagePath - New image path
 * @returns Success status and error message if any
 */
export async function updateProductImagePath(
  productId: number,
  imagePath: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!imagePath || !imagePath.trim()) {
      return {
        success: false,
        error: "Caminho da imagem não pode ser vazio",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductImagePathInline({
      pe_product_id: productId,
      pe_path_imagem: imagePath.trim(),
      ...apiContext,
    });

    logger.info("Product image path updated successfully:", { productId });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product image path:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar caminho da imagem";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product stock
 * @param productId - Product ID to update
 * @param stock - New stock quantity
 * @param minStock - Minimum stock quantity
 * @returns Success status and error message if any
 */
export async function updateProductStock(
  productId: number,
  stock: number,
  minStock: number = 0,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (stock < 0 || minStock < 0) {
      return {
        success: false,
        error: "Estoque não pode ser negativo",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductStockInline({
      pe_product_id: productId,
      pe_stock: stock,
      ...apiContext,
    });

    await productInlineServiceApi.updateProductStockMinInline({
      pe_product_id: productId,
      pe_stock_min: minStock,
      ...apiContext,
    });

    logger.info("Product stock updated successfully:", { productId, stock });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product stock:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar estoque";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product prices
 * @param productId - Product ID to update
 * @param wholesalePrice - Wholesale price
 * @param corporatePrice - Corporate price
 * @param retailPrice - Retail price
 * @returns Success status and error message if any
 */
export async function updateProductPrice(
  productId: number,
  wholesalePrice: number,
  corporatePrice: number,
  retailPrice: number,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (wholesalePrice < 0 || corporatePrice < 0 || retailPrice < 0) {
      return {
        success: false,
        error: "Preços não podem ser negativos",
      };
    }

    const { apiContext } = await getAuthContext();

    await productUpdateServiceApi.updateProductPrice({
      pe_product_id: productId,
      pe_wholesale_price: wholesalePrice,
      pe_corporate_price: corporatePrice,
      pe_retail_price: retailPrice,
      ...apiContext,
    });

    logger.info("Product prices updated successfully:", { productId });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error updating product prices:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar preços";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product type
 * @param productId - Product ID to update
 * @param typeId - New type ID
 * @returns Success status and error message if any
 */
export async function updateProductType(
  productId: number,
  typeId: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!typeId || typeId <= 0) {
      return {
        success: false,
        error: "ID do tipo inválido",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductTypeInline({
      pe_product_id: productId,
      pe_type_id: typeId,
      ...apiContext,
    });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
      message: "Tipo atualizado com sucesso",
    };
  } catch (error) {
    logger.error("Error updating product type:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar tipo";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Update product brand
 * @param productId - Product ID to update
 * @param brandId - New brand ID
 * @returns Success status and error message if any
 */
export async function updateProductBrand(
  productId: number,
  brandId: number,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!productId || productId <= 0) {
      return {
        success: false,
        error: "ID do produto inválido",
      };
    }

    if (!brandId || brandId <= 0) {
      return {
        success: false,
        error: "ID da marca inválido",
      };
    }

    const { apiContext } = await getAuthContext();

    await productInlineServiceApi.updateProductBrandInline({
      pe_product_id: productId,
      pe_brand_id: brandId,
      ...apiContext,
    });

    revalidateTag(CACHE_TAGS.productsBase, "seconds");
    revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");

    return {
      success: true,
      message: "Marca atualizada com sucesso",
    };
  } catch (error) {
    logger.error("Error updating product brand:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao atualizar marca";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
