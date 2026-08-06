import { getCustomerGalleryInitialState } from "./customer-image-gallery-server";
import { CustomerImagesList } from "./customer-images-list";

interface CustomerImagesListServerProps {
  customerId: number;
  initialCustomerImagePath: string;
}

export async function CustomerImagesListServer({
  customerId,
  initialCustomerImagePath,
}: CustomerImagesListServerProps) {
  const galleryState = await getCustomerGalleryInitialState(customerId);

  return (
    <CustomerImagesList
      initialCustomerImagePath={initialCustomerImagePath}
      initialGalleryImages={galleryState.images}
    />
  );
}
