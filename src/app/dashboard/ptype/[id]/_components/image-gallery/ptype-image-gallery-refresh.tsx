"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  PtypeGalleryImage,
  PtypeGalleryInitialState,
} from "./image-gallery-types";
import { PtypeImageGallery } from "./ptype-image-gallery";

interface PtypeImageGalleryRefreshProps {
  ptypeId: number;
  ptypeName: string;
  initialState: PtypeGalleryInitialState;
}

export function PtypeImageGalleryRefresh({
  ptypeId,
  ptypeName,
  initialState,
}: PtypeImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<PtypeGalleryImage[]>(
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
    <PtypeImageGallery
      images={images}
      totalImages={totalImages}
      ptypeName={ptypeName}
      ptypeId={ptypeId}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
