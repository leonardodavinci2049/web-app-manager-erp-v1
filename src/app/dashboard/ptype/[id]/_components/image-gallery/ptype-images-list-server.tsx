import { getPtypeGalleryInitialState } from "./ptype-image-gallery-server";
import { PtypeImagesList } from "./ptype-images-list";

interface PtypeImagesListServerProps {
  ptypeId: number;
  initialPtypeImagePath: string;
}

export async function PtypeImagesListServer({
  ptypeId,
  initialPtypeImagePath,
}: PtypeImagesListServerProps) {
  const galleryState = await getPtypeGalleryInitialState(ptypeId);

  return (
    <PtypeImagesList
      initialPtypeImagePath={initialPtypeImagePath}
      initialGalleryImages={galleryState.images}
    />
  );
}
