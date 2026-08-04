"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  ProductGalleryImage,
  ProductGalleryInitialState,
} from "./image-gallery-types";
import { ProductImageGallery } from "./product-image-gallery";

interface ProductImageGalleryRefreshProps {
  productId: number;
  productName: string;
  initialState: ProductGalleryInitialState;
}

export function ProductImageGalleryRefresh({
  productId,
  productName,
  initialState,
}: ProductImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<ProductGalleryImage[]>(
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
    <ProductImageGallery
      images={images}
      totalImages={totalImages}
      productName={productName}
      productId={productId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
