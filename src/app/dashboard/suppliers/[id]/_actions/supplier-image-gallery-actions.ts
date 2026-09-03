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
import { getSupplierById } from "@/services/api-main/supplier";
import {
  SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES,
  SUPPLIERS_GALLERY_ENTITY_TYPE,
  SUPPLIERS_GALLERY_LIMIT,
  SUPPLIERS_GALLERY_MAX_FILE_SIZE,
} from "../_components/image-gallery/image-gallery-constants";
import type { SupplierGalleryMutationResult } from "../_components/image-gallery/image-gallery-types";

const logger = createLogger("SupplierImageGalleryActions");
const SUPPLIER_TABLE_NAME = "tbl_fornecedor";
const SUPPLIER_PRIMARY_KEY_FIELD = "ID_FORNECEDOR";
const SUPPLIER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const SUPPLIER_IMAGE_PATH_MAX_LENGTH = 300;

const SupplierIdSchema = z.coerce.number().int().positive();
const AssetIdSchema = z.string().uuid();
const UploadSchema = z.object({
  supplierId: SupplierIdSchema,
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

async function getAuthorizedSupplierContext(supplierId: number) {
  const { apiContext } = await getAuthContext();
  const supplier = await getSupplierById(supplierId, apiContext);

  return supplier ? { apiContext, supplier } : null;
}

async function updateSupplierImagePath(
  supplierId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    ...apiContext,
    pe_table_name: SUPPLIER_TABLE_NAME,
    pe_primary_key_field: SUPPLIER_PRIMARY_KEY_FIELD,
    pe_register_id: supplierId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: SUPPLIER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
  });

  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${supplierId}`);
}

async function readSupplierGallery(supplierId: number) {
  const gallery = await assetsApiService.getEntityGallery({
    entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
    entityId: supplierId.toString(),
  });

  if (isApiError(gallery)) {
    logger.warn("Assets API rejected supplier gallery read", {
      supplierId,
      statusCode: gallery.statusCode,
      apiMessage: getSafeApiLogMessage(gallery.message),
    });
    return null;
  }

  return gallery;
}

export async function uploadSupplierImageAction(
  formData: FormData,
): Promise<SupplierGalleryMutationResult> {
  const parsedInput = UploadSchema.safeParse({
    supplierId: formData.get("supplierId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return {
      success: false,
      error: "Arquivo ou ID do fornecedor inválido.",
    };
  }

  const { file, supplierId } = parsedInput.data;
  if (
    !SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof SUPPLIERS_GALLERY_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > SUPPLIERS_GALLERY_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const authorizedSupplier = await getAuthorizedSupplierContext(supplierId);
    if (!authorizedSupplier) {
      return {
        success: false,
        error: "Fornecedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSupplier;

    const gallery = await readSupplierGallery(supplierId);
    if (!gallery) {
      return {
        success: false,
        error: "Não foi possível validar o limite da galeria.",
      };
    }
    if (gallery.totalImages >= SUPPLIERS_GALLERY_LIMIT) {
      return {
        success: false,
        error: `A galeria já atingiu o limite de ${SUPPLIERS_GALLERY_LIMIT} imagens.`,
      };
    }

    const isFirstImage = gallery.totalImages === 0;
    const result = await assetsApiService.uploadFile({
      file,
      entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
      entityId: supplierId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: isFirstImage ? true : undefined,
      displayOrder: isFirstImage ? 1 : undefined,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected supplier image upload", {
        supplierId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    if (isFirstImage) {
      const imagePath = result.urls.original.trim();
      if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("First supplier image has an invalid original URL", {
          supplierId,
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
        await updateSupplierImagePath(supplierId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "First supplier image uploaded but PATH_IMAGEM update failed",
          { supplierId, assetId: result.id, error },
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
        ? `${file.name} foi enviada e definida como imagem do fornecedor.`
        : `${file.name} foi enviada com sucesso.`,
      preferredImageId: result.id,
    };
  } catch (error) {
    logger.error("Unexpected supplier image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}

export async function setPrimarySupplierImageAction(
  rawSupplierId: number | string,
  rawAssetId: string,
): Promise<SupplierGalleryMutationResult> {
  const parsedInput = z
    .object({ supplierId: SupplierIdSchema, assetId: AssetIdSchema })
    .safeParse({ supplierId: rawSupplierId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Fornecedor ou imagem inválida." };
  }

  const { assetId, supplierId } = parsedInput.data;
  try {
    const authorizedSupplier = await getAuthorizedSupplierContext(supplierId);
    if (!authorizedSupplier) {
      return {
        success: false,
        error: "Fornecedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSupplier;

    const gallery = await readSupplierGallery(supplierId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const image = gallery.images.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a este fornecedor.",
      };
    }
    if (image.isPrimary) {
      const imagePath = image.urls.original.trim();
      if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Primary supplier image has an invalid original URL", {
          supplierId,
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
        await updateSupplierImagePath(supplierId, imagePath, apiContext);
      } catch (error) {
        logger.error("Primary supplier image PATH_IMAGEM repair failed", {
          supplierId,
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
      entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
      entityId: supplierId.toString(),
      assetId,
      displayOrder: 1,
    });
    if (isApiError(result)) {
      logger.warn("Assets API rejected primary supplier image update", {
        supplierId,
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
    if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary supplier image has an invalid original URL", {
        supplierId,
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
      await updateSupplierImagePath(supplierId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Primary supplier image changed but PATH_IMAGEM update failed",
        { supplierId, assetId, error },
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
    logger.error("Unexpected primary supplier image update failure", error);
    return {
      success: false,
      error: "Não foi possível definir a imagem principal.",
    };
  }
}

export async function updateSupplierImagePathFromPrimaryAction(
  rawSupplierId: number | string,
): Promise<SupplierGalleryMutationResult> {
  const parsedSupplierId = SupplierIdSchema.safeParse(rawSupplierId);
  if (!parsedSupplierId.success) {
    return { success: false, error: "Fornecedor inválido." };
  }

  const supplierId = parsedSupplierId.data;
  try {
    const authorizedSupplier = await getAuthorizedSupplierContext(supplierId);
    if (!authorizedSupplier) {
      return {
        success: false,
        error: "Fornecedor não encontrado ou inacessível.",
      };
    }

    const gallery = await readSupplierGallery(supplierId);
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
    if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Primary supplier image has an invalid original URL", {
        supplierId,
        assetId: primaryImage.id,
        imagePathLength: imagePath.length,
      });
      return {
        success: false,
        error: "A URL original da imagem principal é inválida.",
      };
    }

    if ((authorizedSupplier.supplier.imagePath ?? "").trim() === imagePath) {
      return {
        success: true,
        message: "PATH_IMAGEM já está atualizado com a imagem principal.",
      };
    }

    await updateSupplierImagePath(
      supplierId,
      imagePath,
      authorizedSupplier.apiContext,
    );

    return {
      success: true,
      message: "PATH_IMAGEM atualizado com a imagem principal.",
    };
  } catch (error) {
    logger.error("Unexpected supplier PATH_IMAGEM synchronization failure", {
      supplierId,
      error,
    });
    return {
      success: false,
      error: "Não foi possível atualizar PATH_IMAGEM.",
    };
  }
}

export async function deleteSupplierImageAction(
  rawSupplierId: number | string,
  rawAssetId: string,
): Promise<SupplierGalleryMutationResult> {
  const parsedInput = z
    .object({ supplierId: SupplierIdSchema, assetId: AssetIdSchema })
    .safeParse({ supplierId: rawSupplierId, assetId: rawAssetId });
  if (!parsedInput.success) {
    return { success: false, error: "Fornecedor ou imagem inválida." };
  }

  const { assetId, supplierId } = parsedInput.data;
  try {
    const authorizedSupplier = await getAuthorizedSupplierContext(supplierId);
    if (!authorizedSupplier) {
      return {
        success: false,
        error: "Fornecedor não encontrado ou inacessível.",
      };
    }
    const { apiContext } = authorizedSupplier;

    const gallery = await readSupplierGallery(supplierId);
    if (!gallery) {
      return { success: false, error: "Não foi possível validar a imagem." };
    }
    const orderedImages = sortGalleryImages(gallery.images);
    const image = orderedImages.find((item) => item.id === assetId);
    if (!image) {
      return {
        success: false,
        error: "Imagem não pertence a este fornecedor.",
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
      logger.warn("Assets API rejected supplier image deletion", {
        supplierId,
        assetId,
        statusCode: deleteResult.statusCode,
        apiMessage: getSafeApiLogMessage(deleteResult.message),
      });
      return { success: false, error: "Não foi possível excluir esta imagem." };
    }

    if (image.isPrimary && promotionCandidate) {
      const primaryResult = await assetsApiService.setPrimaryImage({
        entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
        entityId: supplierId.toString(),
        assetId: promotionCandidate.id,
        displayOrder: 1,
      });
      if (isApiError(primaryResult)) {
        logger.error("Supplier image deleted but primary promotion failed", {
          supplierId,
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
      if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
        logger.error("Promoted supplier image has an invalid original URL", {
          supplierId,
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
        await updateSupplierImagePath(supplierId, imagePath, apiContext);
      } catch (error) {
        logger.error(
          "Primary supplier image promoted but PATH_IMAGEM update failed",
          { supplierId, assetId: promotionCandidate.id, error },
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
    logger.error("Unexpected supplier image deletion failure", error);
    return { success: false, error: "Não foi possível excluir esta imagem." };
  }
}
