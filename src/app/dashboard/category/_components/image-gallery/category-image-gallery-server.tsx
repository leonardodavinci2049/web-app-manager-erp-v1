import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import { isApiError } from "@/services/api-assets/types/api-assets";
import { CategoryImageGalleryRefresh } from "./category-image-gallery-refresh";
import { CATEGORY_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  CategoryGalleryImage,
  CategoryGalleryInitialState,
} from "./image-gallery-types";

const logger = createLogger("CategoryImageGalleryServer");

interface CategoryImageGalleryServerProps {
  categoryId: number;
  categoryName: string;
}

export const getCategoryGalleryInitialState = cache(
  async (categoryId: number): Promise<CategoryGalleryInitialState> => {
    let initialState: CategoryGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: CATEGORY_GALLERY_ENTITY_TYPE,
        entityId: categoryId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load category gallery", {
          categoryId,
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
          .map((image): CategoryGalleryImage | null => {
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
          .filter((image): image is CategoryGalleryImage => image !== null);

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
      logger.error("Unexpected category gallery load failure", error);
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

export async function CategoryImageGalleryServer({
  categoryId,
  categoryName,
}: CategoryImageGalleryServerProps) {
  const initialState = await getCategoryGalleryInitialState(categoryId);

  return (
    <CategoryImageGalleryRefresh
      categoryId={categoryId}
      categoryName={categoryName}
      initialState={initialState}
    />
  );
}
