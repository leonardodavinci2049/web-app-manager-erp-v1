import type { ReactNode } from "react";

interface ProductImagesTabProps {
  imagePathContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function ProductImagesTab({
  imagePathContent,
  mobileImageGallery,
}: ProductImagesTabProps) {
  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-[500px] lg:hidden">
        {mobileImageGallery}
      </div>
      {imagePathContent}
    </div>
  );
}
