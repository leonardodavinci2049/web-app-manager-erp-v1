"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CustomerImageGallery } from "./customer-image-gallery";
import type {
  CustomerGalleryImage,
  CustomerGalleryInitialState,
} from "./image-gallery-types";

interface CustomerImageGalleryRefreshProps {
  customerId: number;
  customerName: string;
  initialState: CustomerGalleryInitialState;
}

export function CustomerImageGalleryRefresh({
  customerId,
  customerName,
  initialState,
}: CustomerImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<CustomerGalleryImage[]>(
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
    <CustomerImageGallery
      images={images}
      totalImages={totalImages}
      customerName={customerName}
      customerId={customerId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
