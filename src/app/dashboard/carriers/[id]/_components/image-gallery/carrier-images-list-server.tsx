import { getCarrierGalleryInitialState } from "./carrier-image-gallery-server";
import { CarrierImagesList } from "./carrier-images-list";

interface CarrierImagesListServerProps {
  carrierId: number;
  initialCarrierImagePath: string;
}

export async function CarrierImagesListServer({
  carrierId,
  initialCarrierImagePath,
}: CarrierImagesListServerProps) {
  const galleryState = await getCarrierGalleryInitialState(carrierId);

  return (
    <CarrierImagesList
      initialCarrierImagePath={initialCarrierImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
