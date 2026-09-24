import { cache } from "react";
import { createLogger } from "@/core/logger";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import {
  isApiError,
  isNotFoundApiError,
} from "@/services/api-assets/types/api-assets";
import { SETTINGS_GALLERY_ENTITY_TYPE } from "./image-gallery-constants";
import type {
  SettingsGalleryImage,
  SettingsGalleryInitialState,
} from "./image-gallery-types";
import { SettingsImageGalleryRefresh } from "./settings-image-gallery-refresh";

const logger = createLogger("SettingsImageGalleryServer");

interface SettingsImageGalleryServerProps {
  configId: number;
  appName: string;
}

export const getSettingsGalleryInitialState = cache(
  async (configId: number): Promise<SettingsGalleryInitialState> => {
    try {
      const gallery = await assetsApiService.getEntityGallery({
        entityType: SETTINGS_GALLERY_ENTITY_TYPE,
        entityId: configId.toString(),
      });

      if (isApiError(gallery)) {
        logger.warn("Failed to load app configuration gallery", {
          configId,
          statusCode: gallery.statusCode,
          apiMessage: Array.isArray(gallery.message)
            ? gallery.message.join(", ")
            : gallery.message,
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
        .map((image): SettingsGalleryImage | null => {
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
        .filter((image): image is SettingsGalleryImage => image !== null);

      return images.length === 0
        ? { status: "empty", images: [], totalImages: 0 }
        : { status: "ready", images, totalImages: gallery.totalImages };
    } catch (error) {
      logger.error("Unexpected app configuration gallery load failure", error);
      return {
        status: "error",
        images: [],
        totalImages: 0,
        error: "Não foi possível carregar a galeria de imagens.",
      };
    }
  },
);

export async function SettingsImageGalleryServer({
  configId,
  appName,
}: SettingsImageGalleryServerProps) {
  const initialState = await getSettingsGalleryInitialState(configId);

  return (
    <SettingsImageGalleryRefresh
      configId={configId}
      appName={appName}
      initialState={initialState}
    />
  );
}
