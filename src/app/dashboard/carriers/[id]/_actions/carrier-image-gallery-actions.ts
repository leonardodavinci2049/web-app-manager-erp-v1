"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getCarrierById } from "@/services/api-main/carrier";
import {
  FIELD_TYPE,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import {
  CARRIER_GALLERY_ACCEPTED_MIME_TYPES,
  CARRIER_GALLERY_ENTITY_TYPE,
  CARRIER_GALLERY_LIMIT,
  CARRIER_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { CarrierGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("CarrierImageGalleryActions");
const CARRIER_TABLE_NAME = "tbl_transportadora";
const CARRIER_PRIMARY_KEY_FIELD = "ID_TRANSPORTADORA";
const CARRIER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const CARRIER_IMAGE_PATH_MAX_LENGTH = 300;

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

async function updateCarrierImagePath(
  carrierId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    ...apiContext,
    pe_table_name: CARRIER_TABLE_NAME,
    pe_primary_key_field: CARRIER_PRIMARY_KEY_FIELD,
    pe_register_id: carrierId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: CARRIER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
  });

  revalidatePath("/dashboard/carriers");
  revalidatePath(`/dashboard/carriers/${carrierId}`);
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
    const apiContext = await getAuthorizedCarrierContext(carrierId);
    if (!apiContext) {
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

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > CARRIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("First carrier image has an invalid original URL", {
          carrierId,
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
        await updateCarrierImagePath(carrierId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "First carrier image uploaded but PATH_IMAGEM update failed",
          { carrierId, assetId: result.id, error },
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
        ? `${file.name} foi enviada e definida como imagem da transportadora.`
        : `${file.name} foi enviada com sucesso.`,
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
    const apiContext = await getAuthorizedCarrierContext(carrierId);
    if (!apiContext) {
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
      const imagePath = image.urls.original.trim();
      if (!imagePath || imagePath.length > CARRIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Primary carrier image has an invalid original URL", {
          carrierId,
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
        await updateCarrierImagePath(carrierId, imagePath, apiContext);
      } catch (error) {
        logger.error("Primary carrier image PATH_IMAGEM repair failed", {
          carrierId,
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

    const imagePath = image.urls.original.trim();
    if (!imagePath || imagePath.length > CARRIER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary carrier image has an invalid original URL", {
        carrierId,
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
      await updateCarrierImagePath(carrierId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Primary carrier image changed but PATH_IMAGEM update failed",
        { carrierId, assetId, error },
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
    const apiContext = await getAuthorizedCarrierContext(carrierId);
    if (!apiContext) {
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

      const imagePath = promotionCandidate.urls.original.trim();
      if (!imagePath || imagePath.length > CARRIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Promoted carrier image has an invalid original URL", {
          carrierId,
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
        await updateCarrierImagePath(carrierId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "Primary carrier image promoted but PATH_IMAGEM update failed",
          { carrierId, assetId: promotionCandidate.id, error },
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
    logger.error("Unexpected carrier image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
