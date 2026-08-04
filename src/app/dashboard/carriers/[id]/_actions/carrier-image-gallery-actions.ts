"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getCarrierById } from "@/services/api-main/carrier";
import {
  CARRIER_GALLERY_ACCEPTED_MIME_TYPES,
  CARRIER_GALLERY_ENTITY_TYPE,
  CARRIER_GALLERY_LIMIT,
  CARRIER_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { CarrierGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("CarrierImageGalleryActions");

const CarrierIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  carrierId: CarrierIdSchema,
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

async function getAuthorizedCarrierContext(carrierId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getCarrierById(carrierId, apiContext);

  return result ? apiContext : null;
}

async function authorizeCarrier(carrierId: number): Promise<boolean> {
  return Boolean(await getAuthorizedCarrierContext(carrierId));
}

async function readCarrierGallery(carrierId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: CARRIER_GALLERY_ENTITY_TYPE,
    entityId: carrierId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected carrier gallery read", {
      carrierId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadCarrierImageAction(
  formData: FormData,
): Promise<CarrierGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    carrierId: formData.get("carrierId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Arquivo ou ID da transportadora inválido.",
    };
  }

  const { file, carrierId } = parsedInput.data;
  if (
    !CARRIER_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof CARRIER_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > CARRIER_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 10 MB e não pode estar vazia.",
    };
  }

  try {
    if (!(await authorizeCarrier(carrierId))) {
      return {
        success: false,
        error: "Transportadora não encontrada ou inacessível.",
      };
    }

    const gallery = await readCarrierGallery(carrierId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= CARRIER_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${CARRIER_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: CARRIER_GALLERY_ENTITY_TYPE,
      entityId: carrierId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected carrier image upload", {
        carrierId,
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
    logger.error("Unexpected carrier image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryCarrierImageAction(
  rawCarrierId: number | string,
  rawAssetId: string,
): Promise<CarrierGalleryMutationResult> {
  const parsedInput = z
    .object({ carrierId: CarrierIdSchema, assetId: AssetIdSchema })
    .safeParse({ carrierId: rawCarrierId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Transportadora ou imagem inválida." };
  }

  const { assetId, carrierId } = parsedInput.data;
  try {
    if (!(await authorizeCarrier(carrierId))) {
      return {
        success: false,
        error: "Transportadora não encontrada ou inacessível.",
      };
    }

    const gallery = await readCarrierGallery(carrierId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a esta transportadora.",
      };
    }
    if (image.isPrimary) {
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: CARRIER_GALLERY_ENTITY_TYPE,
      entityId: carrierId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary carrier image update", {
        carrierId,
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
    logger.error("Unexpected primary carrier image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function deleteCarrierImageAction(
  rawCarrierId: number | string,
  rawAssetId: string,
): Promise<CarrierGalleryMutationResult> {
  const parsedInput = z
    .object({ carrierId: CarrierIdSchema, assetId: AssetIdSchema })
    .safeParse({ carrierId: rawCarrierId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Transportadora ou imagem inválida." };
  }

  const { assetId, carrierId } = parsedInput.data;
  try {
    if (!(await authorizeCarrier(carrierId))) {
      return {
        success: false,
        error: "Transportadora não encontrada ou inacessível.",
      };
    }

    const gallery = await readCarrierGallery(carrierId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a esta transportadora.",
      };
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
      logger.warn("Assets API rejected carrier image deletion", {
        carrierId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: CARRIER_GALLERY_ENTITY_TYPE,
        entityId: carrierId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Carrier image deleted but primary promotion failed", {
          carrierId,
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
    logger.error("Unexpected carrier image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
