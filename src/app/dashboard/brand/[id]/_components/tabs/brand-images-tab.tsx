import type { ReactNode } from "react";

interface BrandImagesTabProps {
  imageGallery: ReactNode;
  imageTabContent: ReactNode;
}

export function BrandImagesTab({
  imageGallery,
  imageTabContent,
}: BrandImagesTabProps) {
  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-[500px] lg:hidden">
        {imageGallery}
      </div>
      {imageTabContent}
    </div>
  );
}
