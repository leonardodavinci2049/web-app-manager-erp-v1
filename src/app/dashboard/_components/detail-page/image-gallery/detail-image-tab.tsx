import type { ReactNode } from "react";

interface DetailImageTabProps {
  mobileGallery: ReactNode;
  children?: ReactNode;
}

/**
 * Common composition of the "Imagem" tab: the interactive gallery is shown
 * only below the `lg` breakpoint (the sticky desktop aside already renders
 * it), followed by the route-specific read-only image content.
 */
export function DetailImageTab({
  mobileGallery,
  children,
}: DetailImageTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mx-auto w-full max-w-[500px] lg:hidden">
        {mobileGallery}
      </div>
      {children}
    </div>
  );
}
