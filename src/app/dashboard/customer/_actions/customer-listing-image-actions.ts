"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { getCustomerById } from "@/services/api-main/customer-general";
import {
  FIELD_TYPE,
  generalCallServiceApi,
} from "@/services/api-main/general-call";
import type { CustomerListingImageResult } from "../_components/types/customer-dashboard-types";

const logger = createLogger("CustomerListingImageActions");

const LISTING_IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024;
const LISTING_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const CUSTOMER_TABLE_NAME = "tbl_pessoa";
const CUSTOMER_PRIMARY_KEY_FIELD = "ID_TBL_PESSOA";
const CUSTOMER_IMAGE_PATH_FIELD = "PATH_IMAGEM";
const CUSTOMER_IMAGE_PATH_MAX_LENGTH = 300;
const CUSTOMER_GALLERY_ENTITY_TYPE = "CUSTOMER";
const CUSTOMER_GALLERY_LIMIT = 7;

const UploadSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  file: z.custom<File>((value) => value instanceof File, "Arquivo inválido"),
});

function getSafeApiLogMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

async function getAuthorizedCustomerContext(customerId: number) {
  const { apiContext } = await getAuthContext();
  const result = await getCustomerById(customerId, apiContext);

  return result ? apiContext : null;
}

async function updateCustomerImagePath(
  customerId: number,
  imagePath: string,
  apiContext: Awaited<ReturnType<typeof getAuthContext>>["apiContext"],
): Promise<void> {
  await generalCallServiceApi.updateTableInlineField({
    pe_table_name: CUSTOMER_TABLE_NAME,
    pe_primary_key_field: CUSTOMER_PRIMARY_KEY_FIELD,
    pe_register_id: customerId,
    pe_field_type: FIELD_TYPE.STRING,
    pe_field: CUSTOMER_IMAGE_PATH_FIELD,
    pe_value_str: imagePath,
    ...apiContext,
  });

  revalidatePath("/dashboard/customer");
  revalidatePath(`/dashboard/customer/${customerId}`);
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

/**
 * Upload de uma unica imagem direto pela listagem de clientes. Diferente da
 * galeria de detalhe, a nova imagem e' sempre enviada como principal
 * (`isPrimary` + `displayOrder` 1) e o `PATH_IMAGEM` e' sempre regravado,
 * reparando o ponteiro mesmo quando a galeria ja possui outras imagens.
 */
export async function uploadCustomerListingImageAction(
  formData: FormData,
): Promise<CustomerListingImageResult> {
  const parsedInput = UploadSchema.safeParse({
    customerId: formData.get("customerId"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return { success: false, error: "Arquivo ou ID do cliente inválido." };
  }

  const { file, customerId } = parsedInput.data;
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
    const apiContext = await getAuthorizedCustomerContext(customerId);
    if (!apiContext) {
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

    const result = await assetsApiService.uploadFile({
      file,
      entityType: CUSTOMER_GALLERY_ENTITY_TYPE,
      entityId: customerId.toString(),
      altText: `Imagem de ${file.name}`,
      isPrimary: true,
      displayOrder: 1,
    });

    if (isApiError(result)) {
      logger.warn("Assets API rejected customer listing image upload", {
        customerId,
        statusCode: result.statusCode,
        apiMessage: getSafeApiLogMessage(result.message),
      });
      return { success: false, error: "Não foi possível enviar esta imagem." };
    }

    const imagePath = result.urls.original.trim();
    if (!imagePath || imagePath.length > CUSTOMER_IMAGE_PATH_MAX_LENGTH) {
      logger.error("Customer listing image has an invalid original URL", {
        customerId,
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
      await updateCustomerImagePath(customerId, imagePath, apiContext);
    } catch (error) {
      logger.error(
        "Customer listing image uploaded but PATH_IMAGEM update failed",
        { customerId, assetId: result.id, error },
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
      message: `${file.name} foi enviada e definida como imagem do cliente.`,
    };
  } catch (error) {
    logger.error("Unexpected customer listing image upload failure", error);
    return { success: false, error: "Não foi possível enviar esta imagem." };
  }
}
