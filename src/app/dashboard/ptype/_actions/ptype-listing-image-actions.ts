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
import { getPtypeById } from "@/services/api-main/ptype";
import type { PtypeListingImageResult } from "../_components/types/ptype-dashboard-types";

const logger = createLogger("PtypeListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const PTYPE_TABLE_NAME = "tbl_produto_tipo";
const PTYPE_PRIMARY_KEY_FIELD = "ID_TIPO";
const PTYPE_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const PTYPE_IMAGE_PATH_MAX_LENGTH = 300;
const PTYPE_GALLERY_ENTITY_TYPE = "PTYPE";
const PTYPE_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  ptypeId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedPtypeContext(ptypeId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getPtypeById(ptypeId, apiContext);

  return result ? apiContext : null;
}

async function updatePtypeImagePath(
  ptypeId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    pe_table_name: PTYPE_TABLE_NAME,
    pe_primary_key_field: PTYPE_PRIMARY_KEY_FIELD,
    pe_register_id: ptypeId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: PTYPE_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
    ...apiContext,
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

/**
 * Upload de uma unica imagem direto pela listagem de tipos de produto.
 * Diferente da galeria de detalhe, a nova imagem e' sempre enviada como
 * principal (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre
 * regravado, reparando o ponteiro mesmo quando a galeria ja possui outras
 * imagens.
 */
export async function uploadPtypeListingImageAction(
  formData: FormData,
): Promise<PtypeListingImageResult> {
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
    const apiContext = await getAuthorizedPtypeContext(ptypeId);
    if (!apiContext) {
      return {
        success: false,
        error: "Tipo de produto não encontrada ou inacessível.",
      };
    }

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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: PTYPE_GALLERY_ENTITY_TYPE,
      entityId: ptypeId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected ptype listing image upload", {
        ptypeId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > PTYPE_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Ptype listing image has an invalid original URL", {
        ptypeId,
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
      await updatePtypeImagePath(ptypeId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Ptype listing image uploaded but PATH_IMAGEM update failed",
        { ptypeId, assetId: result.id, error },
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
      message: `${file.name} foi enviada e definida como imagem do tipo de produto.`,
    };
  } catch (error) {
    logger.error("Unexpected ptype listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
