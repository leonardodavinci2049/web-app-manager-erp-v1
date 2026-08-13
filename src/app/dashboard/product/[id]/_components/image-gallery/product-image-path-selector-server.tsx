import { getProductGalleryInitialState } from "./product-image-gallery-server";
import { ProductImagePathSelector } from "./product-image-path-selector";

interface ProductImagePathSelectorServerProps {
  productId: number;
  initialProductImagePath: string;
}

export async function ProductImagePathSelectorServer({
  productId,
  initialProductImagePath,
}: ProductImagePathSelectorServerProps) {
  const galleryState = await getProductGalleryInitialState(productId);

  return (
    <ProductImagePathSelector
      productId={productId}
      initialProductImagePath={initialProductImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
