import { getSupplierGalleryInitialState } from "./supplier-image-gallery-server";
import { SupplierImagesList } from "./supplier-images-list";

interface SupplierImagesListServerProps {
  supplierId: number;
  initialSupplierImagePath: string;
}

export async function SupplierImagesListServer({
  supplierId,
  initialSupplierImagePath,
}: SupplierImagesListServerProps) {
  const galleryState = await getSupplierGalleryInitialState(supplierId);

  return (
    <SupplierImagesList
      initialSupplierImagePath={initialSupplierImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
