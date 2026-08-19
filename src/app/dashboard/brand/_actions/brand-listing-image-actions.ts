"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import {
  brandServiceApi,
  getBrandById,
} from "@/services/api-main/brand/brand-service-api";
import { FIELD_TYPE } from "@/services/api-main/general-call";
import type { BrandListingImageResult } from "../_components/types/brand-dashboard-types";

const logger = createLogger("BrandListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const BRAND_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const BRAND_IMAGE_PATH_MAX_LENGTH = 300;
const BRAND_GALLERY_ENTITY_TYPE = "BRAND";
const BRAND_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  brandId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedBrandContext(brandId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getBrandById(brandId, apiContext);

  return result ? apiContext : null;
}

async function updateBrandImagePath(
  brandId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await brandServiceApi.updateBrandInlineField({
    ...apiContext,
    pe_register_id: brandId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: BRAND_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
  });

  revalidatePath("/dashboard/brand");
  revalidatePath(`/dashboard/brand/${brandId}`);
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

/**
 * Upload de uma unica imagem direto pela listagem de marcas. Diferente da
 * galeria de detalhe, a nova imagem e' sempre enviada como principal
 * (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre regravado,
 * reparando o ponteiro mesmo quando a galeria ja possui outras imagens.
 */
export async function uploadBrandListingImageAction(
  formData: FormData,
): Promise<BrandListingImageResult> {
  const parsedInput = UploadSchema.safeParse({
    brandId: formData.get("brandId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID da marca inválido." };
  }

  const { file, brandId } = parsedInput.data;
  if (
    !LISTING_IMAGE_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof LISTING_IMAGE_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Formato não aceito. Use JPEG, PNG, GIF ou WebP.",
    };
  }
  if (file.size <= 0 || file.size > LISTING_IMAGE_MAX_FILE_SIZE) {
    return {
      success: false,
      error: "A imagem deve ter até 2 MB e não pode estar vazia.",
    };
  }

  try {
    const apiContext = await getAuthorizedBrandContext(brandId);
    if (!apiContext) {
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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: BRAND_GALLERY_ENTITY_TYPE,
      entityId: brandId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected brand listing image upload", {
        brandId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > BRAND_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Brand listing image has an invalid original URL", {
        brandId,
        assetId: result.id,
        imagePathLength: imagePath.length,
      });
      return {
        success: true,
        message: `${file.name} foi enviada com sucesso.`,
        warning:
          "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
      };
    }

    try {
      await updateBrandImagePath(brandId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Brand listing image uploaded but PATH_IMAGEM update failed",
        { brandId, assetId: result.id, error },
      );
      return {
        success: true,
        message: `${file.name} foi enviada com sucesso.`,
        warning:
          "A imagem foi enviada, mas não foi possível atualizar PATH_IMAGEM.",
      };
    }

    return {
      success: true,
      message: `${file.name} foi enviada e definida como imagem da marca.`,
    };
  } catch (error) {
    logger.error("Unexpected brand listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
