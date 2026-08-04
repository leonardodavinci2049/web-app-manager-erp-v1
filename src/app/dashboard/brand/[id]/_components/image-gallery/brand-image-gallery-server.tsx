import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { BrandImageGalleryRefresh } from "./brand-image-gallery-refresh";
import { BRAND_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  BrandGalleryImage,
  BrandGalleryInitialState,
} from "./image-gallery-types";

const logger = createLogger("BrandImageGalleryServer");

interface BrandImageGalleryServerProps {
  brandId: number;
  brandName: string;
}

export const getBrandGalleryInitialState = cache(
  async (brandId: number): Promise<BrandGalleryInitialState> => {
    let initialState: BrandGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: BRAND_GALLERY_ENTITY_TYPE,
        entityId: brandId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load brand gallery", {
          brandId,
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
          .map((image): BrandGalleryImage | null => {
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
          .filter((image): image is BrandGalleryImage => image !== null);

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
      logger.error("Unexpected brand gallery load failure", error);
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

export async function BrandImageGalleryServer({
  brandId,
  brandName,
}: BrandImageGalleryServerProps) {
  const initialState = await getBrandGalleryInitialState(brandId);

  return (
    <BrandImageGalleryRefresh
      brandId={brandId}
      brandName={brandName}
      initialState={initialState}
    />
  );
}
