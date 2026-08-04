"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  SupplierGalleryImage,
  SupplierGalleryInitialState,
} from "./image-gallery-types";
import { SupplierImageGallery } from "./supplier-image-gallery";

interface SupplierImageGalleryRefreshProps {
  supplierId: number;
  supplierName: string;
  initialState: SupplierGalleryInitialState;
}

export function SupplierImageGalleryRefresh({
  supplierId,
  supplierName,
  initialState,
}: SupplierImageGalleryRefreshProps) {
  const router = useRouter();
  const [images, setImages] = useState<SupplierGalleryImage[]>(
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
    <SupplierImageGallery
      images={images}
      totalImages={totalImages}
      supplierName={supplierName}
      supplierId={supplierId}
      loadError={loadError}
      selectionRequest={selectionRequest}
      onRefresh={refreshGallery}
    />
  );
}
