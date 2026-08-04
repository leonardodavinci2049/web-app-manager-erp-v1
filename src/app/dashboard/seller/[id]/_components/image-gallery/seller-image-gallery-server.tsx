import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { SELLER_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  SellerGalleryImage,
  SellerGalleryInitialState,
} from "./image-gallery-types";
import { SellerImageGalleryRefresh } from "./seller-image-gallery-refresh";

const logger = createLogger("SellerImageGalleryServer");

interface SellerImageGalleryServerProps {
  sellerId: number;
  sellerName: string;
}

export const getSellerGalleryInitialState = cache(
  async (sellerId: number): Promise<SellerGalleryInitialState> => {
    let initialState: SellerGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: SELLER_GALLERY_ENTITY_TYPE,
        entityId: sellerId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load seller gallery", {
          sellerId,
          statusCode: gallery.statusCode,
          apiMessage: Array.isArray(gallery.message)
            ? gallery.message.join(", ")
            : gallery.message,
        });
        initialState = {
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
          .map((image): SellerGalleryImage | null => {
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
          .filter((image): image is SellerGalleryImage => image !== null);

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
      logger.error("Unexpected seller gallery load failure", error);
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

export async function SellerImageGalleryServer({
  sellerId,
  sellerName,
}: SellerImageGalleryServerProps) {
  const initialState = await getSellerGalleryInitialState(sellerId);

  return (
    <SellerImageGalleryRefresh
      sellerId={sellerId}
      sellerName={sellerName}
      initialState={initialState}
    />
  );
}
