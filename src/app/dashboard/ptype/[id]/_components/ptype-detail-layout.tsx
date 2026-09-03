import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UIPtype } from "@/services/api-main/ptype";
import { PtypeDetailFormSection } from "./overview/ptype-detail-form-section";
import { PtypeHeadDataSection } from "./overview/ptype-head-data-section";
import { PtypeTypeDetailsSection } from "./overview/ptype-type-details-section";
import { PtypeDetailTabs } from "./tabs/ptype-detail-tabs";

interface PtypeDetailLayoutProps {
  item: UIPtype;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function PtypeDetailLayout({
  item,
  returnTo,
  imageGallery,
  imageContent,
}: PtypeDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar aos tipos"
      imageGallery={imageGallery}
      heading={<PtypeHeadDataSection item={item} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <PtypeTypeDetailsSection item={item} />
          <PtypeDetailFormSection key={item.id} item={item} />
        </div>
      }
      sectionsTitle="Seções do tipo de produto"
      sectionsDescription="Consulte e atualize os dados complementares do tipo de produto."
    >
      <PtypeDetailTabs
        item={item}
        returnTo={returnTo}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
