"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import {
  FIELD_TYPE,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import { getSellerById } from "@/services/api-main/seller";
import type { SellerListingImageResult } from "../_components/types/seller-dashboard-types";

const logger = createLogger("SellerListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const SELLER_TABLE_NAME = "tbl_pessoa";
const SELLER_PRIMARY_KEY_FIELD = "ID_TBL_PESSOA";
const SELLER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const SELLER_IMAGE_PATH_MAX_LENGTH = 300;
const SELLER_GALLERY_ENTITY_TYPE = "SELLER";
const SELLER_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  sellerId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedSellerContext(sellerId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getSellerById(sellerId, apiContext);

  return result ? apiContext : null;
}

async function updateSellerImagePath(
  sellerId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    pe_table_name: SELLER_TABLE_NAME,
    pe_primary_key_field: SELLER_PRIMARY_KEY_FIELD,
    pe_register_id: sellerId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: SELLER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
    ...apiContext,
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

/**
 * Upload de uma unica imagem direto pela listagem de vendedores. Diferente da
 * galeria de detalhe, a nova imagem e' sempre enviada como principal
 * (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre regravado,
 * reparando o ponteiro mesmo quando a galeria ja possui outras imagens.
 */
export async function uploadSellerListingImageAction(
  formData: FormData,
): Promise<SellerListingImageResult> {
  const parsedInput = UploadSchema.safeParse({
    sellerId: formData.get("sellerId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do vendedor inválido." };
  }

  const { file, sellerId } = parsedInput.data;
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
    const apiContext = await getAuthorizedSellerContext(sellerId);
    if (!apiContext) {
      return {
        success: false,
        error: "Vendedor não encontrada ou inacessível.",
      };
    }

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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: SELLER_GALLERY_ENTITY_TYPE,
      entityId: sellerId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected seller listing image upload", {
        sellerId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > SELLER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Seller listing image has an invalid original URL", {
        sellerId,
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
      await updateSellerImagePath(sellerId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Seller listing image uploaded but PATH_IMAGEM update failed",
        { sellerId, assetId: result.id, error },
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
      message: `${file.name} foi enviada e definida como imagem do vendedor.`,
    };
  } catch (error) {
    logger.error("Unexpected seller listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
