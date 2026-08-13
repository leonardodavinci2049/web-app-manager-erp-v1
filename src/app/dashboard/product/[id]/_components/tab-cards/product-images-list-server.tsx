import { getProductGalleryInitialState } from "../../_components/image-gallery/product-image-gallery-server";
import ProductImagesList from "./ProductImagesList";

interface ProductImagesListServerProps {
  productId: number;
  initialProductImagePath: string;
}

export async function ProductImagesListServer({
  productId,
  initialProductImagePath,
}: ProductImagesListServerProps) {
  const galleryState = await getProductGalleryInitialState(productId);

  return (
    <ProductImagesList
      productId={productId}
      initialProductImagePath={initialProductImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
