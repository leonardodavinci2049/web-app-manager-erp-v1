import type { ReactNode } from "react";
import { DetailPageLayout } from "@/app/dashboard/_components/detail-page";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerHeadDataSection } from "./overview/seller-head-data-section";
import { SellerIdentitySection } from "./overview/seller-identity-section";
import { SellerPersonBusinessSections } from "./overview/seller-person-business-sections";
import { SellerPersonTypeSection } from "./overview/seller-person-type-section";
import { SellerDetailTabs } from "./tabs/seller-detail-tabs";

interface SellerDetailLayoutProps {
  seller: UISellerDetail;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

export function SellerDetailLayout({
  seller,
  returnTo,
  imageGallery,
  imageContent,
}: SellerDetailLayoutProps) {
  return (
    <DetailPageLayout
      returnTo={returnTo}
      backLinkLabel="Voltar aos vendedores"
      imageGallery={imageGallery}
      heading={<SellerHeadDataSection seller={seller} />}
      overview={
        <div className="space-y-3 sm:space-y-4">
          <SellerIdentitySection seller={seller} />

          <SellerPersonTypeSection
            sellerId={seller.id}
            personTypeId={seller.personTypeId}
          />

          <SellerPersonBusinessSections
            seller={seller}
            personTypeId={seller.personTypeId}
          />
        </div>
      }
      sectionsTitle="Seções do vendedor"
      sectionsDescription="Consulte e atualize os dados complementares do vendedor."
    >
      <SellerDetailTabs
        seller={seller}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
      />
    </DetailPageLayout>
  );
}
