import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  isApiError,
  isNotFoundApiError,
} from "@/services/api-assets/types/api-assets";
import { EntryImageGallery } from "./entry-image-gallery";
import { ENTRY_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  EntryGalleryImage,
  EntryGalleryInitialState,
} from "./image-gallery-types";

const logger = createLogger("EntryImageGalleryServer");

export const getEntryGalleryInitialState = cache(
  async (supplierId: number): Promise<EntryGalleryInitialState> => {
    let initialState: EntryGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: ENTRY_GALLERY_ENTITY_TYPE,
        entityId: supplierId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load supplier gallery for entry detail", {
          supplierId,
          statusCode: gallery.statusCode,
          apiMessage: Array.isArray(gallery.message)
            ? gallery.message.join(", ")
            : gallery.message,
        });
        initialState = isNotFoundApiError(gallery)
          ? { status: "empty", images: [], totalImages: 0 }
          : {
              status: "error",
              images: [],
              totalImages: 0,
              error: "Não foi possível carregar a galeria de imagens.",
            };
      } else {
        const images = [...gallery.images]
          .sort((left, right) => {
            if (left.isPrimary !== right.isPrimary) {
              return left.isPrimary ? -1 : 1;
            }
            if (left.displayOrder !== right.displayOrder) {
              return left.displayOrder - right.displayOrder;
            }
            return (
              new Date(right.uploadedAt).getTime() -
              new Date(left.uploadedAt).getTime()
            );
          })
          .map((image): EntryGalleryImage | null => {
            const original = image.urls.original?.trim();
            if (!original) return null;
            return {
              id: image.id,
              originalName: image.originalName,
              uploadedAt: image.uploadedAt,
              displayOrder: image.displayOrder,
              isPrimary: image.isPrimary,
              urls: {
                original,
                preview: image.urls.preview ?? image.urls.medium ?? original,
                medium: image.urls.medium ?? image.urls.preview ?? original,
                thumbnail:
                  image.urls.thumbnail ??
                  image.urls.medium ??
                  image.urls.preview ??
                  original,
              },
            };
          })
          .filter((image): image is EntryGalleryImage => image !== null);

        initialState =
          images.length === 0
            ? { status: "empty", images: [], totalImages: 0 }
            : {
                status: "ready",
                images,
                totalImages: gallery.totalImages,
              };
      }
    } catch (error) {
      logger.error("Unexpected entry gallery load failure", error);
      initialState = {
        status: "error",
        images: [],
        totalImages: 0,
        error: "Não foi possível carregar a galeria de imagens.",
      };
    }

    return initialState;
  },
);

interface EntryImageGalleryServerProps {
  supplierId: number;
  supplierName: string;
}

export async function EntryImageGalleryServer({
  supplierId,
  supplierName,
}: EntryImageGalleryServerProps) {
  const initialState = await getEntryGalleryInitialState(supplierId);

  return (
    <EntryImageGallery
      supplierName={supplierName}
      initialState={initialState}
    />
  );
}
