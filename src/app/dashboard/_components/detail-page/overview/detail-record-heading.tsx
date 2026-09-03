import type { ReactNode } from "react";

interface DetailRecordHeadingProps {
  mobileImage: ReactNode;
  title: ReactNode;
  metadata?: ReactNode;
}

/**
 * Compact record heading used by registration detail pages. The image is
 * rendered only below the `lg` breakpoint; on desktop the sticky gallery
 * aside is the single image surface.
 */
export function DetailRecordHeading({
  mobileImage,
  title,
  metadata,
}: DetailRecordHeadingProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="shrink-0 lg:hidden">{mobileImage}</div>
      <div className="min-w-0">
        {title}
        {metadata ? (
          <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
            {metadata}
          </div>
        ) : null}
      </div>
    </div>
  );
}
