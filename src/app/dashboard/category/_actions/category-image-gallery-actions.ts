"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getTaxonomyById } from "@/services/api-main/taxonomy-base/taxonomy-base-service-api";
import { taxonomyInlineServiceApi } from "@/services/api-main/taxonomy-inline";
import {
  CATEGORY_GALLERY_ACCEPTED_MIME_TYPES,
  CATEGORY_GALLERY_ENTITY_TYPE,
  CATEGORY_GALLERY_LIMIT,
  CATEGORY_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { CategoryGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("CategoryImageGalleryActions");

const CategoryIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  categoryId: CategoryIdSchema,
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

async function getAuthorizedCategoryContext(categoryId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getTaxonomyById(categoryId, apiContext);

  return result ? apiContext : null;
}

async function readCategoryGallery(categoryId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: CATEGORY_GALLERY_ENTITY_TYPE,
    entityId: categoryId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected category gallery read", {
      categoryId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadCategoryImageAction(
  formData: FormData,
): Promise<CategoryGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    categoryId: formData.get("categoryId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID da categoria inválido." };
  }

  const { file, categoryId } = parsedInput.data;
  if (
    !CATEGORY_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof CATEGORY_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > CATEGORY_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const apiContext = await getAuthorizedCategoryContext(categoryId);
    if (!apiContext) {
      return {
        success: false,
        error: "Categoria não encontrada ou inacessível.",
      };
    }

    const gallery = await readCategoryGallery(categoryId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= CATEGORY_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${CATEGORY_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: CATEGORY_GALLERY_ENTITY_TYPE,
      entityId: categoryId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected category image upload", {
        categoryId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > 300) {
        logger.error("First category image has an invalid original URL", {
          categoryId,
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
        await taxonomyInlineServiceApi.updateTaxonomyImagePathInline({
          pe_taxonomy_id: categoryId,
          pe_image_path: imagePath,
          ...apiContext,
        });
        revalidatePath("/dashboard/category");
      } catch (error) {
        logger.error(
          "First category image uploaded but PATH_IMAGEM update failed",
          { categoryId, assetId: result.id, error },
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
    logger.error("Unexpected category image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryCategoryImageAction(
  rawCategoryId: number | string,
  rawAssetId: string,
): Promise<CategoryGalleryMutationResult> {
  const parsedInput = z
    .object({ categoryId: CategoryIdSchema, assetId: AssetIdSchema })
    .safeParse({ categoryId: rawCategoryId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Categoria ou imagem inválida." };
  }

  const { assetId, categoryId } = parsedInput.data;
  try {
    const apiContext = await getAuthorizedCategoryContext(categoryId);
    if (!apiContext) {
      return {
        success: false,
        error: "Categoria não encontrada ou inacessível.",
      };
    }

    const gallery = await readCategoryGallery(categoryId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a esta categoria." };
    }
    if (image.isPrimary) {
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: CATEGORY_GALLERY_ENTITY_TYPE,
      entityId: categoryId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary category image update", {
        categoryId,
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
    if (!imagePath || imagePath.length > 300) {
      logger.error("Primary category image has an invalid original URL", {
        categoryId,
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
      await taxonomyInlineServiceApi.updateTaxonomyImagePathInline({
        pe_taxonomy_id: categoryId,
        pe_image_path: imagePath,
        ...apiContext,
      });
      revalidatePath("/dashboard/category");
    } catch (error) {
      logger.error(
        "Primary category image changed but PATH_IMAGEM update failed",
        {
          categoryId,
          assetId,
          error,
        },
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
    logger.error("Unexpected primary category image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function deleteCategoryImageAction(
  rawCategoryId: number | string,
  rawAssetId: string,
): Promise<CategoryGalleryMutationResult> {
  const parsedInput = z
    .object({ categoryId: CategoryIdSchema, assetId: AssetIdSchema })
    .safeParse({ categoryId: rawCategoryId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Categoria ou imagem inválida." };
  }

  const { assetId, categoryId } = parsedInput.data;
  try {
    const apiContext = await getAuthorizedCategoryContext(categoryId);
    if (!apiContext) {
      return {
        success: false,
        error: "Categoria não encontrada ou inacessível.",
      };
    }

    const gallery = await readCategoryGallery(categoryId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a esta categoria." };
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
      logger.warn("Assets API rejected category image deletion", {
        categoryId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: CATEGORY_GALLERY_ENTITY_TYPE,
        entityId: categoryId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Category image deleted but primary promotion failed", {
          categoryId,
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
      if (!imagePath || imagePath.length > 300) {
        logger.error("Promoted category image has an invalid original URL", {
          categoryId,
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
        await taxonomyInlineServiceApi.updateTaxonomyImagePathInline({
          pe_taxonomy_id: categoryId,
          pe_image_path: imagePath,
          ...apiContext,
        });
        revalidatePath("/dashboard/category");
      } catch (error) {
        logger.error(
          "Primary category image promoted but PATH_IMAGEM update failed",
          { categoryId, assetId: promotionCandidate.id, error },
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
    logger.error("Unexpected category image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
