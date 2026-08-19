"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getCarrierById } from "@/services/api-main/carrier";
import {
  FIELD_TYPE,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import type { CarrierListingImageResult } from "../_components/types/carrier-dashboard-types";

const logger = createLogger("CarrierListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const CARRIER_TABLE_NAME = "tbl_transportadora";
const CARRIER_PRIMARY_KEY_FIELD = "ID_TRANSPORTADORA";
const CARRIER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const CARRIER_IMAGE_PATH_MAX_LENGTH = 300;
const CARRIER_GALLERY_ENTITY_TYPE = "CARRIER";
const CARRIER_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  carrierId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

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
    pe_table_name: CARRIER_TABLE_NAME,
    pe_primary_key_field: CARRIER_PRIMARY_KEY_FIELD,
    pe_register_id: carrierId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: CARRIER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
    ...apiContext,
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

/**
 * Upload de uma unica imagem direto pela listagem de transportadoras.
 * Diferente da galeria de detalhe, a nova imagem e' sempre enviada como
 * principal (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre
 * regravado, reparando o ponteiro mesmo quando a galeria ja possui outras
 * imagens.
 */
export async function uploadCarrierListingImageAction(
  formData: FormData,
): Promise<CarrierListingImageResult> {
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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: CARRIER_GALLERY_ENTITY_TYPE,
      entityId: carrierId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected carrier listing image upload", {
        carrierId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > CARRIER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Carrier listing image has an invalid original URL", {
        carrierId,
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
      await updateCarrierImagePath(carrierId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Carrier listing image uploaded but PATH_IMAGEM update failed",
        { carrierId, assetId: result.id, error },
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
      message: `${file.name} foi enviada e definida como imagem da transportadora.`,
    };
  } catch (error) {
    logger.error("Unexpected carrier listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
