"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  SellerGalleryImage,
  SellerGalleryInitialState,
} from "./image-gallery-types";
import { SellerImageGallery } from "./seller-image-gallery";

interface SellerImageGalleryRefreshProps {
  sellerId: number;
  sellerName: string;
  initialState: SellerGalleryInitialState;
}

export function SellerImageGalleryRefresh({
  sellerId,
  sellerName,
  initialState,
}: SellerImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<SellerGalleryImage[]>(
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
    <SellerImageGallery
      images={images}
      totalImages={totalImages}
      sellerName={sellerName}
      sellerId={sellerId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
