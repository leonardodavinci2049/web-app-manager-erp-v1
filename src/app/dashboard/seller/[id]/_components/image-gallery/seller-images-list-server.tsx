import { getSellerGalleryInitialState } from "./seller-image-gallery-server";
import { SellerImagesList } from "./seller-images-list";

interface SellerImagesListServerProps {
  sellerId: number;
  initialSellerImagePath: string;
}

export async function SellerImagesListServer({
  sellerId,
  initialSellerImagePath,
}: SellerImagesListServerProps) {
  const galleryState = await getSellerGalleryInitialState(sellerId);

  return (
    <SellerImagesList
      initialSellerImagePath={initialSellerImagePath}
      initialGalleryImages={galleryState.images}
    />
  );
}
