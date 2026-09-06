"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  PurchasingGalleryImage,
  PurchasingGalleryInitialState,
} from "./image-gallery-types";
import { PurchasingImageGallery } from "./purchasing-image-gallery";

export function PurchasingImageGalleryRefresh({
  productId,
  productName,
  initialState,
}: {
  productId: number;
  productName: string;
  initialState: PurchasingGalleryInitialState;
}) {
  const router = useRouter();
  const [images, setImages] = useState<PurchasingGalleryImage[]>(
    initialState.images,
  );
  const [totalImages, setTotalImages] = useState(initialState.totalImages);
  const [loadError, setLoadError] = useState(
    initialState.status === "error" ? initialState.error : null,
  );

  useEffect(() => {
    setImages(initialState.images);
    setTotalImages(initialState.totalImages);
    setLoadError(initialState.status === "error" ? initialState.error : null);
  }, [initialState]);

  const refresh = useCallback(() => router.refresh(), [router]);

  return (
    <PurchasingImageGallery
      productId={productId}
      productName={productName}
      images={images}
      totalImages={totalImages}
      loadError={loadError}
      onRefresh={refresh}
    />
  );
}
