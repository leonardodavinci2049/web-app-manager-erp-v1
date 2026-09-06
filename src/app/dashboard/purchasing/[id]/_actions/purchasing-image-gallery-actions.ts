"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { productInlineServiceApi } from "@/services/api-main/product-inline";
import { getPurchasingProductById } from "@/services/api-main/purchasing/purchasing-service-api";
import {
  PURCHASING_GALLERY_ACCEPTED_MIME_TYPES,
  PURCHASING_GALLERY_ENTITY_TYPE,
  PURCHASING_GALLERY_LIMIT,
  PURCHASING_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { PurchasingGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("PurchasingImageGalleryActions");
const PRODUCT_IMAGE_PATH_MAX_LENGTH = 300;
const UploadSchema = z.object({
  productId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function safeApiMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

function revalidateProductImages(productId: number): void {
  revalidatePath("/dashboard/purchasing");
  revalidatePath(`/dashboard/purchasing/${productId}`);
  revalidatePath("/dashboard/product");
  revalidatePath(`/dashboard/product/${productId}`);
}

export async function uploadPurchasingProductImageAction(
  formData: FormData,
): Promise<PurchasingGalleryMutationResult> {
  const parsed = UploadSchema.safeParse({
    productId: formData.get("productId"),
    file: formData.get("file"),
  });
  if (!parsed.success) {
    return { success: false, error: "Arquivo ou ID do produto inválido." };
  }

  const { productId, file } = parsed.data;
  if (
    !PURCHASING_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof PURCHASING_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > PURCHASING_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const { apiContext } = await getAuthContext();
    const authorizedProduct = await getPurchasingProductById(productId, {
      ...apiContext,
      pe_type_business: 1,
    });
    if (!authorizedProduct) {
      return {
        success: false,
        error: "Produto não encontrado ou inacessível.",
      };
    }

    const gallery = await assetsApiService.getEntityGallery({
      entityType: PURCHASING_GALLERY_ENTITY_TYPE,
      entityId: productId.toString(),
    });
    if (isApiError(gallery)) {
      logger.warn("Assets API rejected purchasing gallery read", {
        productId,
        statusCode: gallery.statusCode,
        apiMessage: safeApiMessage(gallery.message),
      });
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= PURCHASING_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${PURCHASING_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const uploaded = await assetsApiService.uploadFile({
      file,
      entityType: PURCHASING_GALLERY_ENTITY_TYPE,
      entityId: productId.toString(),
      altText: `Imagem de ${authorizedProduct.product.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });
    if (isApiError(uploaded)) {
      logger.warn("Assets API rejected purchasing image upload", {
        productId,
        statusCode: uploaded.statusCode,
        apiMessage: safeApiMessage(uploaded.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = uploaded.urls.original.trim();
      if (!imagePath || imagePath.length > PRODUCT_IMAGE_PATH_MAX_LENGTH) {
        logger.error("First purchasing image has an invalid original URL", {
          productId,
          assetId: uploaded.id,
          imagePathLength: imagePath.length,
        });
        revalidateProductImages(productId);
        return {
          success: true,
          message: `${file.name} foi enviada com sucesso.`,
          preferredImageId: uploaded.id,
          warning:
            "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }

      try {
        await productInlineServiceApi.updateProductImagePathInline({
          ...apiContext,
          pe_product_id: productId,
          pe_path_imagem: imagePath,
        });
      } catch (error) {
        logger.error(
          "First purchasing image uploaded but PATH_IMAGEM update failed",
          { productId, assetId: uploaded.id, error },
        );
        revalidateProductImages(productId);
        return {
          success: true,
          message: `${file.name} foi enviada com sucesso.`,
          preferredImageId: uploaded.id,
          warning:
            "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }
    }

    revalidateProductImages(productId);
    return {
      success: true,
      message: isFirstImage
        ? `${file.name} foi enviada e definida como imagem das listagens.`
        : `${file.name} foi enviada com sucesso.`,
      preferredImageId: uploaded.id,
    };
  } catch (error) {
    logger.error("Unexpected purchasing image upload failure", {
      productId,
      error,
    });
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
