"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { productInlineServiceApi } from "@/services/api-main/product-inline";
import { getProductManagerById } from "@/services/api-main/product-manager/product-manager-service-api";
import {
  PRODUCT_GALLERY_ACCEPTED_MIME_TYPES,
  PRODUCT_GALLERY_ENTITY_TYPE,
  PRODUCT_GALLERY_LIMIT,
  PRODUCT_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { ProductGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("ProductImageGalleryActions");

const ProductIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  productId: ProductIdSchema,
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function sortGalleryImages(images: GalleryImage[]): GalleryImage[] {
  return [...images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }
    return (
      new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
    );
  });
}

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedProductContext(productId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getProductManagerById(productId, {
    ...apiContext,
    pe_type_business: 1,
  });

  return result ? apiContext : null;
}

async function authorizeProduct(productId: number): Promise<boolean> {
  return Boolean(await getAuthorizedProductContext(productId));
}

async function readProductGallery(productId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: PRODUCT_GALLERY_ENTITY_TYPE,
    entityId: productId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected product gallery read", {
      productId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<ProductGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    productId: formData.get("productId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do produto inválido." };
  }

  const { file, productId } = parsedInput.data;
  if (
    !PRODUCT_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof PRODUCT_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > PRODUCT_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const apiContext = await getAuthorizedProductContext(productId);
    if (!apiContext) {
      return {
        success: false,
        error: "Produto não encontrado ou inacessível.",
      };
    }

    const gallery = await readProductGallery(productId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= PRODUCT_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${PRODUCT_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: PRODUCT_GALLERY_ENTITY_TYPE,
      entityId: productId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected product image upload", {
        productId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > 300) {
        logger.error("First product image has an invalid original URL", {
          productId,
          assetId: result.id,
          imagePathLength: imagePath.length,
        });
        return {
          success: true,
          message: `${file.name} foi enviada com sucesso.`,
          preferredImageId: result.id,
          warning:
            "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }

      try {
        await productInlineServiceApi.updateProductImagePathInline({
          pe_product_id: productId,
          pe_path_imagem: imagePath,
          ...apiContext,
        });
        revalidatePath(`/dashboard/product/${productId}`);
        revalidatePath("/dashboard/product");
      } catch (error) {
        logger.error(
          "First product image uploaded but PATH_IMAGEM update failed",
          { productId, assetId: result.id, error },
        );
        return {
          success: true,
          message: `${file.name} foi enviada com sucesso.`,
          preferredImageId: result.id,
          warning:
            "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }
    }

    return {
      success: true,
      message: isFirstImage
        ? `${file.name} foi enviada e definida como imagem das listagens.`
        : `${file.name} foi enviada com sucesso.`,
      preferredImageId: result.id,
    };
  } catch (error) {
    logger.error("Unexpected product image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryProductImageAction(
  rawProductId: number | string,
  rawAssetId: string,
): Promise<ProductGalleryMutationResult> {
  const parsedInput = z
    .object({ productId: ProductIdSchema, assetId: AssetIdSchema })
    .safeParse({ productId: rawProductId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Produto ou imagem inválida." };
  }

  const { assetId, productId } = parsedInput.data;
  try {
    if (!(await authorizeProduct(productId))) {
      return {
        success: false,
        error: "Produto não encontrado ou inacessível.",
      };
    }

    const gallery = await readProductGallery(productId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este produto." };
    }
    if (image.isPrimary) {
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: PRODUCT_GALLERY_ENTITY_TYPE,
      entityId: productId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary product image update", {
        productId,
        assetId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return {
        success: false,
        error: "Não foi possível definir a imagem principal.",
      };
    }

    return {
      success: true,
      message: "Nova imagem principal definida.",
      preferredImageId: assetId,
    };
  } catch (error) {
    logger.error("Unexpected primary product image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function deleteProductImageAction(
  rawProductId: number | string,
  rawAssetId: string,
): Promise<ProductGalleryMutationResult> {
  const parsedInput = z
    .object({ productId: ProductIdSchema, assetId: AssetIdSchema })
    .safeParse({ productId: rawProductId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Produto ou imagem inválida." };
  }

  const { assetId, productId } = parsedInput.data;
  try {
    if (!(await authorizeProduct(productId))) {
      return {
        success: false,
        error: "Produto não encontrado ou inacessível.",
      };
    }

    const gallery = await readProductGallery(productId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este produto." };
    }
    if (gallery.totalImages <= 1 || orderedImages.length <= 1) {
      return {
        success: false,
        error: "A única imagem da galeria não pode ser excluída.",
      };
    }

    const promotionCandidate = orderedImages.find(
      (item) => item.id !== assetId,
    );
    const deleteResult = await assetsApiService.deleteFile({ id: assetId });
    if (isApiError(deleteResult)) {
      logger.warn("Assets API rejected product image deletion", {
        productId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: PRODUCT_GALLERY_ENTITY_TYPE,
        entityId: productId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Product image deleted but primary promotion failed", {
          productId,
          deletedAssetId: assetId,
          candidateAssetId: promotionCandidate.id,
          statusCode: primaryResult.statusCode,
          apiMessage: getSafeApiLogMessage(primaryResult.message),
        });
        return {
          success: true,
          message: "Imagem excluída.",
          preferredImageId: promotionCandidate.id,
          warning:
            "A imagem foi excluída, mas não foi possível confirmar a nova principal.",
        };
      }
    }

    return {
      success: true,
      message: "Imagem excluída com sucesso.",
      preferredImageId: image.isPrimary ? promotionCandidate?.id : undefined,
    };
  } catch (error) {
    logger.error("Unexpected product image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
