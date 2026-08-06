import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  isApiError,
  isNotFoundApiError,
} from "@/services/api-assets/types/api-assets";
import { SUPPLIERS_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  SupplierGalleryImage,
  SupplierGalleryInitialState,
} from "./image-gallery-types";
import { SupplierImageGalleryRefresh } from "./supplier-image-gallery-refresh";

const logger = createLogger("SupplierImageGalleryServer");

interface SupplierImageGalleryServerProps {
  supplierId: number;
  supplierName: string;
}

export const getSupplierGalleryInitialState = cache(
  async (supplierId: number): Promise<SupplierGalleryInitialState> => {
    let initialState: SupplierGalleryInitialState;

    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: SUPPLIERS_GALLERY_ENTITY_TYPE,
        entityId: supplierId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load supplier gallery", {
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
          .map((image): SupplierGalleryImage | null => {
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
          .filter((image): image is SupplierGalleryImage => image !== null);

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
      logger.error("Unexpected supplier gallery load failure", error);
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

export async function SupplierImageGalleryServer({
  supplierId,
  supplierName,
}: SupplierImageGalleryServerProps) {
  const initialState = await getSupplierGalleryInitialState(supplierId);

  return (
    <SupplierImageGalleryRefresh
      supplierId={supplierId}
      supplierName={supplierName}
      initialState={initialState}
    />
  );
}
