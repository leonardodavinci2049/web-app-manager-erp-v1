import type { ReactNode } from "react";

interface CustomerImageTabProps {
  imageContent: ReactNode;
  mobileImageGallery: ReactNode;
}

export function CustomerImageTab({
  imageContent,
  mobileImageGallery,
}: CustomerImageTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mx-auto w-full max-w-[500px] lg:hidden">
        {mobileImageGallery}
      </div>
      {imageContent}
    </div>
  );
}
