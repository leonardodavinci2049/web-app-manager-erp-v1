"use server";

import { revalidatePath } from "next/cache";
import { updateProductImagePath } from "@/app/actions/action-product-updates";
import { createLogger } from "@/core/logger";
import {
  setPrimaryProductImageAction,
  uploadProductImageAction,
} from "../[id]/_actions/product-image-gallery-actions";
import type { ProductGalleryMutationResult } from "../[id]/_components/image-gallery/image-gallery-types";

const logger = createLogger("ProductListImageActions");
const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Uploads the image selected from the catalog and synchronizes the legacy
 * PATH_IMAGEM pointer used by the product list.
 */
export async function uploadProductListImageAction(
  formData: FormData,
): Promise<ProductGalleryMutationResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size > LISTING_IMAGE_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB.",
    };
  }

  const uploadResult = await uploadProductImageAction(formData);
  if (!uploadResult.success) return uploadResult;

  const productId = Number(formData.get("productId"));
  const assetId = uploadResult.preferredImageId;
  if (!Number.isInteger(productId) || productId <= 0 || !assetId) {
    logger.error("Product list image uploaded without valid identifiers", {
      productId,
      assetId,
    });
    return {
      ...uploadResult,
      warning:
        "A imagem foi enviada, mas não foi possível atualizar a imagem da listagem.",
    };
  }

  const warnings: string[] = [];
  const primaryResult = await setPrimaryProductImageAction(productId, assetId);
  if (!primaryResult.success) {
    warnings.push("não foi possível defini-la como principal");
  }

  const imagePathResult = await updateProductImagePath(productId, assetId);
  if (!imagePathResult.success) {
    warnings.push("não foi possível atualizar PATH_IMAGEM");
  } else {
    revalidatePath("/dashboard/product");
  }

  if (warnings.length > 0) {
    logger.warn("Product list image upload completed with warnings", {
      productId,
      assetId,
      warnings,
    });
    return {
      success: true,
      message: uploadResult.message,
      preferredImageId: assetId,
      warning: `A imagem foi enviada, mas ${warnings.join(" e ")}.`,
    };
  }

  return {
    success: true,
    message: "Imagem enviada e definida como imagem das listagens.",
    preferredImageId: assetId,
  };
}
