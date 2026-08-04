"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getBrandById } from "@/services/api-main/brand/brand-service-api";
import {
  BRAND_GALLERY_ACCEPTED_MIME_TYPES,
  BRAND_GALLERY_ENTITY_TYPE,
  BRAND_GALLERY_LIMIT,
  BRAND_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { BrandGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("BrandImageGalleryActions");

const BrandIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  brandId: BrandIdSchema,
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

async function getAuthorizedBrandContext(brandId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getBrandById(brandId, apiContext);

  return result ? apiContext : null;
}

async function authorizeBrand(brandId: number): Promise<boolean> {
  return Boolean(await getAuthorizedBrandContext(brandId));
}

async function readBrandGallery(brandId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: BRAND_GALLERY_ENTITY_TYPE,
    entityId: brandId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected brand gallery read", {
      brandId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadBrandImageAction(
  formData: FormData,
): Promise<BrandGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    brandId: formData.get("brandId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID da marca inválido." };
  }

  const { file, brandId } = parsedInput.data;
  if (
    !BRAND_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof BRAND_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > BRAND_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 10 MB e não pode estar vazia.",
    };
  }

  try {
    if (!(await authorizeBrand(brandId))) {
      return {
        success: false,
        error: "Marca não encontrada ou inacessível.",
      };
    }

    const gallery = await readBrandGallery(brandId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= BRAND_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${BRAND_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: BRAND_GALLERY_ENTITY_TYPE,
      entityId: brandId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected brand image upload", {
        brandId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    return {
      success: true,
      message: `${file.name} foi enviada com sucesso.`,
      preferredImageId: result.id,
    };
  } catch (error) {
    logger.error("Unexpected brand image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryBrandImageAction(
  rawBrandId: number | string,
  rawAssetId: string,
): Promise<BrandGalleryMutationResult> {
  const parsedInput = z
    .object({ brandId: BrandIdSchema, assetId: AssetIdSchema })
    .safeParse({ brandId: rawBrandId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Marca ou imagem inválida." };
  }

  const { assetId, brandId } = parsedInput.data;
  try {
    if (!(await authorizeBrand(brandId))) {
      return {
        success: false,
        error: "Marca não encontrada ou inacessível.",
      };
    }

    const gallery = await readBrandGallery(brandId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a esta marca." };
    }
    if (image.isPrimary) {
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: BRAND_GALLERY_ENTITY_TYPE,
      entityId: brandId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary brand image update", {
        brandId,
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
    logger.error("Unexpected primary brand image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function deleteBrandImageAction(
  rawBrandId: number | string,
  rawAssetId: string,
): Promise<BrandGalleryMutationResult> {
  const parsedInput = z
    .object({ brandId: BrandIdSchema, assetId: AssetIdSchema })
    .safeParse({ brandId: rawBrandId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Marca ou imagem inválida." };
  }

  const { assetId, brandId } = parsedInput.data;
  try {
    if (!(await authorizeBrand(brandId))) {
      return {
        success: false,
        error: "Marca não encontrada ou inacessível.",
      };
    }

    const gallery = await readBrandGallery(brandId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a esta marca." };
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
      logger.warn("Assets API rejected brand image deletion", {
        brandId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: BRAND_GALLERY_ENTITY_TYPE,
        entityId: brandId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Brand image deleted but primary promotion failed", {
          brandId,
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
    logger.error("Unexpected brand image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
