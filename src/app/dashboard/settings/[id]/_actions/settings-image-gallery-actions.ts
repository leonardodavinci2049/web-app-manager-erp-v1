"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { appConfigServiceApi } from "@/services/api-main/app-config";
import {
  getSettingsConfig,
  hasValidSystemClientId,
} from "../../_utils/settings-data";
import {
  SETTINGS_GALLERY_ACCEPTED_MIME_TYPES,
  SETTINGS_GALLERY_ENTITY_TYPE,
  SETTINGS_GALLERY_LIMIT,
  SETTINGS_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { SettingsGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("SettingsImageGalleryActions");
const SETTINGS_PATH = "/dashboard/settings";

const ConfigIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  configId: ConfigIdSchema,
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});
const ReorderSchema = z.object({
  configId: ConfigIdSchema,
  assetIds: z.array(AssetIdSchema).min(2).max(SETTINGS_GALLERY_LIMIT),
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

function revalidateSettings(configId: number): void {
  revalidatePath(SETTINGS_PATH);
  revalidatePath(`${SETTINGS_PATH}/${configId}`);
}

async function getAuthorizedSettingsContext(configId: number) {
  const { apiContext } = await getAuthContext();
  if (!hasValidSystemClientId(apiContext)) return null;
  const config = await getSettingsConfig(apiContext, configId);
  return { apiContext, config };
}

async function updateSettingsImagePath(
  configId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await appConfigServiceApi.updateAppConfigGeneralField({
    ...apiContext,
    pe_register_id: configId,
    pe_field_type: 1,
    pe_field: "PATH_IMAGEM",
    pe_value_str: imagePath,
  });
  revalidateSettings(configId);
}

async function readSettingsGallery(configId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: SETTINGS_GALLERY_ENTITY_TYPE,
    entityId: configId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected app configuration gallery read", {
      configId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

function invalidImagePathResult(
  message: string,
  preferredImageId: string,
): SettingsGalleryMutationResult {
  return {
    success: true,
    message,
    preferredImageId,
    warning:
      "A operação foi concluída na galeria, mas não foi possível atualizar PATH_IMAGEM.",
  };
}

export async function uploadSettingsImageAction(
  formData: FormData,
): Promise<SettingsGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    configId: formData.get("configId"),
    file: formData.get("file"),
  });
  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou configuração inválida." };
  }

  const { configId, file } = parsedInput.data;
  if (
    !SETTINGS_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof SETTINGS_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > SETTINGS_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const authorized = await getAuthorizedSettingsContext(configId);
    if (!authorized) {
      return {
        success: false,
        error: "Configuração não encontrada ou inacessível.",
      };
    }
    const { apiContext, config } = authorized;
    const gallery = await readSettingsGallery(config.ID);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= SETTINGS_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${SETTINGS_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: SETTINGS_GALLERY_ENTITY_TYPE,
      entityId: config.ID.toString(),
      altText: `Imagem de ${config.APP_NAME?.trim() || "aplicativo"}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: gallery.totalImages + 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected app configuration image upload", {
        configId: config.ID,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      if (result.statusCode >= 500) {
        return {
          success: false,
          error:
            "O serviço de imagens está indisponível no momento. Tente novamente em instantes.",
        };
      }
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    revalidateSettings(config.ID);
    const message = isFirstImage
      ? `${file.name} foi enviada e definida como imagem principal.`
      : `${file.name} foi enviada com sucesso.`;

    if (!isFirstImage) {
      return {
        success: true,
        message,
        preferredImageId: result.id,
      };
    }

    const imagePath = result.urls.original?.trim();
    if (!imagePath) return invalidImagePathResult(message, result.id);

    try {
      await updateSettingsImagePath(config.ID, imagePath, apiContext);
    } catch (error) {
      logger.error("First app image uploaded but PATH_IMAGEM update failed", {
        configId: config.ID,
        assetId: result.id,
        error,
      });
      return invalidImagePathResult(message, result.id);
    }

    return { success: true, message, preferredImageId: result.id };
  } catch (error) {
    logger.error("Unexpected app configuration image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimarySettingsImageAction(
  rawConfigId: number | string,
  rawAssetId: string,
): Promise<SettingsGalleryMutationResult> {
  const parsedInput = z
    .object({ configId: ConfigIdSchema, assetId: AssetIdSchema })
    .safeParse({ configId: rawConfigId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Configuração ou imagem inválida." };
  }

  const { assetId, configId } = parsedInput.data;
  try {
    const authorized = await getAuthorizedSettingsContext(configId);
    if (!authorized) {
      return {
        success: false,
        error: "Configuração não encontrada ou inacessível.",
      };
    }
    const { apiContext, config } = authorized;
    const gallery = await readSettingsGallery(config.ID);
    const image = gallery?.images.find((item) => item.id === assetId);
    if (!gallery || !image) {
      return {
        success: false,
        error: "Imagem não pertence a esta configuração.",
      };
    }

    const message = image.isPrimary
      ? "Esta imagem já é a principal."
      : "Nova imagem principal definida.";
    if (!image.isPrimary) {
      const result = await assetsApiService.setPrimaryImage({
        entityType: SETTINGS_GALLERY_ENTITY_TYPE,
        entityId: config.ID.toString(),
        assetId,
        displayOrder: 1,
      });
      if (isApiError(result)) {
        logger.warn("Assets API rejected primary app image update", {
          configId: config.ID,
          assetId,
          statusCode: result.statusCode,
          apiMessage: getSafeApiLogMessage(result.message),
        });
        return {
          success: false,
          error: "Não foi possível definir a imagem principal.",
        };
      }
      revalidateSettings(config.ID);
    }

    const imagePath = image.urls.original?.trim();
    if (!imagePath) return invalidImagePathResult(message, assetId);

    try {
      await updateSettingsImagePath(config.ID, imagePath, apiContext);
    } catch (error) {
      logger.error("Primary app image changed but PATH_IMAGEM update failed", {
        configId: config.ID,
        assetId,
        error,
      });
      return invalidImagePathResult(message, assetId);
    }

    return { success: true, message, preferredImageId: assetId };
  } catch (error) {
    logger.error("Unexpected primary app image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function reorderSettingsImagesAction(
  rawConfigId: number | string,
  rawAssetIds: string[],
): Promise<SettingsGalleryMutationResult> {
  const parsedInput = ReorderSchema.safeParse({
    configId: rawConfigId,
    assetIds: rawAssetIds,
  });
  if (!parsedInput.success) {
    return { success: false, error: "Ordem de imagens inválida." };
  }

  const { configId, assetIds } = parsedInput.data;
  if (new Set(assetIds).size !== assetIds.length) {
    return { success: false, error: "A ordem contém imagens duplicadas." };
  }

  try {
    const authorized = await getAuthorizedSettingsContext(configId);
    if (!authorized) {
      return {
        success: false,
        error: "Configuração não encontrada ou inacessível.",
      };
    }
    const gallery = await readSettingsGallery(authorized.config.ID);
    if (
      !gallery ||
      gallery.totalImages !== assetIds.length ||
      gallery.images.length !== assetIds.length
    ) {
      return {
        success: false,
        error: "A galeria mudou. Atualize a página antes de reordenar.",
      };
    }

    const currentIds = new Set(gallery.images.map((image) => image.id));
    if (assetIds.some((assetId) => !currentIds.has(assetId))) {
      return {
        success: false,
        error: "Uma das imagens não pertence a esta configuração.",
      };
    }
    const primaryImage = gallery.images.find((image) => image.isPrimary);
    if (primaryImage && assetIds[0] !== primaryImage.id) {
      return {
        success: false,
        error: "A imagem principal deve permanecer na primeira posição.",
      };
    }

    const result = await assetsApiService.reorderImages({
      entityType: SETTINGS_GALLERY_ENTITY_TYPE,
      entityId: authorized.config.ID.toString(),
      assetIds,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected app image reorder", {
        configId: authorized.config.ID,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return {
        success: false,
        error: "Não foi possível reordenar as imagens.",
      };
    }

    revalidateSettings(authorized.config.ID);
    return { success: true, message: "Imagens reordenadas com sucesso." };
  } catch (error) {
    logger.error("Unexpected app image reorder failure", error);
    return { success: false, error: "Não foi possível reordenar as imagens." };
  }
}

export async function deleteSettingsImageAction(
  rawConfigId: number | string,
  rawAssetId: string,
): Promise<SettingsGalleryMutationResult> {
  const parsedInput = z
    .object({ configId: ConfigIdSchema, assetId: AssetIdSchema })
    .safeParse({ configId: rawConfigId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Configuração ou imagem inválida." };
  }

  const { assetId, configId } = parsedInput.data;
  try {
    const authorized = await getAuthorizedSettingsContext(configId);
    if (!authorized) {
      return {
        success: false,
        error: "Configuração não encontrada ou inacessível.",
      };
    }
    const { apiContext, config } = authorized;
    const gallery = await readSettingsGallery(config.ID);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }

    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a esta configuração.",
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
      logger.warn("Assets API rejected app image deletion", {
        configId: config.ID,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }
    revalidateSettings(config.ID);

    if (!image.isPrimary || !promotionCandidate) {
      return { success: true, message: "Imagem excluída com sucesso." };
    }

    const primaryResult = await assetsApiService.setPrimaryImage({
      entityType: SETTINGS_GALLERY_ENTITY_TYPE,
      entityId: config.ID.toString(),
      assetId: promotionCandidate.id,
      displayOrder: 1,
    });
    if (isApiError(primaryResult)) {
      logger.error("App image deleted but primary promotion failed", {
        configId: config.ID,
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

    const imagePath = promotionCandidate.urls.original?.trim();
    if (!imagePath) {
      return invalidImagePathResult(
        "Imagem excluída e nova principal definida.",
        promotionCandidate.id,
      );
    }

    try {
      await updateSettingsImagePath(config.ID, imagePath, apiContext);
    } catch (error) {
      logger.error("Promoted app image PATH_IMAGEM update failed", {
        configId: config.ID,
        assetId: promotionCandidate.id,
        error,
      });
      return invalidImagePathResult(
        "Imagem excluída e nova principal definida.",
        promotionCandidate.id,
      );
    }

    return {
      success: true,
      message: "Imagem excluída e nova principal definida.",
      preferredImageId: promotionCandidate.id,
    };
  } catch (error) {
    logger.error("Unexpected app image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
