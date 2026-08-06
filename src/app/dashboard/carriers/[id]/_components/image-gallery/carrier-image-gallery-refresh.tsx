"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CarrierImageGallery } from "./carrier-image-gallery";
import type {
  CarrierGalleryImage,
  CarrierGalleryInitialState,
} from "./image-gallery-types";

interface CarrierImageGalleryRefreshProps {
  carrierId: number;
  carrierName: string;
  initialState: CarrierGalleryInitialState;
}

export function CarrierImageGalleryRefresh({
  carrierId,
  carrierName,
  initialState,
}: CarrierImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<CarrierGalleryImage[]>(
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
    <CarrierImageGallery
      images={images}
      totalImages={totalImages}
      carrierName={carrierName}
      carrierId={carrierId}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
