"use server";

import { revalidateTag } from "next/cache";
import { createLogger } from "@/core/logger";
import { CACHE_TAGS } from "@/lib/cache-config";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { productInlineServiceApi } from "@/services/api-main/product-inline";
import type { FileAsset } from "@/types/api-assets";
import { isApiError } from "@/types/api-assets";
import { uploadFileAction } from "./action-test-assets";

const logger = createLogger("action-product-images");

/**
 * Helper: atualiza PATH_IMAGEM no produto via novo serviço inline.
 * Lança exceção em caso de erro de SP (tratado pelo serviço).
 */
async function updateImagePath(
  productId: number,
  imagePath: string,
  apiContext: Record<string, unknown>,
): Promise<void> {
  await productInlineServiceApi.updateProductImagePathInline({
    pe_product_id: productId,
    pe_path_imagem: imagePath,
    ...apiContext,
  });
  revalidateTag(CACHE_TAGS.productsBase, "seconds");
  revalidateTag(CACHE_TAGS.productBase(String(productId)), "hours");
}

/**
 * Helper function to update product PATH_IMAGEM when a new primary image is set
 */
async function updateProductImagePathIfPrimary(
  productId: number,
  uploadedImageId: string,
  imageUrl: string,
  apiContext: Record<string, unknown>,
): Promise<void> {
  try {
    const galleryResponse = await assetsApiService.getEntityGallery({
      entityType: "PRODUCT",
      entityId: productId.toString(),
    });

    if (isApiError(galleryResponse)) {
      logger.warn(
        `Could not fetch gallery for product ${productId} to check primary image:`,
        galleryResponse.message,
      );
      return;
    }

    const uploadedImage = galleryResponse.images?.find(
      (img) => img.id === uploadedImageId,
    );

    if (!uploadedImage?.isPrimary) {
      logger.debug(
        `Uploaded image ${uploadedImageId} is not primary for product ${productId}. Skipping PATH_IMAGEM update.`,
      );
      return;
    }

    logger.debug(
      `Uploaded image ${uploadedImageId} is primary for product ${productId}. Updating PATH_IMAGEM.`,
    );

    await updateImagePath(productId, imageUrl, apiContext);
    logger.debug(`Successfully updated PATH_IMAGEM for product ${productId}`);
  } catch (error) {
    logger.error(`Error updating PATH_IMAGEM for product ${productId}:`, error);
    throw error;
  }
}

/**
 * Server Actions for Product Image Upload
 * These actions handle file uploads for products using the external Assets API
 */

interface UploadProductImageResponse {
  success: boolean;
  data?: FileAsset;
  error?: string;
}

interface DeleteProductImageResponse {
  success: boolean;
  error?: string;
}

interface SetPrimaryImageResponse {
  success: boolean;
  error?: string;
}

/**
 * Upload image for a product
 * Used by ProductImageGallery component to upload new product images
 *
 * @param formData FormData containing:
 *   - file: File object to upload
 *   - productId: Product ID (will be used as entityId)
 *   - tags: Optional comma-separated tags
 *   - description: Optional image description
 *   - altText: Optional alt text for accessibility
 */
export async function uploadProductImageAction(
  formData: FormData,
): Promise<UploadProductImageResponse> {
  try {
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const tagsString = formData.get("tags") as string;
    const description = formData.get("description") as string;
    const altText = formData.get("altText") as string;

    // Validate required fields
    if (!file || !productId) {
      return {
        success: false,
        error: "Arquivo e ID do produto são obrigatórios",
      };
    }

    // Validate file is actually a file
    if (!(file instanceof File)) {
      return {
        success: false,
        error: "Arquivo inválido",
      };
    }

    // Debug info removed for cleaner console output

    // Create FormData exactly like test page does
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("entityType", "PRODUCT");
    uploadFormData.append("entityId", productId);
    if (tagsString) uploadFormData.append("tags", tagsString);
    if (description) uploadFormData.append("description", description);
    if (altText) uploadFormData.append("altText", altText);

    // FormData logging removed for cleaner console output

    // Call the test assets action that we know works
    const result = await uploadFileAction(uploadFormData);

    // If upload was successful, check if this image became the primary and update PATH_IMAGEM
    if (result.success && result.data?.id && result.data?.urls?.preview) {
      try {
        const { apiContext } = await getAuthContext();
        await updateProductImagePathIfPrimary(
          Number(productId),
          result.data.id,
          result.data.urls.preview,
          apiContext,
        );
      } catch (pathUpdateError) {
        // Log error but don't fail the upload - image was successfully uploaded
        logger.warn(
          `Failed to update PATH_IMAGEM for product ${productId}:`,
          pathUpdateError,
        );
        // Upload was successful, just PATH_IMAGEM update failed
        // This is not critical enough to fail the entire operation
      }
    }

    // Return the result from the working uploadFileAction
    return result;
  } catch (error) {
    console.error("Upload product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao fazer upload da imagem",
    };
  }
}

/**
 * Delete image from a product gallery
 * Used by ProductImageGallery component to delete product images
 *
 * This action:
 * 1. Deletes the image from the Assets API
 * 2. If the deleted image was primary, gets the new primary image from gallery
 * 3. Updates PATH_IMAGEM with the new primary image URL (or clears it if no images left)
 *
 * @param imageId UUID of the image to delete
 * @param productId Product ID (required to update PATH_IMAGEM if primary image is deleted)
 * @param wasPrimary Whether the deleted image was the primary image
 */
export async function deleteProductImageAction(
  imageId: string,
  productId?: string,
  wasPrimary?: boolean,
): Promise<DeleteProductImageResponse> {
  try {
    // Validate required fields
    if (!imageId || typeof imageId !== "string") {
      return {
        success: false,
        error: "ID da imagem é obrigatório",
      };
    }

    // Call the assets API to delete the file
    const result = await assetsApiService.deleteFile({ id: imageId });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to delete image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao excluir imagem",
      };
    }

    // If the deleted image was primary and we have productId, update PATH_IMAGEM
    if (wasPrimary && productId) {
      try {
        const { apiContext } = await getAuthContext();

        // Fetch the updated gallery to get the new primary image
        const galleryResponse = await assetsApiService.getEntityGallery({
          entityType: "PRODUCT",
          entityId: productId,
        });

        if (!isApiError(galleryResponse)) {
          const newPrimaryImage = galleryResponse.images?.find(
            (img) => img.isPrimary,
          );

          if (newPrimaryImage?.urls?.preview) {
            logger.debug(
              `Updating PATH_IMAGEM for product ${productId} with new primary image: ${newPrimaryImage.urls.preview}`,
            );
            try {
              await updateImagePath(
                Number(productId),
                newPrimaryImage.urls.preview,
                apiContext,
              );
            } catch (updateError) {
              logger.warn(
                `Failed to update PATH_IMAGEM for product ${productId}:`,
                updateError,
              );
            }
          } else if (
            !galleryResponse.images ||
            galleryResponse.images.length === 0
          ) {
            logger.debug(
              `No images left for product ${productId}. Clearing PATH_IMAGEM.`,
            );
            try {
              await updateImagePath(Number(productId), "", apiContext);
            } catch (updateError) {
              logger.warn(
                `Failed to clear PATH_IMAGEM for product ${productId}:`,
                updateError,
              );
            }
          } else {
            const firstImage = galleryResponse.images[0];
            if (firstImage?.urls?.preview) {
              logger.warn(
                `No primary image found for product ${productId} after deletion. Using first image as fallback.`,
              );
              try {
                await updateImagePath(
                  Number(productId),
                  firstImage.urls.preview,
                  apiContext,
                );
              } catch (updateError) {
                logger.warn(
                  `Failed to update PATH_IMAGEM for product ${productId}:`,
                  updateError,
                );
              }
            }
          }
        }
      } catch (pathUpdateError) {
        logger.warn(
          `Failed to update PATH_IMAGEM after deleting primary image for product ${productId}:`,
          pathUpdateError,
        );
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Delete product image action error:", error);
    return {
      success: false,
      error: "Erro interno ao excluir imagem",
    };
  }
}

/**
 * Set image as primary for a product
 * Used by ProductImageGallery component to promote images to primary
 *
 * This action:
 * 1. Sets the image as primary in the Assets API
 * 2. Updates the product's PATH_IMAGEM field with the new primary image URL
 *
 * @param productId Product ID
 * @param imageId UUID of the image to set as primary
 */
export async function setPrimaryImageAction(
  productId: string,
  imageId: string,
): Promise<SetPrimaryImageResponse> {
  try {
    // Validate required fields
    if (!productId || !imageId) {
      return {
        success: false,
        error: "ID do produto e da imagem são obrigatórios",
      };
    }

    // Call the assets API to set primary image
    const result = await assetsApiService.setPrimaryImage({
      entityType: "PRODUCT",
      entityId: productId,
      assetId: imageId,
      displayOrder: 1,
    });

    // Check if response is an error
    if (isApiError(result)) {
      logger.warn(`Failed to set primary image ${imageId}: ${result.message}`);
      return {
        success: false,
        error: Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Erro ao definir imagem principal",
      };
    }

    // Get the image details to retrieve its URL for PATH_IMAGEM update
    const imageDetails = await assetsApiService.findFile({ id: imageId });

    if (!isApiError(imageDetails) && imageDetails.urls?.preview) {
      try {
        const { apiContext } = await getAuthContext();
        await updateImagePath(
          Number(productId),
          imageDetails.urls.preview,
          apiContext,
        );
      } catch (pathUpdateError) {
        logger.warn(
          `Failed to update PATH_IMAGEM for product ${productId}:`,
          pathUpdateError,
        );
      }
    } else {
      logger.warn(
        `Could not retrieve image details for ${imageId} to update PATH_IMAGEM`,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Set primary image action error:", error);
    return {
      success: false,
      error: "Erro interno ao definir imagem principal",
    };
  }
}
