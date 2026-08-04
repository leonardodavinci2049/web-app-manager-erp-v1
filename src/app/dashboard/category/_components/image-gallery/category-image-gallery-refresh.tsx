"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CategoryImageGallery } from "./category-image-gallery";
import type {
  CategoryGalleryImage,
  CategoryGalleryInitialState,
} from "./image-gallery-types";

interface CategoryImageGalleryRefreshProps {
  categoryId: number;
  categoryName: string;
  initialState: CategoryGalleryInitialState;
}

export function CategoryImageGalleryRefresh({
  categoryId,
  categoryName,
  initialState,
}: CategoryImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<CategoryGalleryImage[]>(
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
    <CategoryImageGallery
      images={images}
      totalImages={totalImages}
      categoryName={categoryName}
      categoryId={categoryId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
