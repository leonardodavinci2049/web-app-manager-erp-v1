import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { PURCHASING_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  PurchasingGalleryImage,
  PurchasingGalleryInitialState,
} from "./image-gallery-types";
import { PurchasingImageGalleryRefresh } from "./purchasing-image-gallery-refresh";

const logger = createLogger("PurchasingImageGalleryServer");

export const getPurchasingGalleryInitialState = cache(
  async (productId: number): Promise<PurchasingGalleryInitialState> => {
    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: PURCHASING_GALLERY_ENTITY_TYPE,
        entityId: productId.toString(),
      });
      if (isApiError(gallery)) {
        logger.warn("Failed to load purchasing product gallery", {
          productId,
          statusCode: gallery.statusCode,
          apiMessage: Array.isArray(gallery.message)
            ? gallery.message.join(", ")
            : gallery.message,
        });
        return {
          status: "error",
          images: [],
          totalImages: 0,
          error: "Não foi possível carregar a galeria de imagens.",
        };
      }

      const images = [...gallery.images]
        .sort((left, right) => {
          if (left.isPrimary !== right.isPrimary)
            return left.isPrimary ? -1 : 1;
          return left.displayOrder - right.displayOrder;
        })
        .map((image): PurchasingGalleryImage | null => {
          const original = image.urls.original?.trim();
          if (!original) return null;
          return {
            id: image.id,
            originalName: image.originalName,
            isPrimary: image.isPrimary,
            urls: {
              original,
              preview: image.urls.preview ?? image.urls.medium ?? original,
              thumbnail:
                image.urls.thumbnail ??
                image.urls.medium ??
                image.urls.preview ??
                original,
            },
          };
        })
        .filter((image): image is PurchasingGalleryImage => image !== null);

      return images.length > 0
        ? { status: "ready", images, totalImages: gallery.totalImages }
        : { status: "empty", images: [], totalImages: 0 };
    } catch (error) {
      logger.error("Unexpected purchasing gallery load failure", {
        productId,
        error,
      });
      return {
        status: "error",
        images: [],
        totalImages: 0,
        error: "Não foi possível carregar a galeria de imagens.",
      };
    }
  },
);

export async function PurchasingImageGalleryServer({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const initialState = await getPurchasingGalleryInitialState(productId);
  return (
    <PurchasingImageGalleryRefresh
      productId={productId}
      productName={productName}
      initialState={initialState}
    />
  );
}
