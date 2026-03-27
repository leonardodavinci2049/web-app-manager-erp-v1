import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";
import { assetsApiService } from "@/services/api-assets/assets-api-service";
import type { GalleryImage } from "@/services/api-assets/types/api-assets";

/**
 * Fetch product image gallery from Assets API with cache
 * Uses 'use cache' for automatic caching and deduplication
 * Errors propagate to prevent caching failed responses
 */
export async function getProductGallery(
  productId: string,
): Promise<GalleryImage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.productGallery(productId));

  const response = await assetsApiService.getEntityGallery({
    entityType: "PRODUCT",
    entityId: productId,
  });

  // Check if response has images (successful response)
  if ("images" in response && Array.isArray(response.images)) {
    return response.images;
  }

  // No images
  return [];
}
