import type { ReactNode } from "react";
import { DetailBackLink } from "./detail-back-link";

interface DetailPageLayoutProps {
  returnTo: string;
  backLinkLabel: string;
  imageGallery: ReactNode;
  heading: ReactNode;
  overview: ReactNode;
  sectionsTitle: string;
  sectionsDescription?: string;
  children: ReactNode;
}

/**
 * Structural composition shared by registration detail pages: responsive
 * back link, sticky desktop gallery aside, record heading plus overview cards
 * on the right, and full-width tabs below. Domain content is injected as
 * typed React nodes; this component never knows the entity.
 */
export function DetailPageLayout({
  returnTo,
  backLinkLabel,
  imageGallery,
  heading,
  overview,
  sectionsTitle,
  sectionsDescription,
  children,
}: DetailPageLayoutProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <DetailBackLink href={returnTo} label={backLinkLabel} />

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          {imageGallery}
        </aside>

        {heading}
        {overview}
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h2 className="text-base font-semibold sm:text-lg">{sectionsTitle}</h2>
        {sectionsDescription ? (
          <p className="text-muted-foreground hidden text-sm sm:block">
            {sectionsDescription}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}
