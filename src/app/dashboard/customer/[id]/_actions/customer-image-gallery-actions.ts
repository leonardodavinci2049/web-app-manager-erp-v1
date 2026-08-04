"use server";

import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getCustomerById } from "@/services/api-main/customer-general";
import {
  CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES,
  CUSTOMER_GALLERY_ENTITY_TYPE,
  CUSTOMER_GALLERY_LIMIT,
  CUSTOMER_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { CustomerGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("CustomerImageGalleryActions");

const CustomerIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  customerId: CustomerIdSchema,
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

async function getAuthorizedCustomerContext(customerId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getCustomerById(customerId, apiContext);

  return result ? apiContext : null;
}

async function authorizeCustomer(customerId: number): Promise<boolean> {
  return Boolean(await getAuthorizedCustomerContext(customerId));
}

async function readCustomerGallery(customerId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: CUSTOMER_GALLERY_ENTITY_TYPE,
    entityId: customerId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected customer gallery read", {
      customerId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadCustomerImageAction(
  formData: FormData,
): Promise<CustomerGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    customerId: formData.get("customerId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do cliente inválido." };
  }

  const { file, customerId } = parsedInput.data;
  if (
    !CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof CUSTOMER_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > CUSTOMER_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 10 MB e não pode estar vazia.",
    };
  }

  try {
    if (!(await authorizeCustomer(customerId))) {
      return {
        success: false,
        error: "Cliente não encontrada ou inacessível.",
      };
    }

    const gallery = await readCustomerGallery(customerId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= CUSTOMER_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${CUSTOMER_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: CUSTOMER_GALLERY_ENTITY_TYPE,
      entityId: customerId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected customer image upload", {
        customerId,
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
    logger.error("Unexpected customer image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimaryCustomerImageAction(
  rawCustomerId: number | string,
  rawAssetId: string,
): Promise<CustomerGalleryMutationResult> {
  const parsedInput = z
    .object({ customerId: CustomerIdSchema, assetId: AssetIdSchema })
    .safeParse({ customerId: rawCustomerId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Cliente ou imagem inválida." };
  }

  const { assetId, customerId } = parsedInput.data;
  try {
    if (!(await authorizeCustomer(customerId))) {
      return {
        success: false,
        error: "Cliente não encontrada ou inacessível.",
      };
    }

    const gallery = await readCustomerGallery(customerId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este cliente." };
    }
    if (image.isPrimary) {
      return {
        success: true,
        message: "Esta imagem já é a principal.",
        preferredImageId: assetId,
      };
    }

    const result = await assetsApiService.setPrimaryImage({
      entityType: CUSTOMER_GALLERY_ENTITY_TYPE,
      entityId: customerId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary customer image update", {
        customerId,
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
    logger.error("Unexpected primary customer image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function deleteCustomerImageAction(
  rawCustomerId: number | string,
  rawAssetId: string,
): Promise<CustomerGalleryMutationResult> {
  const parsedInput = z
    .object({ customerId: CustomerIdSchema, assetId: AssetIdSchema })
    .safeParse({ customerId: rawCustomerId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Cliente ou imagem inválida." };
  }

  const { assetId, customerId } = parsedInput.data;
  try {
    if (!(await authorizeCustomer(customerId))) {
      return {
        success: false,
        error: "Cliente não encontrada ou inacessível.",
      };
    }

    const gallery = await readCustomerGallery(customerId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return { success: false, error: "Imagem não pertence a este cliente." };
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
      logger.warn("Assets API rejected customer image deletion", {
        customerId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: CUSTOMER_GALLERY_ENTITY_TYPE,
        entityId: customerId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Customer image deleted but primary promotion failed", {
          customerId,
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
    logger.error("Unexpected customer image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
