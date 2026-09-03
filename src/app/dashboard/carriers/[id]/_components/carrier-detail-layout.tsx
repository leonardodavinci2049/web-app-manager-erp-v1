import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierGeneralSection } from "./overview/carrier-general-section";
import { CarrierHeadDataSection } from "./overview/carrier-head-data-section";
import { CarrierPersonOverview } from "./overview/carrier-person-overview";
import { CarrierDetailTabs } from "./tabs/carrier-detail-tabs";

interface CarrierDetailLayoutProps {
  carrier: UICarrier;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function CarrierDetailLayout({
  carrier,
  returnTo,
  imageGallery,
  imageContent,
}: CarrierDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar às transportadoras"
      imageGallery={imageGallery}
      heading={<CarrierHeadDataSection carrier={carrier} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <CarrierGeneralSection carrier={carrier} />
          <CarrierPersonOverview carrier={carrier} />
        </div>
      }
      sectionsTitle="Seções da transportadora"
      sectionsDescription="Consulte os dados complementares e acesse as ações da transportadora."
    >
      <CarrierDetailTabs
        carrier={carrier}
        returnTo={returnTo}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
