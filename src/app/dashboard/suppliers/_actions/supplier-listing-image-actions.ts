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
import { getSupplierById } from "@/services/api-main/supplier";
import type { SupplierListingImageResult } from "../_components/types/supplier-dashboard-types";

const logger = createLogger("SupplierListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const SUPPLIER_TABLE_NAME = "tbl_fornecedor";
const SUPPLIER_PRIMARY_KEY_FIELD = "ID_FORNECEDOR";
const SUPPLIER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const SUPPLIER_IMAGE_PATH_MAX_LENGTH = 300;
const SUPPLIERS_GALLERY_ENTITY_TYPE = "SUPPLIERS";
const SUPPLIERS_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedSupplierContext(supplierId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getSupplierById(supplierId, apiContext);

  return result ? apiContext : null;
}

async function updateSupplierImagePath(
  supplierId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    pe_table_name: SUPPLIER_TABLE_NAME,
    pe_primary_key_field: SUPPLIER_PRIMARY_KEY_FIELD,
    pe_register_id: supplierId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: SUPPLIER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
    ...apiContext,
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

/**
 * Upload de uma unica imagem direto pela listagem de fornecedores. Diferente
 * da galeria de detalhe, a nova imagem e' sempre enviada como principal
 * (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre regravado,
 * reparando o ponteiro mesmo quando a galeria ja possui outras imagens.
 */
export async function uploadSupplierListingImageAction(
  formData: FormData,
): Promise<SupplierListingImageResult> {
  const parsedInput = UploadSchema.safeParse({
    supplierId: formData.get("supplierId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do fornecedor inválido." };
  }

  const { file, supplierId } = parsedInput.data;
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
    const apiContext = await getAuthorizedSupplierContext(supplierId);
    if (!apiContext) {
      return {
        success: false,
        error: "Fornecedor não encontrada ou inacessível.",
      };
    }

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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
      entityId: supplierId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected supplier listing image upload", {
        supplierId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > SUPPLIER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Supplier listing image has an invalid original URL", {
        supplierId,
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
      await updateSupplierImagePath(supplierId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Supplier listing image uploaded but PATH_IMAGEM update failed",
        { supplierId, assetId: result.id, error },
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
      message: `${file.name} foi enviada e definida como imagem do fornecedor.`,
    };
  } catch (error) {
    logger.error("Unexpected supplier listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
