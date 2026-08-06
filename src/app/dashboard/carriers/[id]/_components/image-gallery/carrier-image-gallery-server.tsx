import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  isApiError,
  isNotFoundApiError,
} from "@/services/api-assets/types/api-assets";
import { CarrierImageGalleryRefresh } from "./carrier-image-gallery-refresh";
import { CARRIER_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  CarrierGalleryImage,
  CarrierGalleryInitialState,
} from "./image-gallery-types";

const logger = createLogger("CarrierImageGalleryServer");

interface CarrierImageGalleryServerProps {
  carrierId: number;
  carrierName: string;
}

export const getCarrierGalleryInitialState = cache(
  async (carrierId: number): Promise<CarrierGalleryInitialState> => {
    let initialState: CarrierGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: CARRIER_GALLERY_ENTITY_TYPE,
        entityId: carrierId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load carrier gallery", {
          carrierId,
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
          .map((image): CarrierGalleryImage | null => {
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
          .filter((image): image is CarrierGalleryImage => image !== null);

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
      logger.error("Unexpected carrier gallery load failure", error);
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

export async function CarrierImageGalleryServer({
  carrierId,
  carrierName,
}: CarrierImageGalleryServerProps) {
  const initialState = await getCarrierGalleryInitialState(carrierId);

  return (
    <CarrierImageGalleryRefresh
      carrierId={carrierId}
      carrierName={carrierName}
      initialState={initialState}
    />
  );
}
