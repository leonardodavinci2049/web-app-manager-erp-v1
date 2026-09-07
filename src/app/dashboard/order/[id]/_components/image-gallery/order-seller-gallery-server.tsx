import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  isApiError,
  isNotFoundApiError,
} from "@/services/api-assets/types/api-assets";
import type {
  OrderSellerGalleryImage,
  OrderSellerGalleryInitialState,
} from "./image-gallery-types";
import { OrderSellerGallery } from "./order-seller-gallery";

const logger = createLogger("OrderSellerGalleryServer");

const getOrderSellerGalleryInitialState = cache(
  async (sellerId: number): Promise<OrderSellerGalleryInitialState> => {
    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: "SELLER",
        entityId: sellerId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load seller gallery for sales order detail", {
          sellerId,
          statusCode: gallery.statusCode,
        });

        return isNotFoundApiError(gallery)
          ? { status: "empty", images: [], totalImages: 0 }
          : {
              status: "error",
              images: [],
              totalImages: 0,
              error: "Não foi possível carregar a galeria de imagens.",
            };
      }

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
        .map((image): OrderSellerGalleryImage | null => {
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
        .filter((image): image is OrderSellerGalleryImage => image !== null);

      return images.length === 0
        ? { status: "empty", images: [], totalImages: 0 }
        : { status: "ready", images, totalImages: gallery.totalImages };
    } catch (error) {
      logger.error("Unexpected sales order seller gallery load failure", {
        sellerId,
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

interface OrderSellerGalleryServerProps {
  sellerId: number;
  sellerName: string;
}

export async function OrderSellerGalleryServer({
  sellerId,
  sellerName,
}: OrderSellerGalleryServerProps) {
  const initialState = await getOrderSellerGalleryInitialState(sellerId);

  return (
    <OrderSellerGallery sellerName={sellerName} initialState={initialState} />
  );
}
