import { getBrandGalleryInitialState } from "./brand-image-gallery-server";
import { BrandImagesList } from "./brand-images-list";

interface BrandImagesListServerProps {
  brandId: number;
  initialBrandImagePath: string;
}

export async function BrandImagesListServer({
  brandId,
  initialBrandImagePath,
}: BrandImagesListServerProps) {
  const galleryState = await getBrandGalleryInitialState(brandId);

  return (
    <BrandImagesList
      brandId={brandId}
      initialBrandImagePath={initialBrandImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
