"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandImageGallery } from "./brand-image-gallery";
import type {
  BrandGalleryImage,
  BrandGalleryInitialState,
} from "./image-gallery-types";

interface BrandImageGalleryRefreshProps {
  brandId: number;
  brandName: string;
  initialState: BrandGalleryInitialState;
}

export function BrandImageGalleryRefresh({
  brandId,
  brandName,
  initialState,
}: BrandImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<BrandGalleryImage[]>(
    initialState.images,
  );
  const [totalImages, setTotalImages] = useState(initialState.totalImages);
  const [loadError, setLoadError] = useState(
    initialState.status === "error" ? initialState.error : null,
  );
  const [selectionRequest, setSelectionRequest] = useState({
    imageId: initialState.images.find((image) => image.isPrimary)?.id,
    version: 0,
  });

  useEffect(() => {
    if (initialState.status === "error") {
      setLoadError(initialState.error);
      return;
    }

    setImages(initialState.images);
    setTotalImages(initialState.totalImages);
    setLoadError(null);
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
    <BrandImageGallery
      images={images}
      totalImages={totalImages}
      brandName={brandName}
      brandId={brandId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
