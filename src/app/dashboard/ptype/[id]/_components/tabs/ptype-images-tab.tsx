import type { ReactNode } from "react";

interface PtypeImagesTabProps {
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function PtypeImagesTab({
  imageGallery,
  imageContent,
}: PtypeImagesTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mx-auto w-full max-w-[500px] lg:hidden">
        {imageGallery}
      </div>
      {imageContent}
    </div>
  );
}
