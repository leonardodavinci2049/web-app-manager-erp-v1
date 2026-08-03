"use client";

import { useState } from "react";
import { refreshProductGalleryAction } from "@/app/actions/action-product-images";
import {
  type GalleryImageWithId,
  ProductImageGallery,
} from "./ProductImageGallery";
import { DEFAULT_PRODUCT_IMAGE_URL } from "./product-image-gallery-constants";

interface ProductImageGalleryRefreshProps {
  productId: number;
  productName: string;
  initialImages: GalleryImageWithId[];
}

/**
 * ProductImageGalleryRefresh - Client Component wrapper for ProductImageGallery
 *
 * This component wraps ProductImageGallery and adds the ability to refresh
 * the gallery after a successful image upload by refetching from the API.
 *
 * It handles:
 * - Managing gallery state locally
 * - Refreshing the gallery after upload success
 * - Calling the API to get updated images
 */
export function ProductImageGalleryRefresh({
  productId,
  productName,
  initialImages,
}: ProductImageGalleryRefreshProps) {
  const [images, setImages] = useState<GalleryImageWithId[]>(initialImages);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [galleryVersion, setGalleryVersion] = useState(0);

  const handleImageUploadSuccess = async () => {
    setIsRefreshing(true);

    try {
      // Call Server Action to refresh gallery
      const data = await refreshProductGalleryAction(productId.toString());

      if (data.success && data.images) {
        // Update images with the new gallery
        setImages(
          data.images.length > 0
            ? data.images
            : [
                {
                  id: "fallback",
                  url: DEFAULT_PRODUCT_IMAGE_URL,
                  originalUrl: DEFAULT_PRODUCT_IMAGE_URL,
                  mediumUrl: DEFAULT_PRODUCT_IMAGE_URL,
                  previewUrl: DEFAULT_PRODUCT_IMAGE_URL,
                  isPrimary: false,
                },
              ],
        );
        setGalleryVersion((currentVersion) => currentVersion + 1);
      } else {
        // Keep existing images if refresh fails
        console.error("Gallery refresh failed:", data.error);
      }
    } catch (error) {
      // Keep existing images on error
      console.error("Error refreshing gallery:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProductImageGallery
      key={galleryVersion}
      images={images}
      productName={productName}
      productId={productId}
      onImageUploadSuccess={isRefreshing ? undefined : handleImageUploadSuccess}
    />
  );
}
