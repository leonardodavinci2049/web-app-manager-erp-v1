"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  SettingsGalleryImage,
  SettingsGalleryInitialState,
} from "./image-gallery-types";
import { SettingsImageGallery } from "./settings-image-gallery";

interface SettingsImageGalleryRefreshProps {
  configId: number;
  appName: string;
  initialState: SettingsGalleryInitialState;
}

export function SettingsImageGalleryRefresh({
  configId,
  appName,
  initialState,
}: SettingsImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<SettingsGalleryImage[]>(
    initialState.images,
  );
  const [totalImages, setTotalImages] = useState(initialState.totalImages);
  const [selectionRequest, setSelectionRequest] = useState({
    imageId: initialState.images.find((image) => image.isPrimary)?.id,
    version: 0,
  });

  useEffect(() => {
    setImages(initialState.images);
    setTotalImages(initialState.totalImages);
    setSelectionRequest((current) => ({
      ...current,
      version: current.version + 1,
    }));
  }, [initialState]);

  const refreshGallery = useCallback(
    (preferredImageId?: string) => {
      setSelectionRequest((current) => ({
        imageId: preferredImageId ?? current.imageId,
        version: current.version + 1,
      }));
      router.refresh();
    },
    [router],
  );

  return (
    <SettingsImageGallery
      configId={configId}
      appName={appName}
      images={images}
      totalImages={totalImages}
      loadError={initialState.status === "error" ? initialState.error : null}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
