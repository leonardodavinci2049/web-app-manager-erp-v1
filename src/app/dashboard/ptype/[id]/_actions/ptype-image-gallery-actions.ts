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
import { getPtypeById } from "@/services/api-main/ptype";
import {
  PTYPE_GALLERY_ACCEPTED_MIME_TYPES,
  PTYPE_GALLERY_ENTITY_TYPE,
  PTYPE_GALLERY_LIMIT,
  PTYPE_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { PtypeGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("PtypeImageGalleryActions");
const PTYPE_TABLE_NAME = "tbl_produto_tipo";
const PTYPE_PRIMARY_KEY_FIELD = "ID_TIPO";
const PTYPE_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const PTYPE_IMAGE_PATH_MAX_LENGTH = 300;

const PtypeIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  ptypeId: PtypeIdSchema,
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

async function getAuthorizedPtypeContext(ptypeId: number) {
  const { apiContext } = await getAuthContext();
  const ptype = await getPtypeById(ptypeId, apiContext);

  return ptype ? { apiContext, ptype } : null;
}

async function updatePtypeImagePath(
  ptypeId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    ...apiContext,
    pe_table_name: PTYPE_TABLE_NAME,
    pe_primary_key_field: PTYPE_PRIMARY_KEY_FIELD,
    pe_register_id: ptypeId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: PTYPE_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
  });

  revalidatePath("/dashboard/ptype");
  revalidatePath(`/dashboard/ptype/${ptypeId}`);
}

async function readPtypeGallery(ptypeId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: PTYPE_GALLERY_ENTITY_TYPE,
    entityId: ptypeId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected ptype gallery read", {
      ptypeId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadPtypeImageAction(
  formData: FormData,
): Promise<PtypeGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    ptypeId: formData.get("ptypeId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Arquivo ou ID do tipo de produto inválido.",
    };
  }

  const { file, ptypeId } = parsedInput.data;
  if (
    !PTYPE_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof PTYPE_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > PTYPE_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const authorizedPtype = await getAuthorizedPtypeContext(ptypeId);
    if (!authorizedPtype) {
      return {
        success: false,
        error: "Tipo de produto não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedPtype;

    const gallery = await readPtypeGallery(ptypeId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= PTYPE_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${PTYPE_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: PTYPE_GALLERY_ENTITY_TYPE,
      entityId: ptypeId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected ptype image upload", {
        ptypeId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
        logger.error("First ptype image has an invalid original URL", {
          ptypeId,
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
        await updatePtypeImagePath(ptypeId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "First ptype image uploaded but PATH_IMAGEM update failed",
          { ptypeId, assetId: result.id, error },
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
        ? `${file.name} foi enviada e definida como imagem do tipo de produto.`
        : `${file.name} foi enviada com sucesso.`,
      preferredImageId: result.id,
    };
  } catch (error) {
    logger.error("Unexpected ptype image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryPtypeImageAction(
  rawPtypeId: number | string,
  rawAssetId: string,
): Promise<PtypeGalleryMutationResult> {
  const parsedInput = z
    .object({ ptypeId: PtypeIdSchema, assetId: AssetIdSchema })
    .safeParse({ ptypeId: rawPtypeId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Tipo de produto ou imagem inválida." };
  }

  const { assetId, ptypeId } = parsedInput.data;
  try {
    const authorizedPtype = await getAuthorizedPtypeContext(ptypeId);
    if (!authorizedPtype) {
      return {
        success: false,
        error: "Tipo de produto não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedPtype;

    const gallery = await readPtypeGallery(ptypeId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a este tipo de produto.",
      };
    }
    if (image.isPrimary) {
      const imagePath = image.urls.original.trim();
      if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Primary ptype image has an invalid original URL", {
          ptypeId,
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
        await updatePtypeImagePath(ptypeId, imagePath, apiContext);
      } catch (error) {
        logger.error("Primary ptype image PATH_IMAGEM repair failed", {
          ptypeId,
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
      entityType: PTYPE_GALLERY_ENTITY_TYPE,
      entityId: ptypeId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary ptype image update", {
        ptypeId,
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
    if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary ptype image has an invalid original URL", {
        ptypeId,
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
      await updatePtypeImagePath(ptypeId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Primary ptype image changed but PATH_IMAGEM update failed",
        { ptypeId, assetId, error },
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
    logger.error("Unexpected primary ptype image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function updatePtypeImagePathFromPrimaryAction(
  rawPtypeId: number | string,
): Promise<PtypeGalleryMutationResult> {
  const parsedPtypeId = PtypeIdSchema.safeParse(rawPtypeId);
  if (!parsedPtypeId.success) {
    return { success: false, error: "Tipo de produto inválido." };
  }

  const ptypeId = parsedPtypeId.data;
  try {
    const authorizedPtype = await getAuthorizedPtypeContext(ptypeId);
    if (!authorizedPtype) {
      return {
        success: false,
        error: "Tipo de produto não encontrado ou inacessível.",
      };
    }

    const gallery = await readPtypeGallery(ptypeId);
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
    if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary ptype image has an invalid original URL", {
        ptypeId,
        assetId: primaryImage.id,
        imagePathLength: imagePath.length,
      });
      return {
        success: false,
        error: "A URL original da imagem principal é inválida.",
      };
    }

    if ((authorizedPtype.ptype.imagePath ?? "").trim() === imagePath) {
      return {
        success: true,
        message: "PATH_IMAGEM já está atualizado com a imagem principal.",
      };
    }

    await updatePtypeImagePath(ptypeId, imagePath, authorizedPtype.apiContext);

    return {
      success: true,
      message: "PATH_IMAGEM atualizado com a imagem principal.",
    };
  } catch (error) {
    logger.error("Unexpected ptype PATH_IMAGEM synchronization failure", {
      ptypeId,
      error,
    });
    return {
      success: false,
      error: "Não foi possível atualizar PATH_IMAGEM.",
    };
  }
}

export async function deletePtypeImageAction(
  rawPtypeId: number | string,
  rawAssetId: string,
): Promise<PtypeGalleryMutationResult> {
  const parsedInput = z
    .object({ ptypeId: PtypeIdSchema, assetId: AssetIdSchema })
    .safeParse({ ptypeId: rawPtypeId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Tipo de produto ou imagem inválida." };
  }

  const { assetId, ptypeId } = parsedInput.data;
  try {
    const authorizedPtype = await getAuthorizedPtypeContext(ptypeId);
    if (!authorizedPtype) {
      return {
        success: false,
        error: "Tipo de produto não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedPtype;

    const gallery = await readPtypeGallery(ptypeId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a este tipo de produto.",
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
      logger.warn("Assets API rejected ptype image deletion", {
        ptypeId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: PTYPE_GALLERY_ENTITY_TYPE,
        entityId: ptypeId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Ptype image deleted but primary promotion failed", {
          ptypeId,
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
      if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Promoted ptype image has an invalid original URL", {
          ptypeId,
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
        await updatePtypeImagePath(ptypeId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "Primary ptype image promoted but PATH_IMAGEM update failed",
          { ptypeId, assetId: promotionCandidate.id, error },
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
    logger.error("Unexpected ptype image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
