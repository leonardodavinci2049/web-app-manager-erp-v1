import { getCategoryGalleryInitialState } from "./category-image-gallery-server";
import { CategoryImagesList } from "./category-images-list";

interface CategoryImagesListServerProps {
  categoryId: number;
  initialCategoryImagePath: string;
}

export async function CategoryImagesListServer({
  categoryId,
  initialCategoryImagePath,
}: CategoryImagesListServerProps) {
  const galleryState = await getCategoryGalleryInitialState(categoryId);

  return (
    <CategoryImagesList
      initialCategoryImagePath={initialCategoryImagePath}
      initialGalleryImages={galleryState.images}
      initialGalleryError={
        galleryState.status === "error" ? galleryState.error : null
      }
    />
  );
}
