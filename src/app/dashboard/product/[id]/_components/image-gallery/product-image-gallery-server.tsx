import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { PRODUCT_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  ProductGalleryImage,
  ProductGalleryInitialState,
} from "./image-gallery-types";
import { ProductImageGalleryRefresh } from "./product-image-gallery-refresh";

const logger = createLogger("ProductImageGalleryServer");

interface ProductImageGalleryServerProps {
  productId: number;
  productName: string;
}

export const getProductGalleryInitialState = cache(
  async (productId: number): Promise<ProductGalleryInitialState> => {
    let initialState: ProductGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: PRODUCT_GALLERY_ENTITY_TYPE,
        entityId: productId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load product gallery", {
          productId,
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
          .map((image): ProductGalleryImage | null => {
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
          .filter((image): image is ProductGalleryImage => image !== null);

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
      logger.error("Unexpected product gallery load failure", error);
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

export async function ProductImageGalleryServer({
  productId,
  productName,
}: ProductImageGalleryServerProps) {
  const initialState = await getProductGalleryInitialState(productId);

  return (
    <ProductImageGalleryRefresh
      productId={productId}
      productName={productName}
      initialState={initialState}
    />
  );
}

import { cache } from "react";
