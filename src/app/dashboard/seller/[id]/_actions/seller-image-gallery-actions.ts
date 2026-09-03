"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import {
  FIELD_TYPE,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import { getSellerById } from "@/services/api-main/seller";
import {
  SELLER_GALLERY_ACCEPTED_MIME_TYPES,
  SELLER_GALLERY_ENTITY_TYPE,
  SELLER_GALLERY_LIMIT,
  SELLER_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { SellerGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("SellerImageGalleryActions");
const SELLER_TABLE_NAME = "tbl_pessoa";
const SELLER_PRIMARY_KEY_FIELD = "ID_TBL_PESSOA";
const SELLER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const SELLER_IMAGE_PATH_MAX_LENGTH = 300;

const SellerIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  sellerId: SellerIdSchema,
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

async function getAuthorizedSellerContext(sellerId: number) {
  const { apiContext } = await getAuthContext();
  const seller = await getSellerById(sellerId, apiContext);

  return seller ? { apiContext, seller } : null;
}

async function updateSellerImagePath(
  sellerId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    ...apiContext,
    pe_table_name: SELLER_TABLE_NAME,
    pe_primary_key_field: SELLER_PRIMARY_KEY_FIELD,
    pe_register_id: sellerId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: SELLER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
  });

  revalidatePath("/dashboard/seller");
  revalidatePath(`/dashboard/seller/${sellerId}`);
}

async function readSellerGallery(sellerId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: SELLER_GALLERY_ENTITY_TYPE,
    entityId: sellerId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected seller gallery read", {
      sellerId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadSellerImageAction(
  formData: FormData,
): Promise<SellerGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    sellerId: formData.get("sellerId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do vendedor inválido." };
  }

  const { file, sellerId } = parsedInput.data;
  if (
    !SELLER_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof SELLER_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > SELLER_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const authorizedSeller = await getAuthorizedSellerContext(sellerId);
    if (!authorizedSeller) {
      return {
        success: false,
        error: "Vendedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSeller;

    const gallery = await readSellerGallery(sellerId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= SELLER_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${SELLER_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: SELLER_GALLERY_ENTITY_TYPE,
      entityId: sellerId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected seller image upload", {
        sellerId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("First seller image has an invalid original URL", {
          sellerId,
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
        await updateSellerImagePath(sellerId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "First seller image uploaded but PATH_IMAGEM update failed",
          { sellerId, assetId: result.id, error },
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
        ? `${file.name} foi enviada e definida como imagem do vendedor.`
        : `${file.name} foi enviada com sucesso.`,
      preferredImageId: result.id,
    };
  } catch (error) {
    logger.error("Unexpected seller image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimarySellerImageAction(
  rawSellerId: number | string,
  rawAssetId: string,
): Promise<SellerGalleryMutationResult> {
  const parsedInput = z
    .object({ sellerId: SellerIdSchema, assetId: AssetIdSchema })
    .safeParse({ sellerId: rawSellerId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Vendedor ou imagem inválida." };
  }

  const { assetId, sellerId } = parsedInput.data;
  try {
    const authorizedSeller = await getAuthorizedSellerContext(sellerId);
    if (!authorizedSeller) {
      return {
        success: false,
        error: "Vendedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSeller;

    const gallery = await readSellerGallery(sellerId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este vendedor." };
    }
    if (image.isPrimary) {
      const imagePath = image.urls.original.trim();
      if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Primary seller image has an invalid original URL", {
          sellerId,
          assetId,
          imagePathLength: imagePath.length,
        });
        return {
          success: true,
          message: "Esta imagem já é a principal.",
          preferredImageId: assetId,
          warning: "Não foi possível atualizar PATH_IMAGEM.",
        };
      }
      try {
        await updateSellerImagePath(sellerId, imagePath, apiContext);
      } catch (error) {
        logger.error("Primary seller image PATH_IMAGEM repair failed", {
          sellerId,
          assetId,
          error,
        });
        return {
          success: true,
          message: "Esta imagem já é a principal.",
          preferredImageId: assetId,
          warning: "Não foi possível atualizar PATH_IMAGEM.",
        };
      }
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: SELLER_GALLERY_ENTITY_TYPE,
      entityId: sellerId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary seller image update", {
        sellerId,
        assetId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return {
        success: false,
        error: "Não foi possível definir a imagem principal.",
      };
    }

    const imagePath = image.urls.original.trim();
    if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary seller image has an invalid original URL", {
        sellerId,
        assetId,
        imagePathLength: imagePath.length,
      });
      return {
        success: true,
        message: "Nova imagem principal definida.",
        preferredImageId: assetId,
        warning:
          "A imagem principal foi alterada, mas não foi possível atualizar PATH_IMAGEM.",
      };
    }

    try {
      await updateSellerImagePath(sellerId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Primary seller image changed but PATH_IMAGEM update failed",
        { sellerId, assetId, error },
      );
      return {
        success: true,
        message: "Nova imagem principal definida.",
        preferredImageId: assetId,
        warning:
          "A imagem principal foi alterada, mas não foi possível atualizar PATH_IMAGEM.",
      };
    }

    return {
      success: true,
      message: "Nova imagem principal definida.",
      preferredImageId: assetId,
    };
  } catch (error) {
    logger.error("Unexpected primary seller image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function updateSellerImagePathFromPrimaryAction(
  rawSellerId: number | string,
): Promise<SellerGalleryMutationResult> {
  const parsedSellerId = SellerIdSchema.safeParse(rawSellerId);
  if (!parsedSellerId.success) {
    return { success: false, error: "Vendedor inválido." };
  }

  const sellerId = parsedSellerId.data;
  try {
    const authorizedSeller = await getAuthorizedSellerContext(sellerId);
    if (!authorizedSeller) {
      return {
        success: false,
        error: "Vendedor não encontrado ou inacessível.",
      };
    }

    const gallery = await readSellerGallery(sellerId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar a imagem principal.",
      };
    }

    const primaryImage = gallery.images.find((image) => image.isPrimary);
    if (!primaryImage) {
      return {
        success: false,
        error: "A galeria não possui uma imagem principal.",
      };
    }

    const imagePath = primaryImage.urls.original.trim();
    if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary seller image has an invalid original URL", {
        sellerId,
        assetId: primaryImage.id,
        imagePathLength: imagePath.length,
      });
      return {
        success: false,
        error: "A URL original da imagem principal é inválida.",
      };
    }

    if ((authorizedSeller.seller.imagePath ?? "").trim() === imagePath) {
      return {
        success: true,
        message: "PATH_IMAGEM já está atualizado com a imagem principal.",
      };
    }

    await updateSellerImagePath(
      sellerId,
      imagePath,
      authorizedSeller.apiContext,
    );

    return {
      success: true,
      message: "PATH_IMAGEM atualizado com a imagem principal.",
    };
  } catch (error) {
    logger.error("Unexpected seller PATH_IMAGEM synchronization failure", {
      sellerId,
      error,
    });
    return {
      success: false,
      error: "Não foi possível atualizar PATH_IMAGEM.",
    };
  }
}

export async function deleteSellerImageAction(
  rawSellerId: number | string,
  rawAssetId: string,
): Promise<SellerGalleryMutationResult> {
  const parsedInput = z
    .object({ sellerId: SellerIdSchema, assetId: AssetIdSchema })
    .safeParse({ sellerId: rawSellerId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Vendedor ou imagem inválida." };
  }

  const { assetId, sellerId } = parsedInput.data;
  try {
    const authorizedSeller = await getAuthorizedSellerContext(sellerId);
    if (!authorizedSeller) {
      return {
        success: false,
        error: "Vendedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSeller;

    const gallery = await readSellerGallery(sellerId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este vendedor." };
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
      logger.warn("Assets API rejected seller image deletion", {
        sellerId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: SELLER_GALLERY_ENTITY_TYPE,
        entityId: sellerId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Seller image deleted but primary promotion failed", {
          sellerId,
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

      const imagePath = promotionCandidate.urls.original.trim();
      if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Promoted seller image has an invalid original URL", {
          sellerId,
          assetId: promotionCandidate.id,
          imagePathLength: imagePath.length,
        });
        return {
          success: true,
          message: "Imagem excluída.",
          preferredImageId: promotionCandidate.id,
          warning:
            "A nova principal foi definida, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }

      try {
        await updateSellerImagePath(sellerId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "Primary seller image promoted but PATH_IMAGEM update failed",
          { sellerId, assetId: promotionCandidate.id, error },
        );
        return {
          success: true,
          message: "Imagem excluída.",
          preferredImageId: promotionCandidate.id,
          warning:
            "A nova principal foi definida, mas não foi possível atualizar PATH_IMAGEM.",
        };
      }
    }

    return {
      success: true,
      message: "Imagem excluída com sucesso.",
      preferredImageId: image.isPrimary ? promotionCandidate?.id : undefined,
    };
  } catch (error) {
    logger.error("Unexpected seller image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
